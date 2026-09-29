namespace TechPOS.Api.DTOs.Products;

public class ProductResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Sku { get; set; } = string.Empty;

    public string? Brand { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SellingPrice { get; set; }

    public int StockQuantity { get; set; }

    public int LowStockThreshold { get; set; }

    public bool IsLowStock =>
        StockQuantity <= LowStockThreshold;

    public bool IsActive { get; set; }

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}