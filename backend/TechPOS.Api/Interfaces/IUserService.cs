using TechPOS.Api.DTOs.Users;
using TechPOS.Api.Helpers;

namespace TechPOS.Api.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserResponseDto>> GetAllAsync(UserQueryDto query, CancellationToken cancellationToken = default);
    Task<UserResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<UserResponseDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);
    Task<UserResponseDto?> UpdateAsync(int id, int actingUserId, UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(int id, ResetPasswordDto dto, CancellationToken cancellationToken = default);
}
