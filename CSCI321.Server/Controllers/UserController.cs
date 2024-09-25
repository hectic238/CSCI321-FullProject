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
    public UserController(UserService usersService)
    {
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
}

