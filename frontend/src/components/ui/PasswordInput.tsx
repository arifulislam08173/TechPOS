import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { forwardRef, useState, type InputHTMLAttributes } from 'react'

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput({ className = '', ...props }, ref) {
    const [visible, setVisible] = useState(false)
    return (
      <div className="relative">
        <LockKeyhole className="absolute left-3 top-3 text-slate-400" size={17} />
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    )
  },
)
