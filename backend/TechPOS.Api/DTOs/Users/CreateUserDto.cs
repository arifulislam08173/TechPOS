using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Users;

public class CreateUserDto
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;
    [Required, StringLength(80)]
    public string Role { get; set; } = string.Empty;
    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;
}
