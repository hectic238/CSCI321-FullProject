﻿using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Amazon.S3;
using Amazon.Runtime;
using Amazon.S3.Model;
using CSCI321.Server.DBSettings;
using Microsoft.Extensions.Options;
using CSCI321.Server.Models;
using Newtonsoft.Json;


namespace CSCI321.Server.Helpers;

public class EventService
{
    
    private readonly AmazonDynamoDBClient dynamoClient;
        
    private const string TableName = "Events"; 

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
        
    }
    
    public async Task<string> UploadImageAsync( string key, byte[] imageBytes)
    {
        var putRequest = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key, 
            InputStream = new MemoryStream(imageBytes), 
            ContentType = "image/jpeg", 
            CannedACL = S3CannedACL.Private 
        };

        var response = await _s3Client.PutObjectAsync(putRequest);

        if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
        {
            
            var getRequest = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = key,
                Expires = DateTime.UtcNow.AddYears(10) 
            };

            string presignedUrl = _s3Client.GetPreSignedURL(getRequest);
            return presignedUrl; 
        }

        return null;
    }

    
    
    public async Task CreateAsync(Event newEvent)
    {
        
            
            string imageUrl = null;
            if (!string.IsNullOrEmpty(newEvent.image))
            {
                
                byte[] imageBytes = Convert.FromBase64String(newEvent.image.Split(',')[1]);
                string imageKey = $"{newEvent.eventId}/banner.jpg"; 
                imageUrl = await UploadImageAsync(imageKey, imageBytes);
            }

            
            if (!string.IsNullOrEmpty(imageUrl))
            {
                newEvent.image = imageUrl;
            }


            var request = new PutItemRequest
            {
                TableName = "Events", 
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
                    { "image", new AttributeValue { S = newEvent.image } } 

                }
            };

            await dynamoClient.PutItemAsync(request);
    }
    
    public async Task<(List<EventSummary> Events, Dictionary<String, AttributeValue>)> GetEventSummariesAsync(
        string searchTerm = null,
        string category = null,
        int pageSize = 10,
        Dictionary<string, AttributeValue> lastEvaluatedKey = null
        )
    {
        
        

        var scanFilter = new Dictionary<string, Condition>();

        var scanRequest = new ScanRequest();
        scanRequest.TableName = TableName;
        scanRequest.Limit = pageSize;
        scanRequest.ExclusiveStartKey = lastEvaluatedKey;
        
        if (!string.IsNullOrEmpty(searchTerm))
        {
            var searchFilter = new ScanFilter();
            searchFilter.AddCondition("title", ScanOperator.Contains, searchTerm);
            searchFilter.AddCondition("location", ScanOperator.Contains, searchTerm);

            scanRequest.FilterExpression = "contains(title, :searchTerm) OR contains(#location, :searchTerm)";
            scanRequest.ExpressionAttributeNames = new Dictionary<string, string>
            {
                { "#location", "location" } 
            };
            scanRequest.ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":searchTerm", new AttributeValue { S = searchTerm } }
            };
            

        }

        if (!string.IsNullOrEmpty(category))
        {
            // Filtering by category
            scanFilter.Add("category", new Condition
            {
                ComparisonOperator = ComparisonOperator.EQ,
                AttributeValueList = new List<AttributeValue> { new AttributeValue { S = category } }
            });
            
            scanRequest.ScanFilter = scanFilter;
        }
        
        
        var scanResponse = await dynamoClient.ScanAsync(scanRequest);

        // Convert the result to EventSummary
        var eventSummaries = new List<EventSummary>();
        var now = DateTime.UtcNow;

        foreach (var item in scanResponse.Items)
        {
            
            var eventStartDate = DateTime.ParseExact(
                $"{item["startDate"].S} {item["startTime"].S}",
                "yyyy-MM-dd HH:mm",
                System.Globalization.CultureInfo.InvariantCulture
            );
            
            if (eventStartDate >= now)
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
                    image = item.ContainsKey("image") ? item["image"].S : null,
                    eventTicketType = item["eventTicketType"].S,
                    tickets = JsonConvert.DeserializeObject<List<Ticket>>(item["tickets"].S)  // Assuming tickets are stored as JSON

                };
                eventSummaries.Add(eventSummary);
            }
        }
        
        var nextKey = scanResponse.LastEvaluatedKey != null && scanResponse.LastEvaluatedKey.Count > 0
            ? scanResponse.LastEvaluatedKey
            : null;
        
        return (eventSummaries, nextKey);
    }

    
    public async Task<Event> GetEventByIdAsync(string id)
{
    try
    {
        var key = new Dictionary<string, AttributeValue>
        {
            { "eventId", new AttributeValue { S = id } }  
        };

        
        var request = new GetItemRequest
        {
            TableName = "Events",  
            Key = key
        };

        
        var response = await dynamoClient.GetItemAsync(request);

        if (response.Item == null || !response.IsItemSet)
        {
            
            return null;
        }

        
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
        
        throw new Exception("Error retrieving event from DynamoDB", ex);
    }
}


    public async Task UpdateAsync(string eventId, Event updatedEvent)
{
    try
    {
        
        var key = new Dictionary<string, AttributeValue>
        {
            { "eventId", new AttributeValue { S = eventId } }  
        };

        
        var updateExpression = "SET #title = :title, #userId = :userId, #eventTicketType = :eventTicketType, " +
                               "#eventType = :eventType, #category = :category, #startDate = :startDate, " +
                               "#startTime = :startTime, #endTime = :endTime, #location = :location, " +
                               "#additionalInfo = :additionalInfo, #recurrenceFrequency = :recurrenceFrequency, " +
                               "#recurrenceEndDate = :recurrenceEndDate, #numberAttendees = :numberAttendees, " +
                               "#isDraft = :isDraft, #tickets = :tickets, #image = :image";  

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
            { ":tickets", new AttributeValue { S = JsonConvert.SerializeObject(updatedEvent.tickets) } }  
        };

        var request = new UpdateItemRequest
        {
            TableName = "Events",  
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

        
        var response = await dynamoClient.UpdateItemAsync(request);

        if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
        {
            
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
            IndexName = "UserIdIndex", 
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
            IndexName = "UserIdIndex",   
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