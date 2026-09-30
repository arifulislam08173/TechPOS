import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PagedResult } from '../../types/api'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

type OptionValue = string | number

type PageRequest = {
  page: number
  pageSize: number
  search?: string
}

type Props<T, TValue extends OptionValue> = {
  queryKey: readonly unknown[]
  value?: TValue | null
  onChange: (value: TValue | undefined, option?: T) => void
  loadPage: (request: PageRequest) => Promise<PagedResult<T>>
  getOptionValue: (option: T) => TValue
  getOptionLabel: (option: T) => string
  placeholder?: string
  searchPlaceholder?: string
  selectedLabel?: string
  disabled?: boolean
  allowClear?: boolean
  pageSize?: number
}

export function RemoteSearchSelect<T, TValue extends OptionValue>({
  queryKey,
  value,
  onChange,
  loadPage,
  getOptionValue,
  getOptionLabel,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search…',
  selectedLabel,
  disabled = false,
  allowClear = false,
  pageSize = 10,
}: Props<T, TValue>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOption, setSelectedOption] = useState<T | undefined>()
  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const result = useQuery({
    queryKey: [...queryKey, debouncedSearch, page, pageSize],
    queryFn: () => loadPage({
      page,
      pageSize,
      search: debouncedSearch.trim() || undefined,
    }),
    enabled: open,
    placeholderData: keepPreviousData,
  })

  const displayLabel = useMemo(() => {
    if (selectedOption && getOptionValue(selectedOption) === value) return getOptionLabel(selectedOption)
    if (value !== undefined && value !== null && selectedLabel) return selectedLabel
    return ''
  }, [getOptionLabel, getOptionValue, selectedLabel, selectedOption, value])

  const selectOption = (option: T) => {
    setSelectedOption(option)
    onChange(getOptionValue(option), option)
    setOpen(false)
    setSearch('')
    setPage(1)
  }

  const clearSelection = () => {
    setSelectedOption(undefined)
    onChange(undefined)
    setSearch('')
    setPage(1)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <span className={displayLabel ? 'truncate text-slate-900' : 'truncate text-slate-400'}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {allowClear && value !== undefined && value !== null && (
              <button
                type="button"
                onClick={clearSelection}
                className="mb-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-50"
              >
                Clear selection
              </button>
            )}

            {result.isFetching && !result.data ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                <Loader2 className="animate-spin" size={17} /> Loading options…
              </div>
            ) : result.data?.items.length ? (
              result.data.items.map((option) => {
                const optionValue = getOptionValue(option)
                const active = optionValue === value
                return (
                  <button
                    key={String(optionValue)}
                    type="button"
                    onClick={() => selectOption(option)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span className="min-w-0 truncate">{getOptionLabel(option)}</span>
                    {active && <Check size={15} className="shrink-0" />}
                  </button>
                )
              })
            ) : (
              <div className="py-10 text-center text-sm text-slate-400">No matching options found.</div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">
              {result.data ? `${result.data.totalItems} result(s) · Page ${result.data.page} of ${Math.max(result.data.totalPages, 1)}` : 'Search is processed by the server'}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={page <= 1 || result.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                aria-label="Previous option page"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                disabled={!result.data || page >= result.data.totalPages || result.isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                aria-label="Next option page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
