using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Users;

public class UpdateUserDto
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;
    [Required, StringLength(80)]
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
