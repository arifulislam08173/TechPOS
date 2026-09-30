using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;
using TechPOS.Api.DTOs.Sales;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;
using TechPOS.Api.Models;

namespace TechPOS.Api.Services;

public class SaleService : ISaleService
{
    private readonly AppDbContext _dbContext;

    public SaleService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<SaleListItemDto>> GetAllAsync(
        SaleQueryDto request,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Sales.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(s =>
                EF.Functions.ILike(s.InvoiceNumber, $"%{search}%") ||
                EF.Functions.ILike(s.Cashier.FullName, $"%{search}%") ||
                EF.Functions.ILike(s.Cashier.Email, $"%{search}%"));
        }

        if (request.PaymentMethod.HasValue)
            query = query.Where(s => s.PaymentMethod == request.PaymentMethod.Value);

        if (request.CashierId.HasValue)
            query = query.Where(s => s.CashierId == request.CashierId.Value);

        if (request.FromDate.HasValue)
        {
            var from = ToUtcStart(request.FromDate.Value);
            query = query.Where(s => s.CreatedAt >= from);
        }

        if (request.ToDate.HasValue)
        {
            var toExclusive = ToUtcStart(request.ToDate.Value.AddDays(1));
            query = query.Where(s => s.CreatedAt < toExclusive);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new SaleListItemDto
            {
                Id = s.Id,
                InvoiceNumber = s.InvoiceNumber,
                CashierName = s.Cashier.FullName,
                ItemCount = s.Items.Sum(i => i.Quantity),
                Subtotal = s.Subtotal,
                DiscountAmount = s.DiscountAmount,
                GrandTotal = s.GrandTotal,
                PaymentMethod = s.PaymentMethod.ToString(),
                CreatedAt = s.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<SaleListItemDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)request.PageSize)
        };
    }

    public async Task<SaleResponseDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Sales
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(s => new SaleResponseDto
            {
                Id = s.Id,
                InvoiceNumber = s.InvoiceNumber,
                CashierId = s.CashierId,
                CashierName = s.Cashier.FullName,
                CashierEmail = s.Cashier.Email,
                Subtotal = s.Subtotal,
                DiscountAmount = s.DiscountAmount,
                GrandTotal = s.GrandTotal,
                PaymentMethod = s.PaymentMethod.ToString(),
                AmountPaid = s.AmountPaid,
                ChangeAmount = s.ChangeAmount,
                Note = s.Note,
                CreatedAt = s.CreatedAt,
                Items = s.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new SaleItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        Sku = i.Sku,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        LineTotal = i.LineTotal
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<SaleResponseDto> CreateAsync(
        int cashierId,
        CreateSaleDto dto,
        CancellationToken cancellationToken = default)
    {
        if (dto.Items.Count == 0)
            throw new ArgumentException("At least one sale item is required.");

        var cashierExists = await _dbContext.Users
            .AnyAsync(u => u.Id == cashierId && u.IsActive, cancellationToken);
        if (!cashierExists)
            throw new KeyNotFoundException("Cashier account not found or inactive.");

        var groupedItems = dto.Items
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .OrderBy(x => x.ProductId)
            .ToList();

        if (groupedItems.Any(x => x.Quantity <= 0 || x.Quantity > 1000))
            throw new ArgumentException("Each sale quantity must be between 1 and 1000.");

        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var lockedProducts = new Dictionary<int, Product>();
        foreach (var item in groupedItems)
        {
            var product = await _dbContext.Products
                .FromSqlInterpolated(
                    $"""
                    SELECT *
                    FROM "Products"
                    WHERE "Id" = {item.ProductId}
                    FOR UPDATE
                    """)
                .SingleOrDefaultAsync(cancellationToken);

            if (product is null)
                throw new KeyNotFoundException($"Product #{item.ProductId} was not found.");
            if (!product.IsActive)
                throw new InvalidOperationException($"{product.Name} is inactive and cannot be sold.");
            if (product.StockQuantity < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for {product.Name}. Available: {product.StockQuantity}, requested: {item.Quantity}.");

            lockedProducts[item.ProductId] = product;
        }

        var subtotal = groupedItems.Sum(item =>
            lockedProducts[item.ProductId].SellingPrice * item.Quantity);

        if (dto.DiscountAmount < 0 || dto.DiscountAmount > subtotal)
            throw new ArgumentException("Discount amount cannot be greater than the subtotal.");

        var grandTotal = subtotal - dto.DiscountAmount;
        var amountPaid = dto.PaymentMethod == PaymentMethod.Cash
            ? dto.AmountPaid
            : grandTotal;

        if (amountPaid < grandTotal)
            throw new ArgumentException("Amount paid cannot be lower than the grand total.");

        var sale = new Sale
        {
            InvoiceNumber = GenerateInvoiceNumber(),
            Subtotal = subtotal,
            DiscountAmount = dto.DiscountAmount,
            GrandTotal = grandTotal,
            PaymentMethod = dto.PaymentMethod,
            AmountPaid = amountPaid,
            ChangeAmount = dto.PaymentMethod == PaymentMethod.Cash ? amountPaid - grandTotal : 0,
            Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim(),
            CashierId = cashierId,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in groupedItems)
        {
            var product = lockedProducts[item.ProductId];
            sale.Items.Add(new SaleItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Sku = product.Sku,
                Quantity = item.Quantity,
                UnitCost = product.PurchasePrice,
                UnitPrice = product.SellingPrice,
                LineTotal = product.SellingPrice * item.Quantity
            });
        }

        _dbContext.Sales.Add(sale);
        await _dbContext.SaveChangesAsync(cancellationToken);

        foreach (var item in groupedItems)
        {
            var product = lockedProducts[item.ProductId];
            var stockBefore = product.StockQuantity;
            product.StockQuantity -= item.Quantity;
            product.UpdatedAt = DateTime.UtcNow;

            _dbContext.StockTransactions.Add(new StockTransaction
            {
                ProductId = product.Id,
                Type = StockTransactionType.Sale,
                Quantity = item.Quantity,
                StockBefore = stockBefore,
                StockAfter = product.StockQuantity,
                ReferenceType = "SALE",
                ReferenceId = sale.Id,
                Note = $"Sold on {sale.InvoiceNumber}",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return (await GetByIdAsync(sale.Id, cancellationToken))!;
    }

    private static string GenerateInvoiceNumber() =>
        $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

    private static DateTime ToUtcStart(DateOnly date) =>
        DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
}
