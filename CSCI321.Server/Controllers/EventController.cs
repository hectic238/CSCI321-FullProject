using System.Security.Claims;
using CSCI321.Server.Helpers;
using CSCI321.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using MongoDB.Bson.IO;

namespace CSCI321.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly EventService _eventService;

    public EventController(EventService service)
    {
        _eventService = service;
    }
    
    [HttpGet]
    public async Task<List<Event>> Get() =>
        await _eventService.GetAsync();

    [Authorize]
    [HttpPost("createEvent")]
    public async Task<IActionResult> Post(Event newEvent) {
        try
        {
            Console.WriteLine("Event Received: " + newEvent);

            await _eventService.CreateAsync(newEvent);
            return CreatedAtAction(nameof(Get), new { id = newEvent.id }, newEvent);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error occurred: {ex.Message}");
            return StatusCode(500, new { message = "Event creation failed: " + ex.Message });
        }
    }
    
    [HttpGet("search")]
    public async Task<IActionResult> GetEventSummaries([FromQuery] string searchTerm = null)
    {
        var events = await _eventService.GetEventSummariesAsync(searchTerm);
        return Ok(events);
    }

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetEventsByCategory(string category)
    {
        var events = await _eventService.GetEventSummariesAsync(category: category);
        return Ok(events);
    }


}