using System.Security.Claims;
using backend.Models.Request;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class LoginController : ControllerBase
  {
    private readonly ILoginService _service;

    public LoginController(ILoginService service)
    {
      _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Login(LoginRequest request)
    {
      var token = await _service.ResponseToken(request);
      if (token == null)
      {
        return Unauthorized("Invalid credentials");
      }

      Response.Cookies.Append("token", token, new CookieOptions
      {
        HttpOnly = true,
        Secure = true, // true nếu chạy HTTPS
        SameSite = SameSiteMode.None,
        Expires = DateTime.UtcNow.AddMinutes(60)
      });

      return Ok(new { message = "Đăng nhập thành công" });
    }

    [HttpGet("CleearCookie")]
    public IActionResult ClearLoginCookie()
    {
      Response.Cookies.Delete("token");
      return Ok(new { message = "Cookie cleared" });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
      var name = User.Identity?.Name;
      var role = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
      var code = User.Claims.FirstOrDefault(c => c.Type == "code")?.Value;

      return Ok(new { name, role, code });
    }
  }
}