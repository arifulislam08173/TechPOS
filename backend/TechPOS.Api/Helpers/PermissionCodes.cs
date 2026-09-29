namespace TechPOS.Api.Helpers;

public static class PermissionCodes
{
    public const string DashboardView = "dashboard.view";
    public const string ProductsView = "products.view";
    public const string ProductsManage = "products.manage";
    public const string CategoriesView = "categories.view";
    public const string CategoriesManage = "categories.manage";
    public const string InventoryView = "inventory.view";
    public const string InventoryManage = "inventory.manage";
    public const string UsersView = "users.view";
    public const string UsersManage = "users.manage";
    public const string RolesView = "roles.view";
    public const string RolesManage = "roles.manage";
    public const string SalesView = "sales.view";
    public const string SalesManage = "sales.manage";
    public const string ReportsView = "reports.view";

    public static readonly IReadOnlyList<PermissionDefinition> All =
        new PermissionDefinition[]
    {
        new(DashboardView, "View dashboard", "Dashboard", "View operational dashboard widgets."),
        new(ProductsView, "View products", "Products", "View product catalog and product details."),
        new(ProductsManage, "Manage products", "Products", "Create, edit and deactivate products."),
        new(CategoriesView, "View categories", "Categories", "View product categories."),
        new(CategoriesManage, "Manage categories", "Categories", "Create, edit and remove categories."),
        new(InventoryView, "View inventory", "Inventory", "View stock balances and inventory history."),
        new(InventoryManage, "Manage inventory", "Inventory", "Create stock-in, stock-out and adjustment operations."),
        new(UsersView, "View users", "Administration", "View system users."),
        new(UsersManage, "Manage users", "Administration", "Create, edit, deactivate and reset passwords for users."),
        new(RolesView, "View roles", "Administration", "View roles and permission assignments."),
        new(RolesManage, "Manage roles", "Administration", "Create and update roles and their permissions."),
        new(SalesView, "View sales", "Sales", "View sales and invoices when the POS module is enabled."),
        new(SalesManage, "Manage sales", "Sales", "Create and manage POS sales when the POS module is enabled."),
        new(ReportsView, "View reports", "Reports", "View business and inventory reports.")
    };
}

public sealed record PermissionDefinition(string Code, string Name, string Module, string Description);
