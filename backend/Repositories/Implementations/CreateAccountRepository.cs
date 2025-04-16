using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations
{
  public class CreateAccountRepository : ICreateAccountRepository
  {
    private readonly AppDbContext _context;

    public CreateAccountRepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task AddAccountAsync(User user)
    {
      await _context.Users.AddAsync(user);
      await _context.SaveChangesAsync();
    }

    public async Task<bool> CheckAccountAsync(string code, string username, string role)
    {
      var userExists = await _context.Users.AnyAsync(u =>
        u.Username == username ||
        u.Code == code);

      var codeExists = role switch
      {
        "teacher" => await _context.Teachers.AnyAsync(t => t.TeacherCode == code),
        _ => false
      };

      if (!userExists && codeExists)
      {
        return false;
      }

      return true;
    }
  }
}