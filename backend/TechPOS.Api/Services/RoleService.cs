using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;
using TechPOS.Api.DTOs.Roles;
using TechPOS.Api.Interfaces;
using TechPOS.Api.Models;

namespace TechPOS.Api.Services;

public class RoleService : IRoleService
{
    private readonly AppDbContext _dbContext;
    public RoleService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<IReadOnlyList<RoleResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _dbContext.Roles.AsNoTracking().OrderBy(x => x.Name).ToListAsync(cancellationToken);
        var counts = await _dbContext.Users.AsNoTracking().GroupBy(x => x.Role).Select(g => new { Role = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Role, x => x.Count, cancellationToken);
        var permissions = await _dbContext.RolePermissions.AsNoTracking().Include(x => x.Permission).ToListAsync(cancellationToken);
        return roles.Select(role => Map(role, counts.GetValueOrDefault(role.Name), permissions.Where(x => x.RoleId == role.Id).Select(x => x.Permission.Code))).ToList();
    }

    public async Task<RoleResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var role = await _dbContext.Roles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (role is null) return null;
        var userCount = await _dbContext.Users.CountAsync(x => x.Role == role.Name, cancellationToken);
        var permissionCodes = await _dbContext.RolePermissions.AsNoTracking().Where(x => x.RoleId == id).OrderBy(x => x.Permission.Code).Select(x => x.Permission.Code).ToListAsync(cancellationToken);
        return Map(role, userCount, permissionCodes);
    }

    public async Task<IReadOnlyList<PermissionResponseDto>> GetPermissionsAsync(CancellationToken cancellationToken = default) =>
        await _dbContext.Permissions.AsNoTracking().OrderBy(x => x.Module).ThenBy(x => x.Name).Select(x => new PermissionResponseDto
        {
            Id = x.Id, Code = x.Code, Name = x.Name, Module = x.Module, Description = x.Description
        }).ToListAsync(cancellationToken);

    public async Task<RoleResponseDto> CreateAsync(CreateRoleDto dto, CancellationToken cancellationToken = default)
    {
        var name = dto.Name.Trim();
        if (await _dbContext.Roles.AnyAsync(x => x.Name.ToLower() == name.ToLower(), cancellationToken))
            throw new InvalidOperationException("A role with this name already exists.");
        var permissionIds = await ResolvePermissionIdsAsync(dto.PermissionCodes, cancellationToken);
        var role = new Role
        {
            Name = name, Description = dto.Description?.Trim(), IsSystem = false, IsActive = true,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };
        _dbContext.Roles.Add(role);
        await _dbContext.SaveChangesAsync(cancellationToken);
        foreach (var permissionId in permissionIds)
            _dbContext.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permissionId });
        await _dbContext.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(role.Id, cancellationToken))!;
    }

    public async Task<RoleResponseDto?> UpdateAsync(int id, UpdateRoleDto dto, CancellationToken cancellationToken = default)
    {
        var role = await _dbContext.Roles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (role is null) return null;
        if (role.IsSystem) throw new InvalidOperationException("The system administrator role cannot be modified.");
        if (!dto.IsActive && await _dbContext.Users.AnyAsync(x => x.Role == role.Name && x.IsActive, cancellationToken))
            throw new InvalidOperationException("This role is assigned to active users and cannot be deactivated.");

        var permissionIds = await ResolvePermissionIdsAsync(dto.PermissionCodes, cancellationToken);
        role.Description = dto.Description?.Trim();
        role.IsActive = dto.IsActive;
        role.UpdatedAt = DateTime.UtcNow;
        var existing = await _dbContext.RolePermissions.Where(x => x.RoleId == id).ToListAsync(cancellationToken);
        _dbContext.RolePermissions.RemoveRange(existing);
        foreach (var permissionId in permissionIds)
            _dbContext.RolePermissions.Add(new RolePermission { RoleId = id, PermissionId = permissionId });
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    private async Task<List<int>> ResolvePermissionIdsAsync(IReadOnlyList<string> codes, CancellationToken cancellationToken)
    {
        var normalized = codes.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        var permissions = await _dbContext.Permissions.Where(x => normalized.Contains(x.Code)).Select(x => new { x.Id, x.Code }).ToListAsync(cancellationToken);
        if (permissions.Count != normalized.Count)
        {
            var missing = normalized.Except(permissions.Select(x => x.Code), StringComparer.OrdinalIgnoreCase);
            throw new ArgumentException($"Unknown permission(s): {string.Join(", ", missing)}");
        }
        return permissions.Select(x => x.Id).ToList();
    }

    private static RoleResponseDto Map(Role role, int userCount, IEnumerable<string> permissionCodes) => new()
    {
        Id = role.Id, Name = role.Name, Description = role.Description, IsSystem = role.IsSystem, IsActive = role.IsActive,
        UserCount = userCount, PermissionCodes = permissionCodes.OrderBy(x => x).ToList(), CreatedAt = role.CreatedAt
    };
}
