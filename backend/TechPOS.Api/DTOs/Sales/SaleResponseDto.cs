namespace TechPOS.Api.DTOs.Sales;

public class SaleResponseDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int CashierId { get; set; }
    public string CashierName { get; set; } = string.Empty;
    public string CashierEmail { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; }
    public decimal ChangeAmount { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<SaleItemResponseDto> Items { get; set; } = [];
}
