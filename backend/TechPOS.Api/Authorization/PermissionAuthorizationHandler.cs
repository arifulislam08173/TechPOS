using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;

namespace TechPOS.Api.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly AppDbContext _dbContext;

    public PermissionAuthorizationHandler(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userIdValue = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdValue, out var userId))
            return;

        var roleName = await _dbContext.Users
            .AsNoTracking()
            .Where(x => x.Id == userId && x.IsActive)
            .Select(x => x.Role)
            .FirstOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(roleName))
            return;

        var allowed = await _dbContext.RolePermissions
            .AsNoTracking()
            .AnyAsync(x =>
                x.Role.IsActive &&
                x.Role.Name == roleName &&
                x.Permission.Code == requirement.Permission);

        if (allowed)
            context.Succeed(requirement);
    }
}
