using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPOS.Api.DTOs.Users;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    public UsersController(IUserService userService) => _userService = userService;

    [Authorize(Policy = PermissionCodes.UsersView)]
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] UserQueryDto query, CancellationToken cancellationToken) =>
        Ok(await _userService.GetAllAsync(query, cancellationToken));

    [Authorize(Policy = PermissionCodes.UsersView)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(id, cancellationToken);
        return user is null ? NotFound(new { message = "User not found." }) : Ok(user);
    }

    [Authorize(Policy = PermissionCodes.UsersManage)]
    [HttpPost]
    public async Task<ActionResult> Create(CreateUserDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userService.CreateAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize(Policy = PermissionCodes.UsersManage)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateUserDto dto, CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var actingUserId)) return Unauthorized();
        try
        {
            var user = await _userService.UpdateAsync(id, actingUserId, dto, cancellationToken);
            return user is null ? NotFound(new { message = "User not found." }) : Ok(user);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize(Policy = PermissionCodes.UsersManage)]
    [HttpPost("{id:int}/reset-password")]
    public async Task<ActionResult> ResetPassword(int id, ResetPasswordDto dto, CancellationToken cancellationToken)
    {
        try
        {
            await _userService.ResetPasswordAsync(id, dto, cancellationToken);
            return Ok(new { message = "Password reset successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
