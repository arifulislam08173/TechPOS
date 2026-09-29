using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;
using TechPOS.Api.DTOs.Categories;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;
using TechPOS.Api.Models;

namespace TechPOS.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _dbContext;
    public CategoryService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<PagedResult<CategoryResponseDto>> GetAllAsync(CategoryQueryDto request, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Categories.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => EF.Functions.ILike(x.Name, $"%{search}%"));
        }
        if (request.IsActive.HasValue) query = query.Where(x => x.IsActive == request.IsActive.Value);
        query = query.OrderBy(x => x.Name);
        var totalItems = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).Select(x => new CategoryResponseDto
        {
            Id = x.Id, Name = x.Name, IsActive = x.IsActive, CreatedAt = x.CreatedAt
        }).ToListAsync(cancellationToken);
        return new PagedResult<CategoryResponseDto>
        {
            Items = items, Page = request.Page, PageSize = request.PageSize, TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)request.PageSize)
        };
    }

    public async Task<IReadOnlyList<CategoryResponseDto>> GetLookupAsync(CancellationToken cancellationToken = default) =>
        await _dbContext.Categories.AsNoTracking().Where(x => x.IsActive).OrderBy(x => x.Name).Select(x => new CategoryResponseDto
        {
            Id = x.Id, Name = x.Name, IsActive = x.IsActive, CreatedAt = x.CreatedAt
        }).ToListAsync(cancellationToken);

    public async Task<CategoryResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _dbContext.Categories.AsNoTracking().Where(x => x.Id == id).Select(x => new CategoryResponseDto
        {
            Id = x.Id, Name = x.Name, IsActive = x.IsActive, CreatedAt = x.CreatedAt
        }).FirstOrDefaultAsync(cancellationToken);

    public async Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var name = dto.Name.Trim();
        if (await _dbContext.Categories.AnyAsync(x => x.Name.ToLower() == name.ToLower(), cancellationToken))
            throw new InvalidOperationException("A category with this name already exists.");
        var category = new Category { Name = name, IsActive = true, CreatedAt = DateTime.UtcNow };
        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(category.Id, cancellationToken))!;
    }

    public async Task<CategoryResponseDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (category is null) return null;
        var name = dto.Name.Trim();
        if (await _dbContext.Categories.AnyAsync(x => x.Id != id && x.Name.ToLower() == name.ToLower(), cancellationToken))
            throw new InvalidOperationException("A category with this name already exists.");
        category.Name = name; category.IsActive = dto.IsActive;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (category is null) return false;
        if (await _dbContext.Products.AnyAsync(x => x.CategoryId == id, cancellationToken))
            throw new InvalidOperationException("Category cannot be deleted because products are using it.");
        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
