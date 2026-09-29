using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPOS.Api.DTOs.Categories;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    public CategoriesController(ICategoryService categoryService) => _categoryService = categoryService;

    [Authorize(Policy = PermissionCodes.CategoriesView)]
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] CategoryQueryDto query, CancellationToken cancellationToken) =>
        Ok(await _categoryService.GetAllAsync(query, cancellationToken));

    [Authorize(Policy = PermissionCodes.CategoriesView)]
    [HttpGet("lookup")]
    public async Task<ActionResult> Lookup(CancellationToken cancellationToken) => Ok(await _categoryService.GetLookupAsync(cancellationToken));

    [Authorize(Policy = PermissionCodes.CategoriesView)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetByIdAsync(id, cancellationToken);
        return category is null ? NotFound(new { message = "Category not found." }) : Ok(category);
    }

    [Authorize(Policy = PermissionCodes.CategoriesManage)]
    [HttpPost]
    public async Task<ActionResult> Create(CreateCategoryDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var category = await _categoryService.CreateAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [Authorize(Policy = PermissionCodes.CategoriesManage)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateCategoryDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var category = await _categoryService.UpdateAsync(id, dto, cancellationToken);
            return category is null ? NotFound(new { message = "Category not found." }) : Ok(category);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [Authorize(Policy = PermissionCodes.CategoriesManage)]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        try
        {
            return await _categoryService.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound(new { message = "Category not found." });
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}
