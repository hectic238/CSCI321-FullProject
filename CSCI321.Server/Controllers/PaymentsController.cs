using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
namespace CSCI321.Server.Controllers;

public class PaymentsController :  ControllerBase
{
    
    public PaymentsController()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .Build();
        
        StripeConfiguration.ApiKey = config["Stripe:ApiKey"];    
    }

    [HttpPost("create-checkout-session")]
    public IActionResult  CreateCheckoutSession([FromBody] CheckoutRequest request)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = request.Products.Select(ticket => new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    UnitAmount = (long)(ticket.price * 100), // Convert to cents
                    Currency = "aud",
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = ticket.name,
                    },
                },
                Quantity = ticket.quantity,
            }).ToList(),
            Mode = "payment",
            UiMode = "embedded",  
            ReturnUrl = "https://localhost:5173/checkoutReturn?session_id={CHECKOUT_SESSION_ID}",
            Metadata = new Dictionary<string, string>
            {
                { "event_id", request.eventId },
                { "user_id", request.userId },
            },

        };
        var service = new SessionService();
        Session session = service.Create(options);
        

        return Ok(new { clientSecret = session.ClientSecret });
    }
}

public class CheckoutRequest
{
    public List<TicketItem> Products { get; set; }
    public string eventId { get; set; }
    public string userId { get; set; }
}

public class TicketItem
{
    public string name { get; set; }
    public decimal price { get; set; }
    public int quantity { get; set; }
    
    public int bought { get; set; }
    public bool soldOut { get; set; }
    public int count { get; set; }
}