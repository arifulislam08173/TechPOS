using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Auth;

public class UpdateProfileDto
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;
}
