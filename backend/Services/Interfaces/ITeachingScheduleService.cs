using backend.Models.Dtos;

namespace backend.Services.Interfaces
{
  public interface ITeachingScheduleService
  {
    Task<WeeklyScheduleDto> GetWeeklyScheduleAsync(int weekNum, DateTime startDate, DateTime endDate);
  }
}