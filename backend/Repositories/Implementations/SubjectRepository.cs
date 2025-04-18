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

    public async Task<List<Subject>> GetAllSubjectsAsync(string teacherCode, int subjectId)
    {
      var query = _context.Subjects.AsQueryable();
      if (!string.IsNullOrEmpty(teacherCode))
      {
        query = query.Where(s => s.TeacherCode == teacherCode);
      }
      if (subjectId != 0)
      {
        query = query.Where(s => s.id == subjectId);
      }
      return await query.ToListAsync();
    }

    public async Task<bool> UpdateMaxStudentCountAsync(int subjectId, int maxStudentCount)
    {
      var result = await _context.Subjects.FirstOrDefaultAsync(s => s.id == subjectId);
      if (result == null) return false;
      result.MaxStudent = maxStudentCount;
      await _context.SaveChangesAsync();
      return true;
    }
  }
}