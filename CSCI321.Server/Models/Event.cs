using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CSCI321.Server.Models
{
    public class Event
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; }
        public string title { get; set; }
        public string userId { get; set; }
        public string eventTicketType { get; set; }
        public string eventType { get; set; }
        public string category { get; set; }
        public string startDate { get; set; }
        public string startTime { get; set; }
        public string endTime { get; set; }
        public string location { get; set; }
        public string additionalInfo { get; set; }
        public string recurrenceFrequency { get; set; }
        public string recurrenceEndDate { get; set; }
        public int numberAttendees { get; set; }
        public bool isDraft { get; set; }
        public string image { get; set; }
        public List<Ticket> tickets { get; set; }
        
        
    }
}
