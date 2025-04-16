using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class SubjectLogController : ControllerBase
  {
    private readonly ISubjectLogService _service;

    public SubjectLogController(ISubjectLogService service)
    {
      _service = service;
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
  }
}