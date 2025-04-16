namespace backend.Models.Entities
{
  public class Teacher
  {
    public string TeacherCode { get; set; }
    public string TeacherName { get; set; }

    public ICollection<Subject> Subjects { get; set; }
    public ICollection<TeachingWeek> TeachingWeeks { get; set; }
  }
}