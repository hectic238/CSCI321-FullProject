namespace CSCI321.Server.Models;

public class User2
{
    public string? userId { get; set; }
    public string? name { get; set; }
    public string? userType { get; set; }
    public string? company { get; set; }
    public string? preferences { get; set; }
    public string? refreshToken { get; set; }
    public DateTime? refreshTokenExpiry { get; set; } 
    public List<Ticket>? tickets { get; set; }
    public List<string>? interests { get; set; }
    public string? title { get; set; }
    public string? phoneNumber { get; set; }
    
    public DateTime dateOfBirth { get; set; }


}