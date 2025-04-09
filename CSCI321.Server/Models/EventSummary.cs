namespace CSCI321.Server.Models;

public class EventSummary
{
    public string id { get; set; }
    public string title { get; set; }
    public string location { get; set; }
    public string startDate { get; set; }
    public string image { get; set; }
    public string category { get; set; }
    public string startTime { get; set; }
    
    public string endTime { get; set; }
    
    public string eventTicketType { get; set; }

    public List<Ticket> tickets { get; set; }
}