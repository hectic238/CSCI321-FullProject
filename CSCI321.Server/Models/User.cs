using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CSCI321.Server.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string userId { get; set; }
    public string name { get; set; }
    public string email { get; set; }
    public string password { get; set; }
    public string userType { get; set; }
    public string company { get; set; }
    public string preferences { get; set; }

    public string refreshToken { get; set; }
    public DateTime refreshTokenExpiry { get; set; } // Expiration date for the refresh token

    public List<Ticket> tickets { get; set; }
    
    public DateOnly dateOfBirth { get; set; }
    
    public string title { get; set; }
    
    public string phoneNumber { get; set; }
    }
}
