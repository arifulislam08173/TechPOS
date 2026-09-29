export const Permissions = {
  dashboardView: 'dashboard.view',
  productsView: 'products.view',
  productsManage: 'products.manage',
  categoriesView: 'categories.view',
  categoriesManage: 'categories.manage',
  inventoryView: 'inventory.view',
  inventoryManage: 'inventory.manage',
  usersView: 'users.view',
  usersManage: 'users.manage',
  rolesView: 'roles.view',
  rolesManage: 'roles.manage',
  salesView: 'sales.view',
  salesManage: 'sales.manage',
  reportsView: 'reports.view',
} as const

export type PermissionCode = (typeof Permissions)[keyof typeof Permissions]
