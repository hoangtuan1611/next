using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models.Jwt;
using backend.Services.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services.Implementations
{
  public class TokenService : ITokenService
  {
    private readonly JwtSettings _settings;

    public TokenService(IOptions<JwtSettings> settings)
    {
      _settings = settings.Value;
    }

    public string GenerateToken(string username, string role)
    {
      var claims = new[]
      {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role)
        };

      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      var token = new JwtSecurityToken(
          issuer: _settings.Issuer,
          audience: _settings.Audience,
          claims: claims,
          expires: DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes),
          signingCredentials: creds
      );

      return new JwtSecurityTokenHandler().WriteToken(token);
    }
  }
}