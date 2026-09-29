using TechPOS.Api.Models;

namespace TechPOS.Api.DTOs.Inventory;

public class InventoryQueryDto
{
    private int _page = 1;
    private int _pageSize = 10;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 10,
            > 100 => 100,
            _ => value
        };
    }

    public string? Search { get; set; }

    public int? ProductId { get; set; }

    public StockTransactionType? Type { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }
}