using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class SubjectController : ControllerBase
  {
    private readonly ISubjectService _service;

    public SubjectController(ISubjectService service)
    {
      _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<Subject>> GetAllSubject([FromQuery] string teacherCode, [FromQuery] int subjectId)
    {
      var result = await _service.GetSubjectsByTeacherCode(teacherCode, subjectId);
      if (result == null || !result.Any()) return NotFound();
      return Ok(result);
    }

    [HttpPatch("{subjectId}")]
    public async Task<ActionResult> UpdateMaxStudentCount(int subjectId, [FromQuery] int maxStudentCount)
    {
      if (maxStudentCount <= 0)
      {
        return BadRequest("MaxStudent is required and must be greater than 0!");
      }
      var result = await _service.UpdateMaxStudent(subjectId, maxStudentCount);
      if (!result) return NotFound();
      return Ok("Subject has been updated");
    }
  }
}