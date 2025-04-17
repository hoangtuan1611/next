using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class TeachingScheduleController : ControllerBase
  {
    private readonly ITeachingScheduleService _service;

    public TeachingScheduleController(ITeachingScheduleService service)
    {
      _service = service;
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
  }
}