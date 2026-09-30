using System.ComponentModel.DataAnnotations;
using TechPOS.Api.Models;

namespace TechPOS.Api.DTOs.Sales;

public class CreateSaleDto
{
    [Required]
    [MinLength(1)]
    public List<CreateSaleItemDto> Items { get; set; } = [];

    [Range(0, double.MaxValue)]
    public decimal DiscountAmount { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    [Range(0, double.MaxValue)]
    public decimal AmountPaid { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }
}
