using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.S3;
using Amazon.Runtime;
using Amazon.S3.Model;
using CSCI321.Server.DBSettings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using CSCI321.Server.Models;
using Newtonsoft.Json;


namespace CSCI321.Server.Helpers;

public class EventService
{
    private readonly IMongoCollection<Event> _EventCollection;
    
    private readonly AmazonDynamoDBClient dynamoClient;
        
    private const string TableName = "Events";  // Replace with your table name

    private readonly IConfiguration _configuration;
    private readonly AmazonS3Client _s3Client;
    private const string bucketName = "planitimagebucket";
    
    public EventService(
        IOptions<EventDatabaseSettings> EventDatabaseSettings, IConfiguration configuration)
    {
        _configuration = configuration;

        var config = new AmazonDynamoDBConfig
        {
            RegionEndpoint = RegionEndpoint.APSoutheast2  // Change region if needed
        };

        var s3Config = new AmazonS3Config
        {
            RegionEndpoint = RegionEndpoint.APSoutheast2
        };
            
        var awsAccessKeyId = _configuration["Database:AWS_ACCESS_KEY_ID"];
        var awsSecretAccessKey = _configuration["Database:AWS_SECRET_ACCESS_KEY"];

        dynamoClient = new AmazonDynamoDBClient(
            new BasicAWSCredentials(
                awsAccessKeyId,awsSecretAccessKey
            ),
            config);

        _s3Client = new AmazonS3Client(
            new BasicAWSCredentials(
                awsAccessKeyId, awsSecretAccessKey),
            s3Config);
        
        var mongoClient = new MongoClient(
            EventDatabaseSettings.Value.ConnectionString);

        var mongoDatabase = mongoClient.GetDatabase(
            EventDatabaseSettings.Value.DatabaseName);

        _EventCollection = mongoDatabase.GetCollection<Event>(
            EventDatabaseSettings.Value.EventCollectionName);
    }
    
    public async Task<string> UploadImageAsync( string key, byte[] imageBytes)
    {
        var putRequest = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key, // The name of the file in the bucket
            InputStream = new MemoryStream(imageBytes), // Image byte array
            ContentType = "image/jpeg", // or other type depending on the image format
            CannedACL = S3CannedACL.Private // Ensure the image is public
        };

        var response = await _s3Client.PutObjectAsync(putRequest);

        if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
        {
            // Generate a pre-signed URL that expires in 10 years
            var getRequest = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = key,
                Expires = DateTime.UtcNow.AddYears(10) // Set a long expiration (e.g., 10 years)
            };

            string presignedUrl = _s3Client.GetPreSignedURL(getRequest);
            return presignedUrl; // This URL will be valid for 10 years
        }

        return null;
    }

    
    
    public async Task<List<Event>> GetAsync() =>
        await _EventCollection.Find(_ => true).ToListAsync();

    public async Task CreateAsync(Event newEvent)
    {
        
            // Step 2: Extract base64 image and upload to S3
            string imageUrl = null;
            if (!string.IsNullOrEmpty(newEvent.image))
            {
                // Extract image bytes from base64 string
                byte[] imageBytes = Convert.FromBase64String(newEvent.image.Split(',')[1]);
                string imageKey = $"{newEvent.eventId}/banner.jpg"; // Customize image key
                imageUrl = await UploadImageAsync(imageKey, imageBytes);
            }

            // Step 3: Update eventDetails with the S3 image URL
            if (!string.IsNullOrEmpty(imageUrl))
            {
                newEvent.image = imageUrl;
            }


            var request = new PutItemRequest
            {
                TableName = "Events", // Replace with your DynamoDB table name
                Item = new Dictionary<string, AttributeValue>
                {
                    { "eventId", new AttributeValue { S = newEvent.eventId } },
                    { "title", new AttributeValue { S = newEvent.title } },
                    { "userId", new AttributeValue { S = newEvent.userId } },
                    { "eventTicketType", new AttributeValue { S = newEvent.eventTicketType } },
                    { "eventType", new AttributeValue { S = newEvent.eventType } },
                    { "category", new AttributeValue { S = newEvent.category } },
                    { "startDate", new AttributeValue { S = newEvent.startDate } },
                    { "startTime", new AttributeValue { S = newEvent.startTime } },
                    { "endTime", new AttributeValue { S = newEvent.endTime } },
                    { "location", new AttributeValue { S = newEvent.location } },
                    { "additionalInfo", new AttributeValue { S = newEvent.additionalInfo } },
                    { "recurrenceFrequency", new AttributeValue { S = newEvent.recurrenceFrequency } },
                    { "recurrenceEndDate", new AttributeValue { S = newEvent.recurrenceEndDate } },
                    { "numberAttendees", new AttributeValue { N = newEvent.numberAttendees.ToString() } },
                    { "isDraft", new AttributeValue { BOOL = newEvent.isDraft } },
                    { "tickets", new AttributeValue { S = JsonConvert.SerializeObject(newEvent.tickets) } },
                    { "image", new AttributeValue { S = newEvent.image } } // Add the image URL here

                }
            };

            await dynamoClient.PutItemAsync(request);
    }
    
    public async Task<List<EventSummary>> GetEventSummariesAsync(string searchTerm = null, string category = null)
    {
        // Build the query parameters
        var scanFilter = new Dictionary<string, Condition>();

        if (!string.IsNullOrEmpty(searchTerm))
        {
            // Searching by title or location
            scanFilter.Add("title", new Condition
            {
                ComparisonOperator = ComparisonOperator.CONTAINS,
                AttributeValueList = new List<AttributeValue> { new AttributeValue { S = searchTerm } }
            });

            scanFilter.Add("location", new Condition
            {
                ComparisonOperator = ComparisonOperator.CONTAINS,
                AttributeValueList = new List<AttributeValue> { new AttributeValue { S = searchTerm } }
            });
        }

        if (!string.IsNullOrEmpty(category))
        {
            // Filtering by category
            scanFilter.Add("category", new Condition
            {
                ComparisonOperator = ComparisonOperator.EQ,
                AttributeValueList = new List<AttributeValue> { new AttributeValue { S = category } }
            });
        }

        // Scan request to DynamoDB
        var scanRequest = new ScanRequest
        {
            TableName = TableName,
            ScanFilter = scanFilter
        };

        // Execute the scan
        var scanResponse = await dynamoClient.ScanAsync(scanRequest);

        // Convert the result to EventSummary
        var eventSummaries = new List<EventSummary>();
        foreach (var item in scanResponse.Items)
        {
            var eventSummary = new EventSummary
            {
                id = item["eventId"].S,
                title = item["title"].S,
                location = item["location"].S,
                startDate = item["startDate"].S,
                startTime = item["startTime"].S,
                endTime = item["endTime"].S,
                category = item["category"].S,
                image = item.ContainsKey("image") ? item["image"].S : null  // Get imageUrl if it exists
            };

            eventSummaries.Add(eventSummary);
        }

        return eventSummaries;
    }

    public async Task<List<EventSummary>> GetEventSummariesAsync2(string searchTerm = null, string category = null)
    {
        // Start with an empty filter
        var filterBuilder = Builders<Event>.Filter;
        var filter = filterBuilder.Empty; // Create an empty filter
        
        var now = DateTime.UtcNow;
        var futureEventsFilter = filterBuilder.Gte(e => e.startDate, now.ToString("yyyy-MM-dd")) &
                                 filterBuilder.Or(
                                     filterBuilder.Gt(e => e.startTime, now.ToString("HH:mm")),
                                     filterBuilder.Gt(e => e.startDate, now.ToString("yyyy-MM-dd"))
                                 );
        filter = filterBuilder.And(filter, futureEventsFilter);

        // If a search term is provided, build a search filter
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var searchFilter = filterBuilder.Or(
                filterBuilder.Regex(e => e.title, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                filterBuilder.Regex(e => e.location, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            );
            filter = filterBuilder.And(filter, searchFilter);
        }

        // If a category is provided, build a category filter
        if (!string.IsNullOrWhiteSpace(category))
        {
            var categoryFilter = filterBuilder.Eq(e => e.category, category);
            filter = filterBuilder.And(filter, categoryFilter);
        }

        // Fetch events based on the filter
        var events = await _EventCollection.Find(filter)
            .Project(e => new EventSummary
            {
                id = e.eventId,
                title = e.title,
                location = e.location,
                startDate = e.startDate,
                image = e.image,
                category = e.category,
                startTime = e.startTime,
                endTime = e.endTime
            })
            .ToListAsync();

        return events;
    }
    
    public async Task<Event> GetEventByIdAsync(string id)
{
    try
    {
        // Define the key for the query (assuming 'eventId' is the partition key in DynamoDB)
        var key = new Dictionary<string, AttributeValue>
        {
            { "eventId", new AttributeValue { S = id } }  // 'eventId' is your partition key
        };

        // Prepare the GetItem request for DynamoDB
        var request = new GetItemRequest
        {
            TableName = "Events",  // Replace with your DynamoDB table name
            Key = key
        };

        // Fetch the event data from DynamoDB
        var response = await dynamoClient.GetItemAsync(request);

        if (response.Item == null || !response.IsItemSet)
        {
            // If no event is found, return null
            return null;
        }

        // Map the DynamoDB response to your Event model
        var eventDetails = new Event
        {
            eventId = response.Item["eventId"].S,
            title = response.Item["title"].S,
            userId = response.Item["userId"].S,
            eventTicketType = response.Item["eventTicketType"].S,
            eventType = response.Item["eventType"].S,
            category = response.Item["category"].S,
            startDate = response.Item["startDate"].S,
            startTime = response.Item["startTime"].S,
            endTime = response.Item["endTime"].S,
            location = response.Item["location"].S,
            additionalInfo = response.Item["additionalInfo"].S,
            recurrenceFrequency = response.Item["recurrenceFrequency"].S,
            recurrenceEndDate = response.Item["recurrenceEndDate"].S,
            numberAttendees = int.Parse(response.Item["numberAttendees"].N),
            isDraft = response.Item["isDraft"].BOOL ?? false,
            image = response.Item["image"].S,
            tickets = JsonConvert.DeserializeObject<List<Ticket>>(response.Item["tickets"].S)  // Assuming tickets are stored as JSON
        };

        return eventDetails;
    }
    catch (Exception ex)
    {
        // Handle any errors (e.g., connection issues, invalid data)
        throw new Exception("Error retrieving event from DynamoDB", ex);
    }
}


    public async Task UpdateAsync(string eventId, Event updatedEvent)
{
    try
    {
        // Define the key for the update (using the eventId as partition key)
        var key = new Dictionary<string, AttributeValue>
        {
            { "eventId", new AttributeValue { S = eventId } }  // 'eventId' is the partition key in DynamoDB
        };

        // Define the update expression and attribute values for the update
        var updateExpression = "SET #title = :title, #userId = :userId, #eventTicketType = :eventTicketType, " +
                               "#eventType = :eventType, #category = :category, #startDate = :startDate, " +
                               "#startTime = :startTime, #endTime = :endTime, #location = :location, " +
                               "#additionalInfo = :additionalInfo, #recurrenceFrequency = :recurrenceFrequency, " +
                               "#recurrenceEndDate = :recurrenceEndDate, #numberAttendees = :numberAttendees, " +
                               "#isDraft = :isDraft, #tickets = :tickets, #image = :image";  // Update expression for multiple attributes

        var attributeValues = new Dictionary<string, AttributeValue>
        {
            { ":title", new AttributeValue { S = updatedEvent.title } },
            { ":userId", new AttributeValue { S = updatedEvent.userId } },
            { ":eventTicketType", new AttributeValue { S = updatedEvent.eventTicketType } },
            { ":eventType", new AttributeValue { S = updatedEvent.eventType } },
            { ":category", new AttributeValue { S = updatedEvent.category } },
            { ":startDate", new AttributeValue { S = updatedEvent.startDate } },
            { ":startTime", new AttributeValue { S = updatedEvent.startTime } },
            { ":endTime", new AttributeValue { S = updatedEvent.endTime } },
            { ":location", new AttributeValue { S = updatedEvent.location } },
            { ":additionalInfo", new AttributeValue { S = updatedEvent.additionalInfo } },
            { ":recurrenceFrequency", new AttributeValue { S = updatedEvent.recurrenceFrequency } },
            { ":recurrenceEndDate", new AttributeValue { S = updatedEvent.recurrenceEndDate } },
            { ":numberAttendees", new AttributeValue { N = updatedEvent.numberAttendees.ToString() } },
            { ":isDraft", new AttributeValue { BOOL = updatedEvent.isDraft } },
            { ":image", new AttributeValue { S = updatedEvent.image } },
            { ":tickets", new AttributeValue { S = JsonConvert.SerializeObject(updatedEvent.tickets) } }  // Assuming tickets are serialized to JSON
        };

        var request = new UpdateItemRequest
        {
            TableName = "Events",  // Replace with your DynamoDB table name
            Key = key,
            UpdateExpression = updateExpression,
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                { "#title", "title" },
                { "#userId", "userId" },
                { "#eventTicketType", "eventTicketType" },
                { "#eventType", "eventType" },
                { "#category", "category" },
                { "#startDate", "startDate" },
                { "#startTime", "startTime" },
                { "#endTime", "endTime" },
                { "#location", "location" },
                { "#additionalInfo", "additionalInfo" },
                { "#recurrenceFrequency", "recurrenceFrequency" },
                { "#recurrenceEndDate", "recurrenceEndDate" },
                { "#numberAttendees", "numberAttendees" },
                { "#isDraft", "isDraft" },
                { "#tickets", "tickets" },
                { "#image" , "image"}
            },
            ExpressionAttributeValues = attributeValues
        };

        // Perform the update operation
        var response = await dynamoClient.UpdateItemAsync(request);

        if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
        {
            // Successfully updated the event
            return;
        }

        throw new Exception("Failed to update event.");
    }
    catch (Exception ex)
    {
        throw new Exception("Error updating event in DynamoDB", ex);
    }
}


    public async Task<List<Event>> GetEventsByUserIdAsync(string userId)
    {
        var request = new QueryRequest
        {
            TableName = "Events",
            IndexName = "UserIdIndex",  // Replace with your GSI name if using one
            KeyConditionExpression = "userId = :userId",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":userId", new AttributeValue { S = userId } }
            }
        };

        var response = await dynamoClient.QueryAsync(request);
        return response.Items.Select(item => MapEvent(item)).ToList();
    }


    public async Task<List<Event>> GetDraftEventsByUserIdAsync(string userId)
    {
        var request = new QueryRequest
        {
            TableName = "Events",
            IndexName = "UserIdIndex",  // Replace with your GSI name if using one
            KeyConditionExpression = "userId = :userId",
            FilterExpression = "isDraft = :isDraft",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":userId", new AttributeValue { S = userId } },
                { ":isDraft", new AttributeValue { BOOL = true } }
            }
        };

        var response = await dynamoClient.QueryAsync(request);
        return response.Items.Select(item => MapEvent(item)).ToList();
    }
    
    private Event MapEvent(Dictionary<string, AttributeValue> item)
    {
        return new Event
        {
            eventId = item.ContainsKey("eventId") ? item["eventId"].S : null,
            title = item.ContainsKey("title") ? item["title"].S : null,
            userId = item.ContainsKey("userId") ? item["userId"].S : null,
            eventTicketType = item.ContainsKey("eventTicketType") ? item["eventTicketType"].S : null,
            eventType = item.ContainsKey("eventType") ? item["eventType"].S : null,
            category = item.ContainsKey("category") ? item["category"].S : null,
            startDate = item.ContainsKey("startDate") ? item["startDate"].S : null,
            startTime = item.ContainsKey("startTime") ? item["startTime"].S : null,
            endTime = item.ContainsKey("endTime") ? item["endTime"].S : null,
            location = item.ContainsKey("location") ? item["location"].S : null,
            additionalInfo = item.ContainsKey("additionalInfo") ? item["additionalInfo"].S : null,
            recurrenceFrequency = item.ContainsKey("recurrenceFrequency") ? item["recurrenceFrequency"].S : null,
            recurrenceEndDate = item.ContainsKey("recurrenceEndDate") ? item["recurrenceEndDate"].S : null,
            numberAttendees = item.ContainsKey("numberAttendees") ? int.Parse(item["numberAttendees"].N) : 0,
            isDraft = item.ContainsKey("isDraft") && item["isDraft"].BOOL == true,
            image = item.ContainsKey("image") ? item["image"].S : null,
            tickets = item.ContainsKey("tickets") 
                ? JsonConvert.DeserializeObject<List<Ticket>>(item["tickets"].S) 
                : new List<Ticket>()
        };
    }





}