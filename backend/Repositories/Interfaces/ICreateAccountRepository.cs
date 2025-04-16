using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
  public interface ICreateAccountRepository
  {
    Task AddAccountAsync(User user);
    Task<bool> CheckAccountAsync(string code, string username, string role);
  }
}