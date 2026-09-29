using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Users;

public class ResetPasswordDto
{
    [Required, MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
    [Required]
    public string ConfirmPassword { get; set; } = string.Empty;
}
