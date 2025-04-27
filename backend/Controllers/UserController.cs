using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class UserController : ControllerBase
  {
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUser()
    {
      var result = await _context.Users.ToListAsync();
      return Ok(result);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteUser([FromBody] int[] ids)
    {
      if (ids == null || ids.Length == 0) return BadRequest("No id provided");
      var results = await _context.Users.Where(e => ids.Contains(e.id)).ToListAsync();
      if (results.Count == 0) return NotFound();
      _context.Users.RemoveRange(results);
      await _context.SaveChangesAsync();
      return NoContent();
    }
  }
}