
namespace CSCI321.Server.Models {
public class LoginModel
    {
        public string UserType { get; set; }  // User ID (if applicable)
        public string Email { get; set; }    // User email
        public string Password { get; set; }  // User password
    }
}