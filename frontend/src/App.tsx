import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PermissionRoute } from './auth/PermissionRoute'
import { Permissions } from './auth/permissions'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { CategoriesPage } from './pages/categories/CategoriesPage'
import { CategoryDetailsPage } from './pages/categories/CategoryDetailsPage'
import { CategoryFormPage } from './pages/categories/CategoryFormPage'
import { DashboardPage } from './pages/DashboardPage'
import { InventoryDetailsPage } from './pages/inventory/InventoryDetailsPage'
import { InventoryPage } from './pages/inventory/InventoryPage'
import { StockOperationPage } from './pages/inventory/StockOperationPage'
import { LoginPage } from './pages/LoginPage'
import { ProductDetailsPage } from './pages/products/ProductDetailsPage'
import { ProductFormPage } from './pages/products/ProductFormPage'
import { ProductsPage } from './pages/products/ProductsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { RoleFormPage } from './pages/roles/RoleFormPage'
import { RolesPage } from './pages/roles/RolesPage'
import { PosPage } from './pages/sales/PosPage'
import { SaleDetailsPage } from './pages/sales/SaleDetailsPage'
import { SalesPage } from './pages/sales/SalesPage'
import { UserFormPage } from './pages/users/UserFormPage'
import { UsersPage } from './pages/users/UsersPage'

const permit = (permission: string, element: ReactNode) => (
  <PermissionRoute permission={permission}>{element}</PermissionRoute>
)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />

        <Route path="products" element={permit(Permissions.productsView, <ProductsPage />)} />
        <Route path="products/new" element={permit(Permissions.productsManage, <ProductFormPage />)} />
        <Route path="products/:id" element={permit(Permissions.productsView, <ProductDetailsPage />)} />
        <Route path="products/:id/edit" element={permit(Permissions.productsManage, <ProductFormPage />)} />

        <Route path="categories" element={permit(Permissions.categoriesView, <CategoriesPage />)} />
        <Route path="categories/new" element={permit(Permissions.categoriesManage, <CategoryFormPage />)} />
        <Route path="categories/:id" element={permit(Permissions.categoriesView, <CategoryDetailsPage />)} />
        <Route path="categories/:id/edit" element={permit(Permissions.categoriesManage, <CategoryFormPage />)} />

        <Route path="inventory" element={permit(Permissions.inventoryView, <InventoryPage />)} />
        <Route path="inventory/new" element={permit(Permissions.inventoryManage, <StockOperationPage />)} />
        <Route path="inventory/:id" element={permit(Permissions.inventoryView, <InventoryDetailsPage />)} />

        <Route path="pos" element={permit(Permissions.salesManage, <PosPage />)} />
        <Route path="sales" element={permit(Permissions.salesView, <SalesPage />)} />
        <Route path="sales/:id" element={permit(Permissions.salesView, <SaleDetailsPage />)} />
        <Route path="reports" element={permit(Permissions.reportsView, <ReportsPage />)} />

        <Route path="users" element={permit(Permissions.usersView, <UsersPage />)} />
        <Route path="users/new" element={permit(Permissions.usersManage, <UserFormPage />)} />
        <Route path="users/:id/edit" element={permit(Permissions.usersManage, <UserFormPage />)} />

        <Route path="roles" element={permit(Permissions.rolesView, <RolesPage />)} />
        <Route path="roles/new" element={permit(Permissions.rolesManage, <RoleFormPage />)} />
        <Route path="roles/:id/edit" element={permit(Permissions.rolesManage, <RoleFormPage />)} />

        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
