using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPOS.Api.DTOs.Roles;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;
    public RolesController(IRoleService roleService) => _roleService = roleService;

    [Authorize(Policy = PermissionCodes.RolesView)]
    [HttpGet]
    public async Task<ActionResult> GetAll(CancellationToken cancellationToken) => Ok(await _roleService.GetAllAsync(cancellationToken));

    [HttpGet("lookup")]
    public async Task<ActionResult> Lookup(
        [FromQuery] RoleLookupQueryDto query,
        CancellationToken cancellationToken) =>
        Ok(await _roleService.GetLookupAsync(query, cancellationToken));

    [Authorize(Policy = PermissionCodes.RolesView)]
    [HttpGet("permissions")]
    public async Task<ActionResult> GetPermissions(CancellationToken cancellationToken) => Ok(await _roleService.GetPermissionsAsync(cancellationToken));

    [Authorize(Policy = PermissionCodes.RolesView)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var role = await _roleService.GetByIdAsync(id, cancellationToken);
        return role is null ? NotFound(new { message = "Role not found." }) : Ok(role);
    }

    [Authorize(Policy = PermissionCodes.RolesManage)]
    [HttpPost]
    public async Task<ActionResult> Create(CreateRoleDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var role = await _roleService.CreateAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = role.Id }, role);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize(Policy = PermissionCodes.RolesManage)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateRoleDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var role = await _roleService.UpdateAsync(id, dto, cancellationToken);
            return role is null ? NotFound(new { message = "Role not found." }) : Ok(role);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
