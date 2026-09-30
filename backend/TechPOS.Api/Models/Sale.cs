using System.Text.Json.Serialization;

namespace TechPOS.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentMethod
{
    Cash = 1,
    Card = 2,
    MobileBanking = 3
}

public class Sale
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal ChangeAmount { get; set; }
    public string? Note { get; set; }
    public int CashierId { get; set; }
    public User Cashier { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
}
