using System.Security.Claims;
using System.Text.Json;
using CSCI321.Server.Helpers;
using CSCI321.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrderController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [Authorize]
    [HttpPost("publish")]
    public async Task<IActionResult> PublishOrder(Order order)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (order.userId != userId)
        {
            return Forbid();
        }
        
        try
        {

            var utcDateTime = DateTimeOffset.FromUnixTimeMilliseconds(order.orderDate).UtcDateTime;
            var sydneyTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Australia/Sydney");
            var sydneyDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, sydneyTimeZone);
            
            order.actualDate = sydneyDateTime;

            // Save order to database
            await _orderService.CreateAsync(order);

            return Ok(new { message = "Order successfully published!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
        }
    }
    
    [Authorize]
    [HttpGet("getOrdersByUserId/{userId}")]
    public async Task<IActionResult> GetOrdersByUserId(string userId)
    {
        
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdFromToken != userId)
        {
            return Forbid();
        }
        try
        {
            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            
            if (orders == null || !orders.Any())
            {
                return NotFound(new { message = "No orders found for the given user ID." });
            }

            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving orders.", error = ex.Message });
        }
    }
    
    
}