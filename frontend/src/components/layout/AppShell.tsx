import { Menu, PackageOpen, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { user } = useAuth()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setNavOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600">
              <Menu size={18} />
            </button>
            <PackageOpen size={20} className="text-blue-600" />
            <span className="font-semibold">TechPOS</span>
          </div>
          <Link to="/profile" className="ml-auto flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500">
              <UserCircle size={19} />
            </div>
          </Link>
        </header>
        <main className="px-6 pb-10 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
