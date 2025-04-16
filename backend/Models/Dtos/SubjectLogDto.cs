namespace backend.Models.Dtos
{
  public class SubjectLogDto
  {
    public int id { get; set; }
    public int CurrentCount { get; set; }
    public DateOnly CreateDate { get; set; }
    public TimeOnly CreateTime { get; set; }
    public string ImgPath { get; set; }
  }

  public class TeachingSessionInfo
  {
    public int TeachingSessionId { get; set; }
    public string TaughtLessons { get; set; }
    public double AvgCurrentCount { get; set; }
  }

  public class TeachingSessionLogDto
  {
    public int LessonNumber { get; set; }
    public int TeachingSessionId { get; set; }
    public string TaughtLessons { get; set; }
    public double AvgCurrentCount { get; set; }
  }
}