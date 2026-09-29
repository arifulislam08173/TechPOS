using TechPOS.Api.DTOs.Products;
using TechPOS.Api.Helpers;

namespace TechPOS.Api.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductResponseDto>> GetAllAsync(
        ProductQueryDto query,
        CancellationToken cancellationToken = default);

    Task<ProductResponseDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ProductResponseDto> CreateAsync(
        CreateProductDto dto,
        CancellationToken cancellationToken = default);

    Task<ProductResponseDto?> UpdateAsync(
        int id,
        UpdateProductDto dto,
        CancellationToken cancellationToken = default);

    Task<bool> DeactivateAsync(
        int id,
        CancellationToken cancellationToken = default);
}