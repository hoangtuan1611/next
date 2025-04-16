using backend.Models.Entities;
using backend.Models.Request;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
  public class CreateAccountService : ICreateAccountService
  {
    private readonly ICreateAccountRepository _repository;

    public CreateAccountService(ICreateAccountRepository repository)
    {
      _repository = repository;
    }

    public async Task<bool> CreateAccount(CreateAccountRequest body)
    {
      var result = await _repository.CheckAccountAsync(body.Code, body.Username, body.Role);
      if (result) return false;

      string passwordHash = BCrypt.Net.BCrypt.HashPassword(body.Password);

      var user = new User
      {
        Username = body.Username,
        Password = passwordHash,
        Role = body.Role,
        Code = body.Code
      };

      await _repository.AddAccountAsync(user);

      return true;
    }
  }
}