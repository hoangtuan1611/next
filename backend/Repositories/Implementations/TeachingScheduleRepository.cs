using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations
{
  public class TeachingScheduleRepository : ITeachingScheduleRepository
  {
    private readonly AppDbContext _context;

    public TeachingScheduleRepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task<List<TeachingSession>> GetSessionsByWeekAsync(int weekNum)
    {
      return await _context.TeachingSessions
        .Include(s => s.Subject)
        .Include(s => s.TeachingWeek)
        .Where(s => s.TeachingWeek.WeekNumber == weekNum)
        .ToListAsync();
    }

    public async Task<TeachingWeek> GetTeachingWeekAsync(int weekNum, DateTime startDate, DateTime endDate)
    {
      return await _context.TeachingWeeks
        .Include(w => w.Teacher)
        .FirstOrDefaultAsync(w =>
          w.WeekNumber == weekNum &&
          w.StartDate == startDate &&
          w.EndDate == endDate);
    }
  }
}