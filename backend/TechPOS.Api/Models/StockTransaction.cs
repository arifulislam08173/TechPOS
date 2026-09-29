namespace TechPOS.Api.Models;

public enum StockTransactionType
{
    StockIn = 1,
    StockOut = 2,
    AdjustmentIncrease = 3,
    AdjustmentDecrease = 4,
    Sale = 5,
    Return = 6
}

public class StockTransaction
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public StockTransactionType Type { get; set; }

    public int Quantity { get; set; }

    public int StockBefore { get; set; }

    public int StockAfter { get; set; }

    public string? ReferenceType { get; set; }

    public int? ReferenceId { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}