namespace backend.Models.Entities
{
  public class Subject
  {
    public int id { get; set; }

    public string ClassCode { get; set; }
    public string ClassName { get; set; }
    public string SubjectName { get; set; }
    public string Room { get; set; }
    public int MaxStudent { get; set; }

    public string TeacherCode { get; set; }
    public Teacher Teacher { get; set; }

    public ICollection<TeachingSession> TeachingSessions { get; set; }
  }
}