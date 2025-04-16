using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
  public interface ISubjectRepository
  {
    Task<List<Subject>> GetAllSubjectsAsync(string teacherCode);
  }
}