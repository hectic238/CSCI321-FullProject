using CSCI321.Server.Helpers;
using CSCI321.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

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
        newUser.Password = HashPassword(newUser.Password);

        await _userService.CreateAsync(newUser);

        return CreatedAtAction(nameof(Get), new { id = newUser.Id }, newUser);
    }
    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
        }
    }
<<<<<<< Updated upstream
=======

    // GET: api/User/{userId}
    [Authorize]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserById(string userId)
    {
        // Find the user by userId
        var user = await _userService.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        return Ok(user); // Return the user details
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel loginData)
    {

        
        // Find the user by email
        var user = await _userService.GetByEmailAsync(loginData.Email);
        
        // Log if user was found or not
        if (user != null)
        {
            Console.WriteLine($"User found: {user.email}"); // Log user's email for confirmation
        }
        else
        {
            Console.WriteLine("User not found");
        }
        
        if (user == null)
        {
            return Unauthorized("Invalid credentials.");
        }

        // Hash the password provided in loginData and compare it with the stored hashed password
        var hashedPassword = HashPassword(loginData.Password);
        
        if (user.password != hashedPassword)
        {
            return Unauthorized("Invalid credentials.");
        }

        // Generate JWT token
        var accessToken = _authService.GenerateJwtToken(user.userId, user.email, user.userType, 2); // minute accessToken

        var refreshToken = _authService.GenerateJwtToken(user.userId, user.email, user.userType, 60); // 1 hour refresh token

        var userResponse = new
        {
            userId = user.userId,
            email = user.email,
            userType = user.userType,
            // Add any other non-sensitive fields as necessary
        };

        // Return the token and user data
        return Ok(new { AccessToken = accessToken,  RefreshToken = refreshToken, User = userResponse });
    }

    
>>>>>>> Stashed changes
}

