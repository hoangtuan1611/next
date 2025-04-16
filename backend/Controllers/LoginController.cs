using backend.Models.Request;
using backend.Services.Interfaces;
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

      return Ok(new { Token = token });
    }
  }
}