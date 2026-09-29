namespace TechPOS.Api.DTOs.Roles;

public class RoleResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystem { get; set; }
    public bool IsActive { get; set; }
    public int UserCount { get; set; }
    public IReadOnlyList<string> PermissionCodes { get; set; } = Array.Empty<string>();
    public DateTime CreatedAt { get; set; }
}
