using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPOS.Api.DTOs.Auth;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) => _authService = authService;

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto dto, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(dto, cancellationToken);
        return result is null ? Unauthorized(new { message = "Invalid email or password." }) : Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult> Me(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        var user = await _authService.GetCurrentUserAsync(userId, cancellationToken);
        return user is null ? Unauthorized() : Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult> UpdateProfile(UpdateProfileDto dto, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            var user = await _authService.UpdateProfileAsync(userId, dto, cancellationToken);
            return user is null ? NotFound(new { message = "User not found." }) : Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordDto dto, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            await _authService.ChangePasswordAsync(userId, dto, cancellationToken);
            return Ok(new { message = "Password changed successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private bool TryGetUserId(out int userId)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idValue, out userId);
    }
}
