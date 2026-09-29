using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Inventory;

public class StockInDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }
}