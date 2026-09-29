using TechPOS.Api.Models;

namespace TechPOS.Api.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) CreateToken(User user);
}
