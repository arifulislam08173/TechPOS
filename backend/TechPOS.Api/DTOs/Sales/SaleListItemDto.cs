namespace TechPOS.Api.DTOs.Sales;

public class SaleListItemDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string CashierName { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
