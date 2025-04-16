using AutoMapper;
using backend.Models.Dtos;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
  public class TeachingScheduleService : ITeachingScheduleService
  {
    private readonly ITeachingScheduleRepository _repository;
    private readonly IMapper _mapper;

    public TeachingScheduleService(ITeachingScheduleRepository repository, IMapper mapper)
    {
      _repository = repository;
      _mapper = mapper;
    }

    public async Task<WeeklyScheduleDto> GetWeeklyScheduleAsync(int weekNum, DateTime startDate, DateTime endDate)
    {
      var sessions = await _repository.GetSessionsByWeekAsync(weekNum);
      var week = await _repository.GetTeachingWeekAsync(weekNum, startDate, endDate);
      if (week == null) return null;

      var schedule = new Dictionary<string, DayScheduleDto>();
      string[] days = new[] { "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật" };
      foreach (var day in days)
      {
        schedule[day] = new DayScheduleDto();
      }

      foreach (var session in sessions)
      {
        var dto = _mapper.Map<ScheduleItemDto>(session);
        var day = session.DayOfWeek;
        var timeOfDay = session.TimeOfDay.ToLower();
        if (schedule.ContainsKey(day))
        {
          switch (timeOfDay)
          {
            case "buổi sáng": schedule[day].Morning.Add(dto); break;
            case "buổi chiều": schedule[day].Afternoon.Add(dto); break;
            case "buổi tối": schedule[day].Evening.Add(dto); break;
          }
        }
      }

      return new WeeklyScheduleDto
      {
        Metadata = new MetadataDto
        {
          WeekNumber = week.WeekNumber,
          StartDate = week.StartDate.ToString("dd/MM/yyyy"),
          EndDate = week.EndDate.ToString("dd/MM/yyyy"),
          ProfessorName = week.Teacher?.TeacherName ?? string.Empty
        },
        Schedule = schedule
      };
    }
  }
}
