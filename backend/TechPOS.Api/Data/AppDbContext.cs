using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Models;

namespace TechPOS.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<User>().HasIndex(x => x.Role);
        modelBuilder.Entity<User>().Property(x => x.Role).HasMaxLength(80);

        modelBuilder.Entity<Role>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<Role>().Property(x => x.Name).HasMaxLength(80);
        modelBuilder.Entity<Permission>().HasIndex(x => x.Code).IsUnique();
        modelBuilder.Entity<Permission>().Property(x => x.Code).HasMaxLength(120);
        modelBuilder.Entity<Permission>().Property(x => x.Module).HasMaxLength(80);

        modelBuilder.Entity<RolePermission>().HasKey(x => new { x.RoleId, x.PermissionId });
        modelBuilder.Entity<RolePermission>()
            .HasOne(x => x.Role)
            .WithMany(x => x.RolePermissions)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<RolePermission>()
            .HasOne(x => x.Permission)
            .WithMany(x => x.RolePermissions)
            .HasForeignKey(x => x.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Category>().HasIndex(c => c.Name).IsUnique();
        modelBuilder.Entity<Product>().HasIndex(p => p.Sku).IsUnique();
        modelBuilder.Entity<Product>().Property(p => p.PurchasePrice).HasPrecision(18, 2);
        modelBuilder.Entity<Product>().Property(p => p.SellingPrice).HasPrecision(18, 2);
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockTransaction>()
            .HasOne(s => s.Product)
            .WithMany(p => p.StockTransactions)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<StockTransaction>().Property(s => s.Type).HasConversion<string>();
        modelBuilder.Entity<StockTransaction>().HasIndex(s => s.ProductId);
        modelBuilder.Entity<StockTransaction>().HasIndex(s => s.CreatedAt);
    }
}
