using TechPOS.Api.DTOs.Sales;
using TechPOS.Api.Helpers;

namespace TechPOS.Api.Interfaces;

public interface ISaleService
{
    Task<PagedResult<SaleListItemDto>> GetAllAsync(SaleQueryDto query, CancellationToken cancellationToken = default);
    Task<SaleResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<SaleResponseDto> CreateAsync(int cashierId, CreateSaleDto dto, CancellationToken cancellationToken = default);
}
