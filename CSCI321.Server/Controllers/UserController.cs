using System.Security.Claims;
using CSCI321.Server.Helpers;
using CSCI321.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using Amazon.Runtime.Internal;

namespace CSCI321.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    private readonly AuthService _authService;
    public UserController(UserService usersService, AuthService authService)
    {
        _authService = authService;
        _userService = usersService;
    }

    [HttpGet]
    public async Task<List<User>> Get() =>
    await _userService.GetAsync();

    [HttpPost]
    public async Task<IActionResult> Post(User newUser)
    {
        newUser.password = HashPassword(newUser.password);

        await _userService.CreateAsync(newUser);

        return CreatedAtAction(nameof(Get), new { id = newUser.userId }, newUser);
    }
    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
        }
    }
    
    
    [HttpGet("getRefreshExpiry")]
    public async Task<IActionResult> RefreshTokenExpiry()
    {
        
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        
        if (authHeader == null || !authHeader.StartsWith("Bearer "))
        {
            return Unauthorized("Refresh token is missing or invalid.");
        }

        var accessToken = authHeader.Substring("Bearer ".Length).Trim();

       // Console.WriteLine($"Access Token: {accessToken}");

        var principal = _authService.GetPrincipalFromExpiredToken(accessToken); // Validate and get the claims

        if (principal == null)
        {
            return Unauthorized("Invalid access token.");
        }
        
        
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier).Value;
    
        //Console.WriteLine($"User Id: {userId}");

        // Validate the refresh token
        var refreshTokenData = await _userService.GetRefreshTokenFromDB(userId); // Make sure userId is defined

        if (refreshTokenData == null)
        {
            return Unauthorized("Refresh token is invalid. Please log in again.");
        }

        var refreshTokenExpiry = refreshTokenData.Value.expiry;
        
        return Ok(new { refreshExpiry = refreshTokenExpiry });
    }
    
    [HttpPost("refreshToken")]
    public async Task<IActionResult> RefreshToken()
    {
        
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        
        if (authHeader == null || !authHeader.StartsWith("Bearer "))
        {
            return Unauthorized("Refresh token is missing or invalid.");
        }

        var accessToken = authHeader.Substring("Bearer ".Length).Trim();

        Console.WriteLine($"Access Token: {accessToken}");

        var principal = _authService.GetPrincipalFromExpiredToken(accessToken); // Validate and get the claims

        if (principal == null)
        {
            return Unauthorized("Invalid access token.");
        }
        
        Console.WriteLine(principal);
        
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier).Value;
    
        Console.WriteLine($"User Id in refreshToken: {userId}");
        
        var user = await _userService.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Validate the refresh token
        var refreshTokenData = await _userService.GetRefreshTokenFromDB(userId); // Make sure userId is defined

        if (refreshTokenData == null)
        {
            return Unauthorized("Refresh token is invalid. Please log in again.");
        }

        // Access the refreshToken and expiry from the returned tuple
        var storedRefreshToken = refreshTokenData.Value.refreshToken;
        var refreshTokenExpiry = refreshTokenData.Value.expiry;
        
        if (storedRefreshToken == null || refreshTokenExpiry <= DateTime.UtcNow)
        {
            return Unauthorized("Refresh token is expired or invalid. Please log in again.");
        }


        // Generate a new access token
        var newAccessToken = _authService.GenerateAccessToken(user);

        
        return Ok(new { accessToken = newAccessToken });
    }
    
    [Authorize]
    [HttpGet("getUserType")]
    public async Task<IActionResult> GetUserTypeByToken()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
        if (userId == null)
        {
            return Unauthorized("Invalid token.");
        }
        
        // Find the user by userId
        var user = await _userService.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        return Ok(user.userType); // Return the user details
    }
    
    [Authorize]
    [HttpGet("get")]
    public async Task<IActionResult> GetUserByToken()
    {

        var userId =  User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var user = await _userService.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        return Ok(user);
    }
    
    // public async Task<bool> ValidateRefreshToken(string userId, string token)
    // {
    //     var refreshTokenData = await _userService.GetRefreshTokenFromDB(userId);
    //
    //     if (refreshTokenData.HasValue)
    //     {
    //         var (refreshToken, expiry) = refreshTokenData.Value;
    //
    //         
    //         if (refreshToken == token && DateTime.UtcNow < expiry)
    //         {
    //             return true; // Token is valid
    //         }
    //         return false; // Token is invalid or expired
    //         
    //     }
    //
    //     return false;
    // }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel loginData)
    {

        // Find the user by email
        var user = await _userService.GetByEmailAsync(loginData.Email);
        
        // Log if user was found or not
        if (user != null) { Console.WriteLine($"User found: {user.email}");}
        else { Console.WriteLine("User not found"); }
        
        if (user == null) { return Unauthorized("Invalid credentials."); }

        // Hash the password provided in loginData and compare it with the stored hashed password
        var hashedPassword = HashPassword(loginData.Password);
        
        if (user.password != hashedPassword) { return Unauthorized("Invalid credentials."); }

        // if user is of different type
        if(user.userType != loginData.UserType) { return Unauthorized("Invalid Credentials"); }

        var userId = user.userId;
        // Generate JWT token
        var accessToken = _authService.GenerateAccessToken(user); // minute accessToken

        var refreshToken = _authService.GenerateRefreshToken();
        
        await _userService.StoreRefreshToken(userId, refreshToken, DateTime.UtcNow.AddDays(7)); // 7 days expiration
        
        // Return the token and user data
        return Ok(new { accessToken});
    }

}

