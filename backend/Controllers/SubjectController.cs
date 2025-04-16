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

    [HttpGet("{teacherCode}")]
    public async Task<ActionResult<Subject>> GetAllSubject(string teacherCode)
    {
      var result = await _service.GetSubjectsByTeacherCode(teacherCode);
      if (result == null) return NotFound();
      return Ok(result);
    }
  }
}