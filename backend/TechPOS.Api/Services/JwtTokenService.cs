using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TechPOS.Api.Interfaces;
using TechPOS.Api.Models;

namespace TechPOS.Api.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;
    public JwtTokenService(IConfiguration configuration) => _configuration = configuration;

    public (string Token, DateTime ExpiresAt) CreateToken(User user)
    {
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
        var issuer = _configuration["Jwt:Issuer"] ?? "TechPOS.Api";
        var audience = _configuration["Jwt:Audience"] ?? "TechPOS.Web";
        var expiryMinutes = _configuration.GetValue<int?>("Jwt:ExpiryMinutes") ?? 480;
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };
        var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
        var jwt = new JwtSecurityToken(issuer, audience, claims, expires: expiresAt, signingCredentials: credentials);
        return (new JwtSecurityTokenHandler().WriteToken(jwt), expiresAt);
    }
}
