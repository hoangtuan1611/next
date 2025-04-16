namespace backend.Models.Request
{
  public static class RoleConst
  {
    public const string Admin = "admin";
    public const string Teacher = "teacher";
  }

  public class CreateAccountRequest
  {
    public string Username { get; set; }
    public string Password { get; set; }
    public string Role { get; set; } = RoleConst.Teacher;
    public string Code { get; set; }
  }
}