using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Inventory;

public class StockAdjustmentDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(0, int.MaxValue)]
    public int NewQuantity { get; set; }

    [Required]
    [StringLength(500, MinimumLength = 2)]
    public string Reason { get; set; } = string.Empty;
}