using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Inventory;

public class StockOutDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    [StringLength(500, MinimumLength = 2)]
    public string Reason { get; set; } = string.Empty;
}