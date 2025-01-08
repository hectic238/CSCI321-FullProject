namespace CSCI321.Server.Models
{
    public class MessageModel
    {
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string messageId { get; set; } = Guid.NewGuid().ToString();
        public string message { get; set; }
        public string email { get; set; }

    }
}
