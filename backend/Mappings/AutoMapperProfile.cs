using AutoMapper;
using backend.Models.Dtos;
using backend.Models.Entities;

namespace backend.Mappings
{
  public class AutoMapperProfile : Profile
  {
    public AutoMapperProfile()
    {
      CreateMap<TeachingSession, ScheduleItemDto>()
            .ForMember(dest => dest.Subject, opt => opt.MapFrom(src => src.Subject.SubjectName))
            .ForMember(dest => dest.ClassCode, opt => opt.MapFrom(src => src.Subject.ClassCode))
            .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.Subject.ClassName))
            .ForMember(dest => dest.Room, opt => opt.MapFrom(src => src.Subject.Room))
            .ForMember(dest => dest.TimeBegin, opt => opt.MapFrom(src => src.TimeBegin.ToString(@"hh\:mm")))
            .ForMember(dest => dest.TimeEnd, opt => opt.MapFrom(src => src.TimeEnd.ToString(@"hh\:mm")));

      CreateMap<Subject, SubjectDto>().ReverseMap();
      CreateMap<SubjectLog, SubjectLogDto>().ReverseMap();
    }
  }
}