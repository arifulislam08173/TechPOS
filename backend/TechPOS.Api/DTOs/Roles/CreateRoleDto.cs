using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Roles;

public class CreateRoleDto
{
    [Required, StringLength(80, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    [StringLength(300)]
    public string? Description { get; set; }
    public IReadOnlyList<string> PermissionCodes { get; set; } = Array.Empty<string>();
}
