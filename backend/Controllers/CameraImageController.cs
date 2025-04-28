using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CameraImageController : ControllerBase
    {
        private readonly string _imageFolder;

        public CameraImageController()
        {
            _imageFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "camera-images");
            if (!Directory.Exists(_imageFolder))
            {
                Directory.CreateDirectory(_imageFolder);
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveImage([FromBody] string base64Image)
        {
            try
            {
                var fileName = $"camera_{DateTime.Now:yyyyMMddHHmm}.jpg";
                var filePath = Path.Combine(_imageFolder, fileName);

                // Convert base64 to image and save
                var imageBytes = Convert.FromBase64String(base64Image.Split(',')[1]);
                await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                return Ok(new { fileName });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("images")]
        public IActionResult GetImages()
        {
            try
            {
                var files = Directory.GetFiles(_imageFolder, "*.jpg")
                    .Select(f => new
                    {
                        fileName = Path.GetFileName(f),
                        timestamp = System.IO.File.GetCreationTime(f)
                    })
                    .OrderByDescending(f => f.timestamp)
                    .ToList();

                return Ok(files);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
} 