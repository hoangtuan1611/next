using backend.Models.Dtos;
using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
  public interface ISubjectLogRepository
  {
    Task<IEnumerable<SubjectLog>> GetLogSessionAsync(DateOnly createDate, int subjectId);
    Task<IEnumerable<TeachingSessionInfo>> GetAllLogSessionAsync(int subjectId);
    Task<IEnumerable<SubjectLogGroupResult>> GetGroupedLogsAsync();
    Task<IEnumerable<SubjectLog>> GetGroupedLogsByRoomAsync();
  }
}