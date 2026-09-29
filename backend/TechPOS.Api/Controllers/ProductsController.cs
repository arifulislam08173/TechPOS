using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPOS.Api.DTOs.Products;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    public ProductsController(IProductService productService) => _productService = productService;

    [Authorize(Policy = PermissionCodes.ProductsView)]
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] ProductQueryDto query, CancellationToken cancellationToken) => Ok(await _productService.GetAllAsync(query, cancellationToken));

    [Authorize(Policy = PermissionCodes.ProductsView)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        return product is null ? NotFound(new { message = "Product not found." }) : Ok(product);
    }

    [Authorize(Policy = PermissionCodes.ProductsManage)]
    [HttpPost]
    public async Task<ActionResult> Create(CreateProductDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var product = await _productService.CreateAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize(Policy = PermissionCodes.ProductsManage)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateProductDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var product = await _productService.UpdateAsync(id, dto, cancellationToken);
            return product is null ? NotFound(new { message = "Product not found." }) : Ok(product);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize(Policy = PermissionCodes.ProductsManage)]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Deactivate(int id, CancellationToken cancellationToken) =>
        await _productService.DeactivateAsync(id, cancellationToken) ? NoContent() : NotFound(new { message = "Product not found." });
}
