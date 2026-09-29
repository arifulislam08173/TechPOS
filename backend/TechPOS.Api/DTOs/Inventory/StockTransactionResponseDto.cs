namespace TechPOS.Api.DTOs.Inventory;

public class StockTransactionResponseDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public string Sku { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public int StockBefore { get; set; }

    public int StockAfter { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }
}