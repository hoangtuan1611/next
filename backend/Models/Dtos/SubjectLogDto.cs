using backend.Models.Entities;

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
    public string SessionDate { get; set; }
    public double AvgCurrentCount { get; set; }
  }

  public class TeachingSessionLogDto
  {
    public int LessonNumber { get; set; }
    public int TeachingSessionId { get; set; }
    public string TaughtLessons { get; set; }
    public string SessionDate { get; set; }
    public double AvgCurrentCount { get; set; }
  }

  public class SubjectLogGroupResult
  {
    public DateOnly CreateDate { get; set; }
    public List<SubjectLogGroupSummaryDto> TeachingSession { get; set; }
  }

  public class SubjectLogGroupSummaryDto
  {
    public int TeachingSession { get; set; }
    public string TeacherName { get; set; }
    public string SubjectName { get; set; }
    public string ClassName { get; set; }
    public int MaxSudent { get; set; }
    public SubjectLogGroupItemDto FirstLog { get; set; }
    public SubjectLogGroupItemDto LastLog { get; set; }
  }

  public class SubjectLogGroupItemDto
  {
    public TimeOnly CreateTime { get; set; }
    public int CurrentCount { get; set; }
    public string ImgPath { get; set; }
  }
}