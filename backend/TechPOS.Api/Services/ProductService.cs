using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;
using TechPOS.Api.DTOs.Products;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;
using TechPOS.Api.Models;

namespace TechPOS.Api.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _dbContext;

    public ProductService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<ProductResponseDto>> GetAllAsync(
        ProductQueryDto request,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Products
            .AsNoTracking()
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(p =>
                EF.Functions.ILike(p.Name, $"%{search}%") ||
                EF.Functions.ILike(p.Sku, $"%{search}%") ||
                (p.Brand != null &&
                 EF.Functions.ILike(p.Brand, $"%{search}%")));
        }

        // Category filter
        if (request.CategoryId.HasValue)
        {
            query = query.Where(
                p => p.CategoryId == request.CategoryId.Value);
        }

        // Brand filter
        if (!string.IsNullOrWhiteSpace(request.Brand))
        {
            var brand = request.Brand.Trim();

            query = query.Where(p =>
                p.Brand != null &&
                EF.Functions.ILike(p.Brand, brand));
        }

        // Active filter
        if (request.IsActive.HasValue)
        {
            query = query.Where(
                p => p.IsActive == request.IsActive.Value);
        }

        // Sort
        var descending =
            request.SortDirection.Equals(
                "desc",
                StringComparison.OrdinalIgnoreCase);

        query = request.SortBy.ToLower() switch
        {
            "sellingprice" => descending
                ? query.OrderByDescending(p => p.SellingPrice)
                : query.OrderBy(p => p.SellingPrice),

            "purchaseprice" => descending
                ? query.OrderByDescending(p => p.PurchasePrice)
                : query.OrderBy(p => p.PurchasePrice),

            "stockquantity" => descending
                ? query.OrderByDescending(p => p.StockQuantity)
                : query.OrderBy(p => p.StockQuantity),

            "createdat" => descending
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt),

            _ => descending
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name)
        };

        var totalItems =
            await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Sku = p.Sku,
                Brand = p.Brand,
                PurchasePrice = p.PurchasePrice,
                SellingPrice = p.SellingPrice,
                StockQuantity = p.StockQuantity,
                LowStockThreshold = p.LowStockThreshold,
                IsActive = p.IsActive,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductResponseDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(
                totalItems / (double)request.PageSize)
        };
    }

    public async Task<ProductResponseDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Sku = p.Sku,
                Brand = p.Brand,
                PurchasePrice = p.PurchasePrice,
                SellingPrice = p.SellingPrice,
                StockQuantity = p.StockQuantity,
                LowStockThreshold = p.LowStockThreshold,
                IsActive = p.IsActive,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductResponseDto> CreateAsync(
        CreateProductDto dto,
        CancellationToken cancellationToken = default)
    {
        var sku = dto.Sku.Trim().ToUpperInvariant();

        var skuExists = await _dbContext.Products
            .AnyAsync(
                p => p.Sku == sku,
                cancellationToken);

        if (skuExists)
        {
            throw new InvalidOperationException(
                "A product with this SKU already exists.");
        }

        var categoryExists = await _dbContext.Categories
            .AnyAsync(
                c => c.Id == dto.CategoryId && c.IsActive,
                cancellationToken);

        if (!categoryExists)
        {
            throw new ArgumentException(
                "The selected category does not exist or is inactive.");
        }

        if (dto.SellingPrice < dto.PurchasePrice)
        {
            throw new ArgumentException(
                "Selling price cannot be lower than purchase price.");
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            Sku = sku,
            Brand = string.IsNullOrWhiteSpace(dto.Brand)
                ? null
                : dto.Brand.Trim(),
            PurchasePrice = dto.PurchasePrice,
            SellingPrice = dto.SellingPrice,
            StockQuantity = 0,
            LowStockThreshold = dto.LowStockThreshold,
            CategoryId = dto.CategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Products.Add(product);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(
            product.Id,
            cancellationToken))!;
    }

    public async Task<ProductResponseDto?> UpdateAsync(
        int id,
        UpdateProductDto dto,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products
            .FirstOrDefaultAsync(
                p => p.Id == id,
                cancellationToken);

        if (product == null)
        {
            return null;
        }

        var sku = dto.Sku.Trim().ToUpperInvariant();

        var duplicateSku = await _dbContext.Products
            .AnyAsync(
                p => p.Id != id && p.Sku == sku,
                cancellationToken);

        if (duplicateSku)
        {
            throw new InvalidOperationException(
                "A product with this SKU already exists.");
        }

        var categoryExists = await _dbContext.Categories
            .AnyAsync(
                c => c.Id == dto.CategoryId && c.IsActive,
                cancellationToken);

        if (!categoryExists)
        {
            throw new ArgumentException(
                "The selected category does not exist or is inactive.");
        }

        if (dto.SellingPrice < dto.PurchasePrice)
        {
            throw new ArgumentException(
                "Selling price cannot be lower than purchase price.");
        }

        product.Name = dto.Name.Trim();
        product.Sku = sku;
        product.Brand = string.IsNullOrWhiteSpace(dto.Brand)
            ? null
            : dto.Brand.Trim();
        product.PurchasePrice = dto.PurchasePrice;
        product.SellingPrice = dto.SellingPrice;
        product.LowStockThreshold = dto.LowStockThreshold;
        product.CategoryId = dto.CategoryId;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeactivateAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products
            .FirstOrDefaultAsync(
                p => p.Id == id,
                cancellationToken);

        if (product == null)
        {
            return false;
        }

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}