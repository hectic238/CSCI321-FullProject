namespace CSCI321.Server.Models;

public class PasswordForm
{
    public string oldPassword {get; set;}
    public string newPassword {get; set;}
    public string userId { get; set; }
}