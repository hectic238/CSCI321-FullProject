using Amazon.S3.Util;
using CSCI321.Server.Helpers;
using CSCI321.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;

namespace CSCI321.Server.Controllers;

[Route("session-status")]
[ApiController]
public class SessionStatusController : Controller
{
    
    private readonly OrderService _orderService;
    private readonly EventService _eventService;

    public SessionStatusController(OrderService orderService, EventService eventService)
    {
        _orderService = orderService;
        _eventService = eventService;
    }
    
    
    [HttpGet]
    public ActionResult SessionStatus([FromQuery] string session_id)
    {
        var sessionService = new SessionService();
        Session session = sessionService.Get(session_id);
        
        
        var lineItemsService = new SessionLineItemService();
        var lineItems = lineItemsService.List(session_id);

        
        var ticketList = lineItems.Data.Select(item => new Ticket
        {
            name = item.Description,
            price = (decimal)(item.Price.UnitAmount / 100), 
            quantity = (int)item.Quantity,
            count = 0,
            soldOut = false,
            bought = 0,
            
        }).ToList();
        Console.WriteLine(session.AmountTotal/100);
        var userId = session.Metadata["user_id"];
        var eventId = session.Metadata["event_id"];
        var totalCost = session.AmountTotal / 100;
        
        modifyEvent(eventId, ticketList);
        createOrder(userId, eventId, (double)totalCost, ticketList);
        
        return Json(new {status = session.Status,  customer_email = session.CustomerDetails.Email, eventId = session.Metadata["event_id"],userId = session.Metadata["user_id"], lineItems = ticketList });
    }

    private async void createOrder(String userId, String eventId, double totalPrice, List<Ticket> ticketList )
    {
        DateTime currentTime = DateTime.Now;
        var orderId = Guid.NewGuid().ToString();

        Order newOrder = new Order();
        newOrder.orderId = orderId;
        newOrder.userId = userId;
        newOrder.eventId = eventId;
        newOrder.totalPrice = totalPrice;
        newOrder.actualDate = currentTime;
        newOrder.tickets = ticketList;
        
        await _orderService.CreateAsync(newOrder);
    }

    private async void modifyEvent(String eventId, List<Ticket> ticketList)
    {
        var eventDetails = await _eventService.GetEventByIdAsync(eventId);

        
        foreach (var purchasedTicket in ticketList)
        {
            var ticket = eventDetails.tickets.FirstOrDefault(t => t.name == purchasedTicket.name);
            if (ticket != null)
            {
                ticket.bought += purchasedTicket.quantity;
                ticket.count -= purchasedTicket.quantity;

                // If ticket count reaches 0, mark it as sold out
                ticket.soldOut = ticket.count <= 0;
            }
        }

        await _eventService.UpdateAsync(eventId, eventDetails);
            

    }
}