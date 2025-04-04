using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System;
using System.Globalization;
using Microsoft.AspNetCore.Mvc;

[Route("api/calendar")]
[ApiController]
public class CalendarController : ControllerBase
{
    [HttpPost("generate-ics")]
    public IActionResult GenerateICS([FromBody] CalendarRequest request)
    {

        var australiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Australia/Sydney");
        
        string startDateTimeString = request.startDateTime.ToString("yyyy-MM-ddTHH:mm:sszzz");
        string endDateTimeString = request.endDateTime.ToString("yyyy-MM-ddTHH:mm:sszzz");

        DateTime startDateTime = DateTime.ParseExact(startDateTimeString, "yyyy-MM-ddTHH:mm:sszzz", CultureInfo.InvariantCulture);
        DateTime endDateTime = DateTime.ParseExact(endDateTimeString, "yyyy-MM-ddTHH:mm:sszzz", CultureInfo.InvariantCulture);

        DateTime startTimeWithDST = TimeZoneInfo.ConvertTime(startDateTime, australiaTimeZone);
        DateTime endTimeWithDST = TimeZoneInfo.ConvertTime(endDateTime, australiaTimeZone);

        
        var tzid = "Australia/Sydney";  

        // Create the .ics content
        string icsContent = $@"BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:{request.title}
DESCRIPTION:{request.title}
DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}
DTSTART;TZID={tzid}:{startTimeWithDST:yyyyMMddTHHmmss}
DTEND;TZID={tzid}:{endTimeWithDST:yyyyMMddTHHmmss}
LOCATION:{request.location}
END:VEVENT
END:VCALENDAR";

        byte[] icsBytes = Encoding.UTF8.GetBytes(icsContent);
        return File(icsBytes, "text/calendar", "event.ics");
    }
}

// Define the request model
public class CalendarRequest
{
    public string title { get; set; }
    public DateTime startDateTime { get; set; }
    public DateTime endDateTime { get; set; }
    public string location { get; set; }
    
}