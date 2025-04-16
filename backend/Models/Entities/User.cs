namespace backend.Models.Entities
{
  public static class RoleConst
  {
    public const string Admin = "admin";
    public const string Teacher = "teacher";
  }

  public class User
  {
    public int id { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string Role { get; set; }
    public string Code { get; set; }
    public DateTime CreatedAt { get; set; }
  }
}