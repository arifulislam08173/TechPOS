using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Products;

public class CreateProductDto
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Sku { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Brand { get; set; }

    [Range(0, double.MaxValue)]
    public decimal PurchasePrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal SellingPrice { get; set; }

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; set; } = 5;

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
}