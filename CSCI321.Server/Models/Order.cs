using System.Runtime.InteropServices.JavaScript;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CSCI321.Server.Models;

public class Order
{
    
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string orderId { get; set; }
    public long orderDate { get; set; }
    public DateTime actualDate { get; set; }
    public string userId { get; set; }
    public string eventId { get; set; }
    public double totalPrice { get; set; }
    public string paymentMethod { get; set; }
    public BillingInfo billingInfo { get; set; }
    public List<Ticket> tickets { get; set; }
    public bool refundable { get; set; }
    
}