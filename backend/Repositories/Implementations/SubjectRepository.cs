using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations
{
  public class SubjectRepository : ISubjectRepository
  {
    private readonly AppDbContext _context;

    public SubjectRepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task<List<Subject>> GetAllSubjectsAsync(string teacherCode)
    {
      return await _context.Subjects
        .Where(s => s.TeacherCode == teacherCode)
        .ToListAsync();
    }
  }
}