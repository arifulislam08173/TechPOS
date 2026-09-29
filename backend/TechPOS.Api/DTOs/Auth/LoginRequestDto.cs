using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Auth;

public class LoginRequestDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;
}
