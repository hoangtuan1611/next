using System.Text.RegularExpressions;
using AutoMapper;
using backend.Data;
using backend.Models.Dtos;
using backend.Models.Entities;
using backend.Models.Request;
using backend.Repositories.Interfaces;
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
    private readonly ISubjectLogService _subjectLogService;
    private readonly ISubjectLogRepository _subjectLogRepository;

    public TestController(
      AppDbContext context,
      IMapper mapper,
      ITokenService tokenService,
      ISubjectLogService subjectLogService,
      ISubjectLogRepository subjectLogRepository)
    {
      _context = context;
      _mapper = mapper;
      _tokenService = tokenService;
      _subjectLogService = subjectLogService;
      _subjectLogRepository = subjectLogRepository;
    }

    public class SubjectLogDto
    {
      public int Id { get; set; }
      public int CurrentCount { get; set; }
      public int MaxStudent { get; set; }
      public string CreateTime { get; set; }
      public string ImgPath { get; set; }
    }

    [HttpGet("abc")]
    public async Task<ActionResult> Hello()
    {
      var result = await _subjectLogService.GetGroupedLogs();
      return Ok(result);
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