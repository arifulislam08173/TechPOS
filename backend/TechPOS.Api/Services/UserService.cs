using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechPOS.Api.Data;
using TechPOS.Api.DTOs.Users;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;
using TechPOS.Api.Models;

namespace TechPOS.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(AppDbContext dbContext, IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<PagedResult<UserResponseDto>> GetAllAsync(UserQueryDto request, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Users.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => EF.Functions.ILike(x.FullName, $"%{search}%") || EF.Functions.ILike(x.Email, $"%{search}%"));
        }
        if (!string.IsNullOrWhiteSpace(request.Role)) query = query.Where(x => x.Role == request.Role);
        if (request.IsActive.HasValue) query = query.Where(x => x.IsActive == request.IsActive.Value);
        query = query.OrderBy(x => x.FullName);
        var totalItems = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(x => new UserResponseDto
            {
                Id = x.Id, FullName = x.FullName, Email = x.Email, Role = x.Role,
                IsActive = x.IsActive, CreatedAt = x.CreatedAt, UpdatedAt = x.UpdatedAt
            }).ToListAsync(cancellationToken);
        return new PagedResult<UserResponseDto>
        {
            Items = items, Page = request.Page, PageSize = request.PageSize, TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)request.PageSize)
        };
    }

    public async Task<UserResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _dbContext.Users.AsNoTracking().Where(x => x.Id == id).Select(x => new UserResponseDto
        {
            Id = x.Id, FullName = x.FullName, Email = x.Email, Role = x.Role,
            IsActive = x.IsActive, CreatedAt = x.CreatedAt, UpdatedAt = x.UpdatedAt
        }).FirstOrDefaultAsync(cancellationToken);

    public async Task<UserResponseDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _dbContext.Users.AnyAsync(x => x.Email == email, cancellationToken))
            throw new InvalidOperationException("A user with this email already exists.");
        await EnsureRoleAsync(dto.Role, cancellationToken);
        var passwordError = PasswordPolicy.Validate(dto.Password);
        if (passwordError is not null) throw new ArgumentException(passwordError);

        var user = new User
        {
            FullName = dto.FullName.Trim(), Email = email, Role = dto.Role.Trim(), IsActive = true,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(user.Id, cancellationToken))!;
    }

    public async Task<UserResponseDto?> UpdateAsync(int id, int actingUserId, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null) return null;
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _dbContext.Users.AnyAsync(x => x.Id != id && x.Email == email, cancellationToken))
            throw new InvalidOperationException("Another user already uses this email address.");
        await EnsureRoleAsync(dto.Role, cancellationToken);

        if (id == actingUserId && !dto.IsActive)
            throw new InvalidOperationException("You cannot deactivate your own account.");
        if (user.Role == "Admin" && (dto.Role != "Admin" || !dto.IsActive))
        {
            var otherAdmins = await _dbContext.Users.CountAsync(x => x.Id != id && x.IsActive && x.Role == "Admin", cancellationToken);
            if (otherAdmins == 0) throw new InvalidOperationException("At least one active administrator must remain.");
        }

        user.FullName = dto.FullName.Trim();
        user.Email = email;
        user.Role = dto.Role.Trim();
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task ResetPasswordAsync(int id, ResetPasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");
        if (dto.NewPassword != dto.ConfirmPassword) throw new ArgumentException("Password and confirmation do not match.");
        var passwordError = PasswordPolicy.Validate(dto.NewPassword);
        if (passwordError is not null) throw new ArgumentException(passwordError);
        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureRoleAsync(string roleName, CancellationToken cancellationToken)
    {
        var role = roleName.Trim();
        if (!await _dbContext.Roles.AnyAsync(x => x.Name == role && x.IsActive, cancellationToken))
            throw new ArgumentException("The selected role does not exist or is inactive.");
    }
}
