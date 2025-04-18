using backend.Models.Request;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
  public class LoginService : ILoginService
  {
    private readonly ILoginRepository _repository;
    private readonly ITokenService _tokenService;

    public LoginService(ITokenService tokenService, ILoginRepository repository)
    {
      _tokenService = tokenService;
      _repository = repository;
    }

    public async Task<string> ResponseToken(LoginRequest request)
    {
      var user = await _repository.CheckUser(request.Username);

      if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
      {
        return null;
      }

      return _tokenService.GenerateToken(user.Username, user.Role, user.Code);
    }
  }
}