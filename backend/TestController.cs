using AutoMapper;
using backend.Data;
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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
      var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

      if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
      {
        return Unauthorized("Invalid credentials");
      }

      var token = _tokenService.GenerateToken(user.Username, user.Role);

      return Ok(new { Token = token });
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
  }
}