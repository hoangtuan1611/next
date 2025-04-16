namespace backend.Models.Entities
{
  public class TeachingWeek
  {
    public int id { get; set; }

    public int WeekNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public string TeacherCode { get; set; }
    public Teacher Teacher { get; set; }

    public ICollection<TeachingSession> TeachingSessions { get; set; }
  }
}