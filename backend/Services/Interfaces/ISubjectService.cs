using backend.Models.Dtos;

namespace backend.Services.Interfaces
{
  public interface ISubjectService
  {
    Task<List<SubjectDto>> GetSubjectsByTeacherCode(string teacherCode, int subjectId);
    Task<bool> UpdateMaxStudent(int subjectId, int maxStudentCount);
  }
}