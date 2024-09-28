using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

public class AuthController : ControllerBase {

    private readonly AuthService _authService;

    public AuthController(AuthService authService) {
        _authService = authService;
    }


    [HttpPost("refreshToken")]
    public IActionResult RefreshToken()
    {

    var authHeader = Request.Headers["Authorization"].FirstOrDefault();
    
    if (authHeader == null || !authHeader.StartsWith("Bearer "))
    {
        return Unauthorized("Refresh token is missing or invalid.");
    }

    var refreshToken = authHeader.Substring("Bearer ".Length).Trim();

    // Validate the refresh token
    var principal = _authService.GetPrincipalFromExpiredToken(refreshToken); // Validate and get the claims

    if (principal == null)
    {
        return Unauthorized("Invalid refresh token.");
    }

    // Generate a new access token
    var newAccessToken = _authService.GenerateJwtToken(
                principal.FindFirst(ClaimTypes.NameIdentifier).Value,
                            principal.FindFirst(ClaimTypes.Email).Value,
                            principal.FindFirst(ClaimTypes.Role).Value, 
                            1);
    
    return Ok(new { accessToken = newAccessToken });

        // // Validate the refresh token...
        // var principal = _authService.GetPrincipalFromExpiredToken(expiredToken);
        
        // if (principal != null)
        // {
        //     // Generate a new access token
        //     var newAccessToken = _authService.GenerateJwtToken(
        //         Guid.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value),
        //                     principal.FindFirst(ClaimTypes.Email).Value,
        //                     principal.FindFirst(ClaimTypes.Role).Value, 
        //                     1);
            
        //     return Ok(new { accessToken = newAccessToken });
        // }

        // return Unauthorized();
    }

}