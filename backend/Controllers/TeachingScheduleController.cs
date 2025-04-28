using backend.Data;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models.Dtos;

namespace backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class TeachingScheduleController : ControllerBase
  {
    private readonly ITeachingScheduleService _service;
    private readonly AppDbContext _context;

    public TeachingScheduleController(
      ITeachingScheduleService service,
      AppDbContext context)
    {
      _service = service;
      _context = context;
    }

    [HttpGet("{weekNum}")]
    public async Task<IActionResult> GetScheduleByWeek(
      int weekNum,
      [FromQuery] DateTime startDate,
      [FromQuery] DateTime endDate,
      [FromQuery] string teacherCode)
    {
      var result = await _service.GetWeeklyScheduleAsync(weekNum, startDate, endDate, teacherCode);
      if (result == null) return NotFound();
      return Ok(result);
    }

    [HttpGet("all/{weekNum}")]
    public async Task<IActionResult> GetAllTeachersSchedule(
      int weekNum,
      [FromQuery] DateTime startDate,
      [FromQuery] DateTime endDate)
    {
      var teachers = await _context.Teachers.ToListAsync();
      var schedules = new List<WeeklyScheduleDto>();

      foreach (var teacher in teachers)
      {
        var schedule = await _service.GetWeeklyScheduleAsync(weekNum, startDate, endDate, teacher.TeacherCode);
        if (schedule != null)
        {
          schedules.Add(schedule);
        }
      }

      return Ok(schedules);
    }
  }
}