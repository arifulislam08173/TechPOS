using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;
using TechPOS.Api.DTOs.Inventory;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;
using TechPOS.Api.Models;

namespace TechPOS.Api.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _dbContext;

    public InventoryService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<StockTransactionResponseDto> StockInAsync(
        StockInDto dto,
        CancellationToken cancellationToken = default)
    {
        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var product = await GetProductForUpdateAsync(
            dto.ProductId,
            cancellationToken);

        if (product == null)
            throw new KeyNotFoundException("Product not found.");

        if (!product.IsActive)
            throw new InvalidOperationException("Product is inactive.");

        var stockBefore = product.StockQuantity;

        product.StockQuantity += dto.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        var stockTransaction = new StockTransaction
        {
            ProductId = product.Id,
            Type = StockTransactionType.StockIn,
            Quantity = dto.Quantity,
            StockBefore = stockBefore,
            StockAfter = product.StockQuantity,
            ReferenceType = "MANUAL",
            Note = dto.Note?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.StockTransactions.Add(stockTransaction);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Map(stockTransaction, product);
    }

    public async Task<StockTransactionResponseDto> StockOutAsync(
        StockOutDto dto,
        CancellationToken cancellationToken = default)
    {
        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var product = await GetProductForUpdateAsync(
            dto.ProductId,
            cancellationToken);

        if (product == null)
            throw new KeyNotFoundException("Product not found.");

        if (!product.IsActive)
            throw new InvalidOperationException("Product is inactive.");

        if (product.StockQuantity < dto.Quantity)
        {
            throw new InvalidOperationException(
                $"Insufficient stock. Available stock: {product.StockQuantity}."
            );
        }

        var stockBefore = product.StockQuantity;

        product.StockQuantity -= dto.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        var stockTransaction = new StockTransaction
        {
            ProductId = product.Id,
            Type = StockTransactionType.StockOut,
            Quantity = dto.Quantity,
            StockBefore = stockBefore,
            StockAfter = product.StockQuantity,
            ReferenceType = "MANUAL",
            Note = dto.Reason.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.StockTransactions.Add(stockTransaction);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Map(stockTransaction, product);
    }

    public async Task<StockTransactionResponseDto> AdjustAsync(
        StockAdjustmentDto dto,
        CancellationToken cancellationToken = default)
    {
        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var product = await GetProductForUpdateAsync(
            dto.ProductId,
            cancellationToken);

        if (product == null)
            throw new KeyNotFoundException("Product not found.");

        var stockBefore = product.StockQuantity;

        if (stockBefore == dto.NewQuantity)
        {
            throw new InvalidOperationException(
                "New quantity is the same as the current stock."
            );
        }

        var difference = dto.NewQuantity - stockBefore;

        var type = difference > 0
            ? StockTransactionType.AdjustmentIncrease
            : StockTransactionType.AdjustmentDecrease;

        product.StockQuantity = dto.NewQuantity;
        product.UpdatedAt = DateTime.UtcNow;

        var stockTransaction = new StockTransaction
        {
            ProductId = product.Id,
            Type = type,
            Quantity = Math.Abs(difference),
            StockBefore = stockBefore,
            StockAfter = dto.NewQuantity,
            ReferenceType = "ADJUSTMENT",
            Note = dto.Reason.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.StockTransactions.Add(stockTransaction);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Map(stockTransaction, product);
    }

    public async Task<PagedResult<StockTransactionResponseDto>>
        GetHistoryAsync(
            InventoryQueryDto request,
            CancellationToken cancellationToken = default)
    {
        var query = _dbContext.StockTransactions
            .AsNoTracking()
            .AsQueryable();

        if (request.ProductId.HasValue)
        {
            query = query.Where(
                x => x.ProductId == request.ProductId.Value);
        }

        if (request.Type.HasValue)
        {
            query = query.Where(
                x => x.Type == request.Type.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(x =>
                EF.Functions.ILike(x.Product.Name, $"%{search}%") ||
                EF.Functions.ILike(x.Product.Sku, $"%{search}%"));
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(
                x => x.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(
                x => x.CreatedAt <= request.ToDate.Value);
        }

        query = query.OrderByDescending(x => x.CreatedAt);

        var totalItems =
            await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new StockTransactionResponseDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                Sku = x.Product.Sku,
                Type = x.Type.ToString(),
                Quantity = x.Quantity,
                StockBefore = x.StockBefore,
                StockAfter = x.StockAfter,
                Note = x.Note,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<StockTransactionResponseDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(
                totalItems / (double)request.PageSize)
        };
    }

    private async Task<Product?> GetProductForUpdateAsync(
        int productId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Products
            .FromSqlInterpolated(
                $"""
                SELECT *
                FROM "Products"
                WHERE "Id" = {productId}
                FOR UPDATE
                """)
            .SingleOrDefaultAsync(cancellationToken);
    }

    private static StockTransactionResponseDto Map(
        StockTransaction transaction,
        Product product)
    {
        return new StockTransactionResponseDto
        {
            Id = transaction.Id,
            ProductId = product.Id,
            ProductName = product.Name,
            Sku = product.Sku,
            Type = transaction.Type.ToString(),
            Quantity = transaction.Quantity,
            StockBefore = transaction.StockBefore,
            StockAfter = transaction.StockAfter,
            Note = transaction.Note,
            CreatedAt = transaction.CreatedAt
        };
    }
}