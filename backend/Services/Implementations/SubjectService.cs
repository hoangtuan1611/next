using AutoMapper;
using backend.Models.Dtos;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
  public class SubjectService : ISubjectService
  {
    private readonly ISubjectRepository _repository;
    private readonly IMapper _mapper;

    public SubjectService(ISubjectRepository repository, IMapper mapper)
    {
      _repository = repository;
      _mapper = mapper;
    }

    public async Task<List<SubjectDto>> GetSubjectsByTeacherCode(string teacherCode)
    {
      var result = await _repository.GetAllSubjectsAsync(teacherCode);
      var dto = _mapper.Map<List<SubjectDto>>(result);
      return dto;
    }
  }
}