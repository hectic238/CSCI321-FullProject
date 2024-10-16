using CSCI321.Server.DBSettings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using CSCI321.Server.Models;


namespace CSCI321.Server.Helpers;

public class EventService
{
    private readonly IMongoCollection<Event> _EventCollection;
    
    public EventService(
        IOptions<EventDatabaseSettings> EventDatabaseSettings)
    {
        var mongoClient = new MongoClient(
            EventDatabaseSettings.Value.ConnectionString);

        var mongoDatabase = mongoClient.GetDatabase(
            EventDatabaseSettings.Value.DatabaseName);

        _EventCollection = mongoDatabase.GetCollection<Event>(
            EventDatabaseSettings.Value.EventCollectionName);
    }
    
    
    public async Task<List<Event>> GetAsync() =>
        await _EventCollection.Find(_ => true).ToListAsync();
    
    public async Task CreateAsync(Event newEvent) =>
        await _EventCollection.InsertOneAsync(newEvent);
    
    public async Task<List<EventSummary>> GetEventSummariesAsync(string searchTerm = null, string category = null)
    {
        // Start with an empty filter
        var filterBuilder = Builders<Event>.Filter;
        var filter = filterBuilder.Empty; // Create an empty filter

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
                id = e.id,
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



}