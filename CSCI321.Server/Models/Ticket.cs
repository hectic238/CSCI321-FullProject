using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CSCI321.Server.Models
{
    public class Ticket
    {
        
        public string name { get; set; }
        public decimal price { get; set; }
        public int count { get; set; }
        public bool soldOut { get; set; }
        public int bought { get; set; }
    }
}
