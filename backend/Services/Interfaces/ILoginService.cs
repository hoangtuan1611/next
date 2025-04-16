using backend.Models.Request;

namespace backend.Services.Interfaces
{
  public interface ILoginService
  {
    Task<string> ResponseToken(LoginRequest request);
  }
}