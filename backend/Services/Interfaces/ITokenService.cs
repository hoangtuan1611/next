namespace backend.Services.Interfaces
{
  public interface ITokenService
  {
    string GenerateToken(string username, string role, string code);
  }
}