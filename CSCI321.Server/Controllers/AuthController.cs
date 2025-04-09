using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CSCI321.Server.Helpers;

namespace CSCI321.Server.Controllers;
public class RefreshTokenRequest
{
    public string accessToken { get; set; }
}

public class AuthController : ControllerBase {

    private readonly AuthService _authService;
    
    private readonly UserService _userService;

    public AuthController(AuthService authService, UserService userService) {
        _authService = authService;
        _userService = userService;
    }

    

}