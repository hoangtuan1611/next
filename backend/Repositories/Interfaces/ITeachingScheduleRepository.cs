using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
  public interface ITeachingScheduleRepository
  {
    Task<List<TeachingSession>> GetSessionsByWeekAsync(int weekNum, string teacherCode);
    Task<TeachingWeek> GetTeachingWeekAsync(int weekNum, DateTime startDate, DateTime endDate, string teacherCode);
  }
}