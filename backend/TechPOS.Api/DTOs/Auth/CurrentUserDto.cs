namespace TechPOS.Api.DTOs.Auth;

public class CurrentUserDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public IReadOnlyList<string> Permissions { get; set; } = Array.Empty<string>();
}
