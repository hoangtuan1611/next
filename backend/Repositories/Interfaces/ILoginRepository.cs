using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
  public interface ILoginRepository
  {
    Task<User> CheckUser(string username);
  }
}