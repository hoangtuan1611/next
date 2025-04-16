using backend.Models.Dtos;

namespace backend.Services.Interfaces
{
  public interface ISubjectLogService
  {
    Task<dynamic> GetAll(int subjectId);
    Task<IEnumerable<SubjectLogDto>> GetLogSessionBySubject(DateOnly createDate, int subjectId);
    Task<IEnumerable<TeachingSessionLogDto>> GetAllLogsBySubjectAsync(int subjectId);
  }
}