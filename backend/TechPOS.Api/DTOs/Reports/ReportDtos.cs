namespace TechPOS.Api.DTOs.Reports;

public class DashboardSummaryDto
{
    public decimal TodaySales { get; set; }
    public int TodayOrders { get; set; }
    public int TodayItemsSold { get; set; }
    public int TotalProducts { get; set; }
    public int LowStockCount { get; set; }
    public IReadOnlyList<DashboardRecentSaleDto> RecentSales { get; set; } = [];
    public IReadOnlyList<LowStockProductDto> LowStockProducts { get; set; } = [];
}

public class DashboardRecentSaleDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string CashierName { get; set; } = string.Empty;
    public decimal GrandTotal { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ReportOverviewDto
{
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }
    public decimal TotalSales { get; set; }
    public int Orders { get; set; }
    public int ItemsSold { get; set; }
    public decimal AverageOrderValue { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal InventoryCostValue { get; set; }
    public decimal InventoryRetailValue { get; set; }
    public IReadOnlyList<SalesTrendPointDto> SalesTrend { get; set; } = [];
    public IReadOnlyList<TopProductDto> TopProducts { get; set; } = [];
    public IReadOnlyList<LowStockProductDto> LowStockProducts { get; set; } = [];
}

public class SalesTrendPointDto
{
    public DateOnly Date { get; set; }
    public decimal Sales { get; set; }
    public int Orders { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}

public class LowStockProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
}
