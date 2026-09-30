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
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();

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
        modelBuilder.Entity<StockTransaction>().HasIndex(s => new { s.ReferenceType, s.ReferenceId });

        modelBuilder.Entity<Sale>().HasIndex(s => s.InvoiceNumber).IsUnique();
        modelBuilder.Entity<Sale>().HasIndex(s => s.CreatedAt);
        modelBuilder.Entity<Sale>().HasIndex(s => s.CashierId);
        modelBuilder.Entity<Sale>().Property(s => s.InvoiceNumber).HasMaxLength(50);
        modelBuilder.Entity<Sale>().Property(s => s.Subtotal).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>().Property(s => s.DiscountAmount).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>().Property(s => s.GrandTotal).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>().Property(s => s.AmountPaid).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>().Property(s => s.ChangeAmount).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>().Property(s => s.PaymentMethod).HasConversion<string>().HasMaxLength(30);
        modelBuilder.Entity<Sale>()
            .HasOne(s => s.Cashier)
            .WithMany()
            .HasForeignKey(s => s.CashierId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SaleItem>().HasIndex(i => i.SaleId);
        modelBuilder.Entity<SaleItem>().HasIndex(i => i.ProductId);
        modelBuilder.Entity<SaleItem>().Property(i => i.ProductName).HasMaxLength(150);
        modelBuilder.Entity<SaleItem>().Property(i => i.Sku).HasMaxLength(50);
        modelBuilder.Entity<SaleItem>().Property(i => i.UnitCost).HasPrecision(18, 2);
        modelBuilder.Entity<SaleItem>().Property(i => i.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<SaleItem>().Property(i => i.LineTotal).HasPrecision(18, 2);
        modelBuilder.Entity<SaleItem>()
            .HasOne(i => i.Sale)
            .WithMany(s => s.Items)
            .HasForeignKey(i => i.SaleId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SaleItem>()
            .HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
