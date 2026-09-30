import {
  Boxes,
  FolderTree,
  Gauge,
  LogOut,
  PackageOpen,
  ShoppingCart,
  ReceiptText,
  BarChart3,
  ShieldCheck,
  UserCircle,
  Users,
  Warehouse,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'

type NavItem = { to: string; label: string; icon: typeof Gauge; permission?: string }

const workspace: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/products', label: 'Products', icon: Boxes, permission: Permissions.productsView },
  { to: '/categories', label: 'Categories', icon: FolderTree, permission: Permissions.categoriesView },
  { to: '/inventory', label: 'Inventory', icon: Warehouse, permission: Permissions.inventoryView },
  { to: '/pos', label: 'Point of sale', icon: ShoppingCart, permission: Permissions.salesManage },
  { to: '/sales', label: 'Sales', icon: ReceiptText, permission: Permissions.salesView },
  { to: '/reports', label: 'Reports', icon: BarChart3, permission: Permissions.reportsView },
]

const administration: NavItem[] = [
  { to: '/users', label: 'Users', icon: Users, permission: Permissions.usersView },
  { to: '/roles', label: 'Roles & permissions', icon: ShieldCheck, permission: Permissions.rolesView },
]

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { user, logout, hasPermission } = useAuth()

  const renderItems = (items: NavItem[]) =>
    items
      .filter((item) => !item.permission || hasPermission(item.permission))
      .map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))

  const adminItems = administration.filter((item) => !item.permission || hasPermission(item.permission))

  const content = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white">
          <PackageOpen size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">TechPOS</p>
          <p className="text-[11px] text-slate-500">Retail operations</p>
        </div>
        <button onClick={onClose} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Workspace</p>
        <div className="space-y-1">{renderItems(workspace)}</div>

        {adminItems.length > 0 && (
          <>
            <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Administration</p>
            <div className="space-y-1">{renderItems(administration)}</div>
          </>
        )}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `mb-2 flex items-center gap-3 rounded-xl px-3 py-3 transition ${isActive ? 'bg-blue-50' : 'bg-slate-50 hover:bg-slate-100'}`
          }
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
            <UserCircle size={19} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{user?.fullName}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user?.role}</p>
          </div>
        </NavLink>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{content}</div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" onClick={onClose} className="absolute inset-0 bg-slate-950/25" />
          <div className="relative h-full w-64 shadow-xl">{content}</div>
        </div>
      )}
    </>
  )
}
