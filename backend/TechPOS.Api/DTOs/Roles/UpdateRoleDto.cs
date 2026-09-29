using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Roles;

public class UpdateRoleDto
{
    [StringLength(300)]
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public IReadOnlyList<string> PermissionCodes { get; set; } = Array.Empty<string>();
}
