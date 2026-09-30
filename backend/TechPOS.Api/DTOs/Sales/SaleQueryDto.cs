using TechPOS.Api.Models;

namespace TechPOS.Api.DTOs.Sales;

public class SaleQueryDto
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
    public PaymentMethod? PaymentMethod { get; set; }
    public int? CashierId { get; set; }
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
}
