using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPOS.Api.DTOs.Inventory;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    public InventoryController(IInventoryService inventoryService) => _inventoryService = inventoryService;

    [Authorize(Policy = PermissionCodes.InventoryView)]
    [HttpGet("history")]
    public async Task<ActionResult> GetHistory([FromQuery] InventoryQueryDto query, CancellationToken cancellationToken) => Ok(await _inventoryService.GetHistoryAsync(query, cancellationToken));

    [Authorize(Policy = PermissionCodes.InventoryView)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var transaction = await _inventoryService.GetByIdAsync(id, cancellationToken);
        return transaction is null
            ? NotFound(new { message = "Stock transaction not found." })
            : Ok(transaction);
    }

    [Authorize(Policy = PermissionCodes.InventoryManage)]
    [HttpPost("stock-in")]
    public async Task<ActionResult> StockIn(StockInDto dto, CancellationToken cancellationToken) => await Execute(() => _inventoryService.StockInAsync(dto, cancellationToken));

    [Authorize(Policy = PermissionCodes.InventoryManage)]
    [HttpPost("stock-out")]
    public async Task<ActionResult> StockOut(StockOutDto dto, CancellationToken cancellationToken) => await Execute(() => _inventoryService.StockOutAsync(dto, cancellationToken));

    [Authorize(Policy = PermissionCodes.InventoryManage)]
    [HttpPost("adjust")]
    public async Task<ActionResult> Adjust(StockAdjustmentDto dto, CancellationToken cancellationToken) => await Execute(() => _inventoryService.AdjustAsync(dto, cancellationToken));

    private async Task<ActionResult> Execute(Func<Task<StockTransactionResponseDto>> action)
    {
        try { return Ok(await action()); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
