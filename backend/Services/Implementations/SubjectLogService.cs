using AutoMapper;
using backend.Models.Dtos;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
  public class SubjectLogService : ISubjectLogService
  {
    private readonly ISubjectLogRepository _repository;
    private readonly IMapper _mapper;

    public SubjectLogService(ISubjectLogRepository repository, IMapper mapper)
    {
      _repository = repository;
      _mapper = mapper;
    }

    public async Task<IEnumerable<TeachingSessionLogDto>> GetAllLogsBySubjectAsync(int subjectId)
    {
      var sessionInfos = await _repository.GetAllLogSessionAsync(subjectId);

      var resultWithIndex = sessionInfos
          .Select((info, index) => new TeachingSessionLogDto
          {
            LessonNumber = index + 1,
            TeachingSessionId = info.TeachingSessionId,
            TaughtLessons = info.TaughtLessons,
            AvgCurrentCount = info.AvgCurrentCount
          });

      return resultWithIndex;
    }

    public async Task<IEnumerable<SubjectLogDto>> GetLogSessionBySubject(DateOnly createDate, int subjectId)
    {
      var result = await _repository.GetLogSessionAsync(createDate, subjectId);
      var dto = _mapper.Map<IEnumerable<SubjectLogDto>>(result);
      return dto;
    }

    public async Task<dynamic> GetAll(int subjectId)
    {
      var result = await _repository.GetAllLogSessionAsync(subjectId);
      return result;
    }
  }
}