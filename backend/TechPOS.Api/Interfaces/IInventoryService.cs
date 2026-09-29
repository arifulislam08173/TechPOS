using TechPOS.Api.DTOs.Inventory;
using TechPOS.Api.Helpers;

namespace TechPOS.Api.Interfaces;

public interface IInventoryService
{
    Task<StockTransactionResponseDto> StockInAsync(
        StockInDto dto,
        CancellationToken cancellationToken = default);

    Task<StockTransactionResponseDto> StockOutAsync(
        StockOutDto dto,
        CancellationToken cancellationToken = default);

    Task<StockTransactionResponseDto> AdjustAsync(
        StockAdjustmentDto dto,
        CancellationToken cancellationToken = default);

    Task<PagedResult<StockTransactionResponseDto>> GetHistoryAsync(
        InventoryQueryDto query,
        CancellationToken cancellationToken = default);
}