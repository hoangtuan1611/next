using backend.Models.Request;

namespace backend.Services.Interfaces
{
  public interface ICreateAccountService
  {
    Task<bool> CreateAccount(CreateAccountRequest request);
  }
}