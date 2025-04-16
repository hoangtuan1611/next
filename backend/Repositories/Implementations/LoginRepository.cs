using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations
{
  public class LoginRepository : ILoginRepository
  {
    private readonly AppDbContext _context;

    public LoginRepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task<User> CheckUser(string username)
    {
      var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
      if (user != null) return user;

      return null;
    }
  }
}