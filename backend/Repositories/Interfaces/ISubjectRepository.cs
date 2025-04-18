using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
  public interface ISubjectRepository
  {
    Task<List<Subject>> GetAllSubjectsAsync(string teacherCode, int subjectId);
    Task<bool> UpdateMaxStudentCountAsync(int subjectId, int maxStudentCount);
  }
}