using CSCI321.Server.DBSettings;
using CSCI321.Server.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CSCI321.Server.Helpers;

public class OrderService
{
    private readonly IMongoCollection<Order> _OrderCollection;

    public OrderService(IOptions<OrderDatabaseSettings> OrderDatabaseSettings)
    {
        var mongoClient = new MongoClient(
            OrderDatabaseSettings.Value.ConnectionString);

        var mongoDatabase = mongoClient.GetDatabase(
            OrderDatabaseSettings.Value.DatabaseName);
        
        _OrderCollection = mongoDatabase.GetCollection<Order>(
            OrderDatabaseSettings.Value.OrderCollectionName);

    }
    
    
    public async Task CreateAsync(Order newOrder) =>
        await _OrderCollection.InsertOneAsync(newOrder);
}