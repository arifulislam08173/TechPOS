using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Sales;

public class CreateSaleItemDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, 1000)]
    public int Quantity { get; set; }
}
