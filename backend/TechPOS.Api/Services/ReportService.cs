using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;
using TechPOS.Api.DTOs.Reports;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _dbContext;

    public ReportService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DashboardSummaryDto> GetDashboardAsync(
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var from = ToUtcStart(today);
        var to = ToUtcStart(today.AddDays(1));

        var salesQuery = _dbContext.Sales
            .AsNoTracking()
            .Where(s => s.CreatedAt >= from && s.CreatedAt < to);

        var todaySales = await salesQuery.SumAsync(s => (decimal?)s.GrandTotal, cancellationToken) ?? 0m;
        var todayOrders = await salesQuery.CountAsync(cancellationToken);
        var todayItems = await _dbContext.SaleItems
            .AsNoTracking()
            .Where(i => i.Sale.CreatedAt >= from && i.Sale.CreatedAt < to)
            .SumAsync(i => (int?)i.Quantity, cancellationToken) ?? 0;

        var totalProducts = await _dbContext.Products
            .AsNoTracking()
            .CountAsync(p => p.IsActive, cancellationToken);

        var lowStockCount = await _dbContext.Products
            .AsNoTracking()
            .CountAsync(p => p.IsActive && p.StockQuantity <= p.LowStockThreshold, cancellationToken);

        var recentSales = await _dbContext.Sales
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .Take(5)
            .Select(s => new DashboardRecentSaleDto
            {
                Id = s.Id,
                InvoiceNumber = s.InvoiceNumber,
                CashierName = s.Cashier.FullName,
                GrandTotal = s.GrandTotal,
                PaymentMethod = s.PaymentMethod.ToString(),
                CreatedAt = s.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var lowStockProducts = await _dbContext.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.StockQuantity <= p.LowStockThreshold)
            .OrderBy(p => p.StockQuantity)
            .ThenBy(p => p.Name)
            .Take(5)
            .Select(p => new LowStockProductDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Sku = p.Sku,
                StockQuantity = p.StockQuantity,
                LowStockThreshold = p.LowStockThreshold
            })
            .ToListAsync(cancellationToken);

        return new DashboardSummaryDto
        {
            TodaySales = todaySales,
            TodayOrders = todayOrders,
            TodayItemsSold = todayItems,
            TotalProducts = totalProducts,
            LowStockCount = lowStockCount,
            RecentSales = recentSales,
            LowStockProducts = lowStockProducts
        };
    }

    public async Task<ReportOverviewDto> GetOverviewAsync(
        DateOnly? fromDate,
        DateOnly? toDate,
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var fromDay = fromDate ?? today.AddDays(-29);
        var toDay = toDate ?? today;

        if (toDay < fromDay)
            throw new ArgumentException("To date cannot be earlier than from date.");
        if (toDay.DayNumber - fromDay.DayNumber > 366)
            throw new ArgumentException("Report range cannot exceed 366 days.");

        var from = ToUtcStart(fromDay);
        var toExclusive = ToUtcStart(toDay.AddDays(1));

        var salesQuery = _dbContext.Sales
            .AsNoTracking()
            .Where(s => s.CreatedAt >= from && s.CreatedAt < toExclusive);

        var totalSales = await salesQuery.SumAsync(s => (decimal?)s.GrandTotal, cancellationToken) ?? 0m;
        var orders = await salesQuery.CountAsync(cancellationToken);

        var itemQuery = _dbContext.SaleItems
            .AsNoTracking()
            .Where(i => i.Sale.CreatedAt >= from && i.Sale.CreatedAt < toExclusive);

        var itemsSold = await itemQuery.SumAsync(i => (int?)i.Quantity, cancellationToken) ?? 0;
        var totalCost = await itemQuery.SumAsync(i => (decimal?)(i.UnitCost * i.Quantity), cancellationToken) ?? 0m;

        var inventoryCost = await _dbContext.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .SumAsync(p => (decimal?)(p.PurchasePrice * p.StockQuantity), cancellationToken) ?? 0m;

        var inventoryRetail = await _dbContext.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .SumAsync(p => (decimal?)(p.SellingPrice * p.StockQuantity), cancellationToken) ?? 0m;

        var rawTrend = await salesQuery
            .GroupBy(s => s.CreatedAt.Date)
            .Select(g => new
            {
                Date = g.Key,
                Sales = g.Sum(x => x.GrandTotal),
                Orders = g.Count()
            })
            .OrderBy(x => x.Date)
            .ToListAsync(cancellationToken);

        var salesTrend = rawTrend
            .Select(x => new SalesTrendPointDto
            {
                Date = DateOnly.FromDateTime(x.Date),
                Sales = x.Sales,
                Orders = x.Orders
            })
            .ToList();

        var topProducts = await itemQuery
            .GroupBy(i => new { i.ProductId, i.ProductName, i.Sku })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                Sku = g.Key.Sku,
                QuantitySold = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.LineTotal)
            })
            .OrderByDescending(x => x.QuantitySold)
            .ThenByDescending(x => x.Revenue)
            .Take(10)
            .ToListAsync(cancellationToken);

        var lowStockProducts = await _dbContext.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.StockQuantity <= p.LowStockThreshold)
            .OrderBy(p => p.StockQuantity)
            .ThenBy(p => p.Name)
            .Take(10)
            .Select(p => new LowStockProductDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Sku = p.Sku,
                StockQuantity = p.StockQuantity,
                LowStockThreshold = p.LowStockThreshold
            })
            .ToListAsync(cancellationToken);

        return new ReportOverviewDto
        {
            FromDate = fromDay,
            ToDate = toDay,
            TotalSales = totalSales,
            Orders = orders,
            ItemsSold = itemsSold,
            AverageOrderValue = orders == 0 ? 0 : Math.Round(totalSales / orders, 2),
            GrossProfit = totalSales - totalCost,
            InventoryCostValue = inventoryCost,
            InventoryRetailValue = inventoryRetail,
            SalesTrend = salesTrend,
            TopProducts = topProducts,
            LowStockProducts = lowStockProducts
        };
    }

    private static DateTime ToUtcStart(DateOnly date) =>
        DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
}
