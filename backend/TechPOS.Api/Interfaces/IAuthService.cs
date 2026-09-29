using TechPOS.Api.DTOs.Auth;

namespace TechPOS.Api.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default);
    Task<CurrentUserDto?> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<CurrentUserDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(int userId, ChangePasswordDto dto, CancellationToken cancellationToken = default);
}
