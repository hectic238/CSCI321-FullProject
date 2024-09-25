using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CSCI321.Server.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
