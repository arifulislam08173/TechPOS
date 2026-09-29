namespace TechPOS.Api.Models;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Sku { get; set; } = string.Empty;

    public string? Brand { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SellingPrice { get; set; }

    public int StockQuantity { get; set; }

    public int LowStockThreshold { get; set; } = 5;

    public bool IsActive { get; set; } = true;

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<StockTransaction> StockTransactions { get; set; }
    = new List<StockTransaction>();
}