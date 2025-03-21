

namespace CSCI321.Server.Models;

public class Order
{
    

    public string orderId { get; set; }
    public long orderDate { get; set; }
    public DateTime actualDate { get; set; }
    public string userId { get; set; }
    public string eventId { get; set; }
    public double totalPrice { get; set; }
    public List<Ticket> tickets { get; set; }
    public bool refundable { get; set; }
    
}