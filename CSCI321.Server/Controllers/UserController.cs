using System.Security.Claims;
using CSCI321.Server.Helpers;
using CSCI321.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;

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

    [HttpPost("signUp")]
    public async Task<IActionResult> Post(User2 newUser)
    {
        Console.WriteLine(newUser.userType);
        try
        {
            var existingUser = await _userService.CheckDuplicateUserIdAsync(newUser.userId);

            if (existingUser)
            {
                return BadRequest(new { message = "User Already Exists!" });
            }
            
            //newUser.password = HashPassword(newUser.password);
            newUser.refreshTokenExpiry = DateTime.UtcNow.AddDays(30);
            newUser.dateOfBirth = DateTime.UtcNow.AddDays(1);
            
            await _userService.CreateAsync(newUser);
            return CreatedAtAction("Post", new { id = newUser.userId }, newUser);
        }
        catch (Exception ex)
        { 
            return StatusCode(500, "Internal server error.");
        }
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
        
        var userType = principal.FindFirst("userType").Value;
        
        Console.WriteLine($"UserType in refreshToken: {userType}");
        
        
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier).Value;
    
        Console.WriteLine($"User Id in refreshToken: {userId}");
        
        var user = await _userService.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound("User not found.");
        }
        
        Console.WriteLine($"UserType in refreshToken2: {userType}");

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
        var newAccessToken = _authService.GenerateAccessToken(user.userId, user.email, userType);

        
        return Ok(new { accessToken = newAccessToken });
    }
    
    [Authorize]
    [HttpGet("getUserType/{userId}")]
    public async Task<IActionResult> GetUserTypeByToken(string userId)
    {
        //var userId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
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

        return Ok(new { user.userType });
        
    }
    
    [Authorize]
    [HttpGet("get")]
    public async Task<IActionResult> GetUserByToken()
    {

        var userId =  User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        Console.WriteLine(userId);
        
        var user = await _userService.GetByIdAsync(userId);

        Console.WriteLine(user.ToString());
        
        
        if (user == null)
        {
            return NotFound("User not found.");
        }

        return Ok(user);
    }
    
    public async Task<IActionResult> GetUserByEmail(string email)
    {
        var user = await _userService.GetUserByEmailAsync(email);
        
        if (user == null)
        {
            return NotFound("User not found");
        }

        return Ok(user); // Return user details
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel loginData)
    {
        
        // Find the user by email
        Dictionary<string, AttributeValue> userAttributes = await _userService.GetUserByEmailAsync(loginData.Email);

        var userId = userAttributes.ContainsKey("userId") ? userAttributes["userId"].S : null;
        var userType = userAttributes.ContainsKey("userType") ? userAttributes["userType"].S : null;
        var password = userAttributes.ContainsKey("password") ? userAttributes["password"].S : null;
        var name = userAttributes.ContainsKey("name") ? userAttributes["name"].S : null;  // If name is present
        var email = userAttributes.ContainsKey("email") ? userAttributes["email"].S : null;
        
        

        
        // Log if user was found or not
        if (userAttributes != null)
        {
            Console.WriteLine($"User found: {email}");
        }
        else
        {
            
            Console.WriteLine("User not found");
            return Unauthorized("Invalid credentials.");
        }

        // Hash the password provided in loginData and compare it with the stored hashed password
        var hashedPassword = HashPassword(loginData.Password);
        
        if (password != hashedPassword) { return Unauthorized("Invalid credentials."); }

        // if user is of different type
        if(userType != loginData.UserType) { return Unauthorized("Invalid Credentials"); }
        
        // Generate JWT token
        var accessToken = _authService.GenerateAccessToken(userId, email, userType); 

        var refreshToken = _authService.GenerateRefreshToken();
        
        await _userService.StoreRefreshToken(userId, refreshToken, DateTime.UtcNow.AddDays(30)); // 30 days expiration
        
        
        return Ok(new { accessToken});
    }
    
    [Authorize]
    [HttpPut("updateUser")]
    public async Task<IActionResult> UpdateUser([FromBody] User updatedUser)
    {
        
        if (updatedUser == null || string.IsNullOrEmpty(updatedUser.userId))
        {
            return BadRequest("Invalid user data.");
        }
        
        var existingUser = await _userService.GetByIdAsync(updatedUser.userId);
        if (existingUser == null)
        {
            return NotFound("User not found.");
        }
        
        
        // Update fields only if they are not null or empty
        if (!string.IsNullOrEmpty(updatedUser.name))
        {
            existingUser.name = updatedUser.name;
        }


        if (updatedUser.dateOfBirth != null)
        {
            existingUser.dateOfBirth = updatedUser.dateOfBirth;
        }

        if (!string.IsNullOrEmpty(updatedUser.phoneNumber))
        {
            existingUser.phoneNumber = updatedUser.phoneNumber;
        }

        if (!string.IsNullOrEmpty(updatedUser.title))
        {
            existingUser.title = updatedUser.title;
        }

        if (updatedUser.tickets != null && updatedUser.tickets.Any())
        {
            existingUser.tickets = updatedUser.tickets;
        }

        await _userService.UpdateUserAsync(existingUser);

        return Ok(existingUser);
    }

    [Authorize]
    [HttpPut("updateUserPassword")]
    public async Task<IActionResult> UpdateUserPassword([FromBody] PasswordForm passwordForm)
    {
        
        if (passwordForm == null || string.IsNullOrEmpty(passwordForm.userId))
        {
            return BadRequest("Invalid form data.");
        }
        
        var existingUser = await _userService.GetPasswordByIdAsync(passwordForm.userId);
        if (existingUser == null)
        {
            return NotFound("User not found.");
        }

        // Check if old Password entered is the same as current user password
        if (HashPassword(passwordForm.oldPassword) != existingUser.password)
        {
            return Unauthorized("Old Password does not match.");
        }
        
        // update existing user password with new hashed password then update user in DB
        existingUser.password = HashPassword(passwordForm.newPassword);
        
        await _userService.UpdateUserPasswordAsync(existingUser);

        return Ok(existingUser);
    }


}

