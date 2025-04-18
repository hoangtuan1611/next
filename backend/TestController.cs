using AutoMapper;
using backend.Data;
using backend.Models.Dtos;
using backend.Models.Entities;
using backend.Models.Request;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend
{
  [ApiController]
  [Route("api/[controller]")]
  public class TestController : ControllerBase
  {
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITokenService _tokenService;

    public TestController(AppDbContext context, IMapper mapper, ITokenService tokenService)
    {
      _context = context;
      _mapper = mapper;
      _tokenService = tokenService;
    }

    [HttpGet("abc")]
    public async Task<ActionResult<IEnumerable<dynamic>>> Hello(int weekNum, string teacherCode)
    {
      var res = await _context.TeachingSessions
        .Include(s => s.Subject)
        .Include(s => s.TeachingWeek)
        .Where(s =>
          s.TeachingWeek.WeekNumber == weekNum &&
          s.TeachingWeek.TeacherCode == teacherCode)
        .ToListAsync();
      var list = new List<ScheduleItemDto>();
      foreach (var item in res)
      {
        var dto = _mapper.Map<ScheduleItemDto>(item);
        list.Add(dto);
      }
      return Ok(list);
    }

    [Authorize(Roles = "admin")]
    [HttpGet("admin-only")]
    public IActionResult AdminOnly()
    {
      return Ok("Chỉ admin mới thấy được route này.");
    }

    [Authorize(Roles = "teacher")]
    [HttpGet("teacher-only")]
    public IActionResult TeacherOnly()
    {
      return Ok("Giáo viên có thể thấy.");
    }

    [HttpGet]
    public async Task<ActionResult<SubjectLog>> GetAllLog()
    {
      var result = await _context.SubjectLogs.ToListAsync();
      return Ok(result);
    }
  }
}