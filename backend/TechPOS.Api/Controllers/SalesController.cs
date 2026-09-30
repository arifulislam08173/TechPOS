using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPOS.Api.DTOs.Sales;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    [Authorize(Policy = PermissionCodes.SalesView)]
    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] SaleQueryDto query,
        CancellationToken cancellationToken) =>
        Ok(await _saleService.GetAllAsync(query, cancellationToken));

    [Authorize(Policy = PermissionCodes.SalesView)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var sale = await _saleService.GetByIdAsync(id, cancellationToken);
        return sale is null
            ? NotFound(new { message = "Sale not found." })
            : Ok(sale);
    }

    [Authorize(Policy = PermissionCodes.SalesManage)]
    [HttpPost]
    public async Task<ActionResult> Create(
        CreateSaleDto dto,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var cashierId))
            return Unauthorized();

        try
        {
            var sale = await _saleService.CreateAsync(cashierId, dto, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = sale.Id }, sale);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
