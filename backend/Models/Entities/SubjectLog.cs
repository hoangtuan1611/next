namespace backend.Models.Entities
{
  public class SubjectLog
  {
    public int id { get; set; }
    public int CurrentCount { get; set; }
    public DateOnly CreateDate { get; set; }
    public TimeOnly CreateTime { get; set; }
    public string ImgPath { get; set; }

    public int TeachingSessionId { get; set; }
    public TeachingSession TeachingSession { get; set; }
  }
}