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
      // var result = await _context.TeachingSessions
      //     .Where(ts => ts.SubjectId == subjectId)
      //     .Select(ts => new TeachingSessionInfo
      //     {
      //       TeachingSessionId = ts.id,
      //       TaughtLessons = ts.TaughtLessons,
      //       AvgCurrentCount = ts.SubjectLogs.Any()
      //                           ? ts.SubjectLogs.Average(log => (double?)log.CurrentCount) ?? 0.0
      //                           : 0.0
      //     })
      //     .ToListAsync();
      // return result;
      var sessions = await _context.TeachingSessions
    .Include(ts => ts.TeachingWeek)
    .Where(ts => ts.SubjectId == subjectId)
    .Select(ts => new
    {
      ts.id,
      ts.DayOfWeek,
      ts.TaughtLessons,
      StartDate = ts.TeachingWeek.StartDate,
      Logs = ts.SubjectLogs
    })
    .ToListAsync();

      var result = sessions.Select(s =>
      {
        var date = GetDateOfSession(s.StartDate, s.DayOfWeek);
        return new TeachingSessionInfo
        {
          TeachingSessionId = s.id,
          TaughtLessons = s.TaughtLessons,
          SessionDate = date.ToString("dd/MM/yyyy"),
          AvgCurrentCount = s.Logs.Any()
              ? s.Logs.Average(log => (double?)log.CurrentCount) ?? 0.0
              : 0.0
        };
      });

      return result;
    }

    private DateTime GetDateOfSession(DateTime startDate, string dayOfWeek)
    {
      var dayOffsets = new Dictionary<string, int>
    {
        { "Thứ 2", 0 },
        { "Thứ 3", 1 },
        { "Thứ 4", 2 },
        { "Thứ 5", 3 },
        { "Thứ 6", 4 },
        { "Thứ 7", 5 },
        { "Chủ nhật", 6 }
    };

      return dayOffsets.TryGetValue(dayOfWeek, out int offset)
          ? startDate.AddDays(offset)
          : startDate;
    }
  }
}