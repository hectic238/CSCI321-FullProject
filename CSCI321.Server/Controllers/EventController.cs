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
            return CreatedAtAction(nameof(Get), new { id = newEvent.eventId }, newEvent);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error occurred: {ex.Message}");
            return StatusCode(500, new { message = "Event creation failed: " + ex.Message });
        }
    }
    
    [HttpGet("search")]
    public async Task<IActionResult> GetEventSummaries([FromQuery] string searchTerm = null, int pageSize = 10, string lastEvaluatedKey = null)
    {
        string category = null;
        var (events, newLastEvaluatedKey) = await _eventService.GetEventSummariesAsync(
            searchTerm,category, pageSize, lastEvaluatedKey);
        return Ok(new {
            events,
            lastEvaluatedKey = newLastEvaluatedKey
            
        });
    }

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetEventsByCategory( string searchTerm = null, string category = null, [FromQuery] int pageSize = 10, string lastEvaluatedKey = null)
    {
        var (events, newLastEvaluatedKey) = await _eventService.GetEventSummariesAsync(
            searchTerm,category: category , pageSize, lastEvaluatedKey);
        
        return Ok(new {
            events,
            lastEvaluatedKey = newLastEvaluatedKey
            
        });
    }

    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEventById(string id)
    {
        try
        {
            var eventDetails = await _eventService.GetEventByIdAsync(id);

            if (eventDetails == null)
            {
                return NotFound(new { message = "Event not found" });
            }

            return Ok(eventDetails);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving the event", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEvent(string id, [FromBody] Event updatedEvent)
    {
        
        Console.WriteLine("ID: " + id);
        
        Console.WriteLine("UpdatedEvent: " + updatedEvent.eventId);
        
        if (id != updatedEvent.eventId)
        {
            return BadRequest("Event ID mismatch");
        }

        var existingEvent = await _eventService.GetEventByIdAsync(id);
        if (existingEvent == null)
        {
            return NotFound($"Event with id {id} not found");
        }

        await _eventService.UpdateAsync(id, updatedEvent);
        return NoContent(); // Return 204 on successful update
    }
    
    [HttpGet("byUser/{userId}")]
    public async Task<ActionResult<List<Event>>> GetEventsByUserId(string userId)
    {
        var events = await _eventService.GetEventsByUserIdAsync(userId);
    
        // if (events == null || events.Count == 0)
        // {
        //     return NotFound($"No events found for user with id {userId}");
        // }

        return Ok(events);
    }

    [HttpGet("byUser/{userId}/drafts")]
    public async Task<ActionResult<List<Event>>> GetDraftEventsByUserId(string userId)
    {
        var events = await _eventService.GetDraftEventsByUserIdAsync(userId);
    
        // if (events == null || events.Count == 0)
        // {
        //     return NotFound($"No draft events found for user with id {userId}");
        // }

        return Ok(events);
    }


}