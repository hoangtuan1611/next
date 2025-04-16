namespace backend.Models.Dtos
{
  public class ScheduleItemDto
  {
    public string Subject { get; set; }
    public string ClassCode { get; set; }
    public string ClassName { get; set; }
    public string Period { get; set; }
    public int PeriodBegin { get; set; }
    public int PeriodEnd { get; set; }
    public string TimeBegin { get; set; }
    public string TimeEnd { get; set; }
    public string TaughtLessons { get; set; }
    public string Room { get; set; }
    public string Content { get; set; }
  }

  public class MetadataDto
  {
    public int WeekNumber { get; set; }
    public string StartDate { get; set; }
    public string EndDate { get; set; }
    public string ProfessorName { get; set; }
  }

  public class WeeklyScheduleDto
  {
    public MetadataDto Metadata { get; set; }
    public Dictionary<string, DayScheduleDto> Schedule { get; set; }
  }

  public class DayScheduleDto
  {
    public List<ScheduleItemDto> Morning { get; set; } = new();
    public List<ScheduleItemDto> Afternoon { get; set; } = new();
    public List<ScheduleItemDto> Evening { get; set; } = new();
  }

}