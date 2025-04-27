using backend.Data;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class SubjectLogController : ControllerBase
  {
    private readonly ISubjectLogService _service;
    private readonly AppDbContext _context;

    public SubjectLogController(ISubjectLogService service, AppDbContext context)
    {
      _service = service;
      _context = context;
    }

    [HttpGet("session/{createDate}")]
    public async Task<ActionResult> GetLogSession(DateOnly createDate, int subjectId)
    {
      var result = await _service.GetLogSessionBySubject(createDate, subjectId);
      if (!result.Any()) return NotFound();
      return Ok(result);
    }

    [HttpGet("{subjectId}")]
    public async Task<ActionResult> GetAllLog(int subjectId)
    {
      var result = await _service.GetAllLogsBySubjectAsync(subjectId);
      if (!result.Any()) return NotFound();
      return Ok(result);
    }

    [HttpGet("Grouped")]
    public async Task<ActionResult> GetAllLogGrouped()
    {
      var result = await _service.GetGroupedLogs();
      if (!result.Any()) return NotFound();
      return Ok(result);
    }

    [HttpGet("GroupedByRoom")]
    public async Task<ActionResult> GetAllLogGroupedByRoom()
    {
      // var result = await _service.GetGroupedLogsByRoom();
      // if (!result.Any()) return NotFound();
      var result = await _context.SubjectLogs
        .Include(i => i.TeachingSession.Subject.Teacher)
        .GroupBy(g => g.TeachingSession.Subject.Room)
        .Select(s => new
        {
          Room = s.Key,
          CreateDate = s.GroupBy(g => g.CreateDate)
            .Select(s => new
            {
              CreateDate = s.Key,
              TeacherName = s.First().TeachingSession.Subject.Teacher.TeacherName,
              Subjectname = s.First().TeachingSession.Subject.SubjectName,
              ClassName = s.First().TeachingSession.Subject.ClassName,
              MaxStudent = s.First().TeachingSession.Subject.MaxStudent,
              FirstTime = s.ToList().OrderBy(o => o.CreateTime).Select(s => new
              {
                CurrentCount = s.CurrentCount,
                DateTime = s.CreateTime
              }).FirstOrDefault(),
              LastTime = s.ToList().OrderByDescending(o => o.CreateTime).Select(s => new
              {
                CurrentCount = s.CurrentCount,
                DateTime = s.CreateTime
              }).FirstOrDefault()
            })
            .ToList()
        })
        .ToListAsync();
      return Ok(result);
    }

    [HttpGet("GroupedByTeacher")]
    public async Task<ActionResult> GetAllLogGroupedByTeacher()
    {
      var result = await _context.SubjectLogs
        .Include(i => i.TeachingSession.Subject.Teacher)
        .GroupBy(g => g.TeachingSession.Subject.Teacher.TeacherName)
        .Select(s => new
        {
          TeacherName = s.Key,
          Subject = s.GroupBy(g => g.TeachingSession.Subject.SubjectName).Select(s => new
          {
            SubjectName = s.Key,
            MaxStudent = s.First().TeachingSession.Subject.MaxStudent,
            CreateDate = s.GroupBy(g => g.CreateDate).Select(s => new
            {
              CreateDate = s.Key,
              ClassName = s.First().TeachingSession.Subject.ClassName,
              Room = s.First().TeachingSession.Subject.Room,
              FirstTime = s.ToList().OrderBy(o => o.CreateTime).Select(s => new
              {
                CurrentCount = s.CurrentCount,
                DateTime = s.CreateTime
              }).FirstOrDefault(),
              LastTime = s.ToList().OrderByDescending(o => o.CreateTime).Select(s => new
              {
                CurrentCount = s.CurrentCount,
                DateTime = s.CreateTime
              }).FirstOrDefault()
            }).ToList()
          }).ToList()
        }).ToListAsync();
      return Ok(result);
    }
  }
}