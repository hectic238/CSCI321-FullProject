using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CSCI321.Server.Models
{
    public class Ticket
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
    }
}
