using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

public class RefreshTokenRequest
{
    public string accessToken { get; set; }
}

public class AuthController : ControllerBase {

    private readonly AuthService _authService;

    public AuthController(AuthService authService) {
        _authService = authService;
    }


    [HttpPost("refreshToken")]
    public async Task<IActionResult> RefreshToken()
    {


    var authHeader = Request.Headers["Authorization"].FirstOrDefault();
    
    if (authHeader == null || !authHeader.StartsWith("Bearer "))
    {
        return Unauthorized("Refresh token is missing or invalid.");
    }

    var refreshToken = authHeader.Substring("Bearer ".Length).Trim();

    Console.WriteLine($"Refresh Token: {refreshToken}");

    var accessHeader = Request.Headers["Access-Token"].FirstOrDefault();

    var accessToken = accessHeader;

    if (string.IsNullOrEmpty(accessToken))
        {
            Console.WriteLine("AccessToken " , accessToken);
            return Unauthorized("Access token is missing.");
        }

    Console.WriteLine($"Access Token: {accessToken}");

    // Validate the refresh token
    var principal = _authService.GetPrincipalFromExpiredToken(accessToken); // Validate and get the claims

    if (principal == null)
    {
        return Unauthorized("Invalid access token.");
    }

// Extract user claims from the principal
    var userId = principal.FindFirst(ClaimTypes.NameIdentifier).Value;
    
    Console.WriteLine($"User Id: {userId}");


    // Generate a new access token
    var newAccessToken = _authService.GenerateJwtToken(userId, 2);

    
    return Ok(new { accessToken = newAccessToken });
    }

}