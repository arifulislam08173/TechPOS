using TechPOS.Api.DTOs.Roles;
using TechPOS.Api.Helpers;

namespace TechPOS.Api.Interfaces;

public interface IRoleService
{
    Task<IReadOnlyList<RoleResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<RoleLookupDto>> GetLookupAsync(RoleLookupQueryDto query, CancellationToken cancellationToken = default);
    Task<RoleResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PermissionResponseDto>> GetPermissionsAsync(CancellationToken cancellationToken = default);
    Task<RoleResponseDto> CreateAsync(CreateRoleDto dto, CancellationToken cancellationToken = default);
    Task<RoleResponseDto?> UpdateAsync(int id, UpdateRoleDto dto, CancellationToken cancellationToken = default);
}
