using backend.Data;
using backend.Models.Dtos;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations
{
  public class TeachingSessionLogDto
  {
    public int TeachingSessionId { get; set; }
    public string TaughtLessons { get; set; }
    public double AvgCurrentCount { get; set; }
  }

  public class SubjectLogRepository : ISubjectLogRepository
  {
    private readonly AppDbContext _context;

    public SubjectLogRepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task<IEnumerable<SubjectLog>> GetLogSessionAsync(DateOnly createDate, int subjectId)
    {
      var result = await _context.SubjectLogs
        .Where(sl =>
          sl.CreateDate == createDate &&
          sl.TeachingSession.SubjectId == subjectId)
        .Include(sl => sl.TeachingSession)
        .ToListAsync();

      return result;
    }

    public async Task<IEnumerable<TeachingSessionInfo>> GetAllLogSessionAsync(int subjectId)
    {
      var result = await _context.TeachingSessions
          .Where(ts => ts.SubjectId == subjectId)
          .Select(ts => new TeachingSessionInfo
          {
            TeachingSessionId = ts.id,
            TaughtLessons = ts.TaughtLessons,
            AvgCurrentCount = ts.SubjectLogs.Any()
                                ? ts.SubjectLogs.Average(log => (double?)log.CurrentCount) ?? 0.0
                                : 0.0
          })
          .ToListAsync();
      return result;
    }
  }
}