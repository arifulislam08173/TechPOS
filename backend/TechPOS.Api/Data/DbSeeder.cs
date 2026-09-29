using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Helpers;
using TechPOS.Api.Models;

namespace TechPOS.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

        foreach (var item in PermissionCodes.All)
        {
            var permission = await db.Permissions.FirstOrDefaultAsync(x => x.Code == item.Code);
            if (permission is null)
            {
                db.Permissions.Add(new Permission
                {
                    Code = item.Code,
                    Name = item.Name,
                    Module = item.Module,
                    Description = item.Description
                });
            }
            else
            {
                permission.Name = item.Name;
                permission.Module = item.Module;
                permission.Description = item.Description;
            }
        }
        await db.SaveChangesAsync();

        var adminRole = await db.Roles.FirstOrDefaultAsync(x => x.Name == "Admin");
        if (adminRole is null)
        {
            adminRole = new Role
            {
                Name = "Admin",
                Description = "System administrator with full access.",
                IsSystem = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Roles.Add(adminRole);
            await db.SaveChangesAsync();
        }

        var allPermissionIds = await db.Permissions.Select(x => x.Id).ToListAsync();
        var adminExisting = await db.RolePermissions
            .Where(x => x.RoleId == adminRole.Id)
            .Select(x => x.PermissionId)
            .ToListAsync();
        foreach (var permissionId in allPermissionIds.Except(adminExisting))
            db.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = permissionId });

        var cashierRole = await db.Roles.FirstOrDefaultAsync(x => x.Name == "Cashier");
        if (cashierRole is null)
        {
            cashierRole = new Role
            {
                Name = "Cashier",
                Description = "Front-desk role with catalog, inventory visibility and POS access.",
                IsSystem = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Roles.Add(cashierRole);
            await db.SaveChangesAsync();

            var cashierCodes = new[]
            {
                PermissionCodes.DashboardView,
                PermissionCodes.ProductsView,
                PermissionCodes.CategoriesView,
                PermissionCodes.InventoryView,
                PermissionCodes.SalesView,
                PermissionCodes.SalesManage
            };
            var cashierPermissionIds = await db.Permissions
                .Where(x => cashierCodes.Contains(x.Code))
                .Select(x => x.Id)
                .ToListAsync();
            foreach (var permissionId in cashierPermissionIds)
                db.RolePermissions.Add(new RolePermission { RoleId = cashierRole.Id, PermissionId = permissionId });
        }

        await db.SaveChangesAsync();

        var email = configuration["SeedAdmin:Email"]?.Trim().ToLowerInvariant();
        var password = configuration["SeedAdmin:Password"];
        var fullName = configuration["SeedAdmin:FullName"]?.Trim() ?? "TechPOS Administrator";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (user is null)
        {
            user = new User
            {
                FullName = fullName,
                Email = email,
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            user.PasswordHash = passwordHasher.HashPassword(user, password);
            db.Users.Add(user);
        }
        else if (user.Role == "Admin")
        {
            user.IsActive = true;
        }

        await db.SaveChangesAsync();
    }
}
