using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;
using TechPOS.Api.DTOs.Auth;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;
using TechPOS.Api.Models;

namespace TechPOS.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(AppDbContext dbContext, IPasswordHasher<User> passwordHasher, IJwtTokenService jwtTokenService)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user is null || !user.IsActive)
            return null;

        var roleActive = await _dbContext.Roles.AnyAsync(x => x.Name == user.Role && x.IsActive, cancellationToken);
        if (!roleActive)
            return null;

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verification == PasswordVerificationResult.Failed)
            return null;

        var (token, expiresAt) = _jwtTokenService.CreateToken(user);
        return new LoginResponseDto
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            User = await MapUserAsync(user, cancellationToken)
        };
    }

    public async Task<CurrentUserDto?> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        return user is null ? null : await MapUserAsync(user, cancellationToken);
    }

    public async Task<CurrentUserDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        if (user is null) return null;

        var email = dto.Email.Trim().ToLowerInvariant();
        var duplicate = await _dbContext.Users.AnyAsync(x => x.Id != userId && x.Email == email, cancellationToken);
        if (duplicate) throw new InvalidOperationException("Another user already uses this email address.");

        user.FullName = dto.FullName.Trim();
        user.Email = email;
        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await MapUserAsync(user, cancellationToken);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
        if (verification == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Current password is incorrect.");
        if (dto.NewPassword != dto.ConfirmPassword)
            throw new ArgumentException("New password and confirmation do not match.");
        var passwordError = PasswordPolicy.Validate(dto.NewPassword);
        if (passwordError is not null) throw new ArgumentException(passwordError);

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<CurrentUserDto> MapUserAsync(User user, CancellationToken cancellationToken)
    {
        var permissions = await _dbContext.RolePermissions.AsNoTracking()
            .Where(x => x.Role.Name == user.Role && x.Role.IsActive)
            .OrderBy(x => x.Permission.Code)
            .Select(x => x.Permission.Code)
            .ToListAsync(cancellationToken);

        return new CurrentUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Permissions = permissions
        };
    }
}
