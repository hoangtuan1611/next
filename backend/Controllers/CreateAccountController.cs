using backend.Models.Request;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class CreateAccountController : ControllerBase
  {
    private readonly ICreateAccountService _service;

    public CreateAccountController(ICreateAccountService service)
    {
      _service = service;
    }

    [HttpPost]
    public async Task<ActionResult> CreateAccount([FromBody] CreateAccountRequest body)
    {
      var result = await _service.CreateAccount(body);
      if (!result) return NotFound("Teacher code already exists.");

      return Ok("Account has been created successfully.");
    }
  }
}