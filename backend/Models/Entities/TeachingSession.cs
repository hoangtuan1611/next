namespace backend.Models.Entities
{
  public class TeachingSession
  {
    public int id { get; set; }

    public string DayOfWeek { get; set; }
    public string TimeOfDay { get; set; }

    public string Period { get; set; }
    public int PeriodBegin { get; set; }
    public int PeriodEnd { get; set; }

    public TimeSpan TimeBegin { get; set; }
    public TimeSpan TimeEnd { get; set; }

    public string TaughtLessons { get; set; }
    public string Content { get; set; }

    public int TeachingWeekId { get; set; }
    public TeachingWeek TeachingWeek { get; set; }

    public int SubjectId { get; set; }
    public Subject Subject { get; set; }

    public ICollection<SubjectLog> SubjectLogs { get; set; }
  }
}