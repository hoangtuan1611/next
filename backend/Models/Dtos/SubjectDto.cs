namespace backend.Models.Dtos
{
  public class SubjectDto
  {
    public int id { get; set; }
    public string ClassCode { get; set; }
    public string ClassName { get; set; }
    public string SubjectName { get; set; }
    public string Room { get; set; }
    public int MaxStudent { get; set; }
    public string TeacherCode { get; set; }
  }
}