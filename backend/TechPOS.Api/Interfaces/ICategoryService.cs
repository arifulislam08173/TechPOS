using TechPOS.Api.DTOs.Categories;
using TechPOS.Api.Helpers;

namespace TechPOS.Api.Interfaces;

public interface ICategoryService
{
    Task<PagedResult<CategoryResponseDto>> GetAllAsync(CategoryQueryDto query, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryResponseDto>> GetLookupAsync(CancellationToken cancellationToken = default);
    Task<CategoryResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<CategoryResponseDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
