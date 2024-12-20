using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Runtime;
using Amazon.S3;
using CSCI321.Server.DBSettings;
using CSCI321.Server.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CSCI321.Server.Helpers;

public class OrderService
{
    private readonly IMongoCollection<Order> _OrderCollection;
    
    private readonly AmazonDynamoDBClient dynamoClient;
        
    private const string TableName = "Events";  // Replace with your table name

    private readonly IConfiguration _configuration;

    public OrderService(IOptions<OrderDatabaseSettings> OrderDatabaseSettings, IConfiguration configuration)
    {
        _configuration = configuration;

        var config = new AmazonDynamoDBConfig
        {
            RegionEndpoint = RegionEndpoint.APSoutheast2  // Change region if needed
        };
            
        var awsAccessKeyId = _configuration["Database:AWS_ACCESS_KEY_ID"];
        var awsSecretAccessKey = _configuration["Database:AWS_SECRET_ACCESS_KEY"];

        dynamoClient = new AmazonDynamoDBClient(
            new BasicAWSCredentials(
                awsAccessKeyId,awsSecretAccessKey
            ),
            config);
        var mongoClient = new MongoClient(
            OrderDatabaseSettings.Value.ConnectionString);

        var mongoDatabase = mongoClient.GetDatabase(
            OrderDatabaseSettings.Value.DatabaseName);
        
        _OrderCollection = mongoDatabase.GetCollection<Order>(
            OrderDatabaseSettings.Value.OrderCollectionName);

    }
    
    
    public async Task CreateAsync(Order newOrder)
    {
        var orderAttributes = new Dictionary<string, AttributeValue>
        {
            { "orderId", new AttributeValue { S = Guid.NewGuid().ToString() } },  // Generate a unique ID
            { "orderDate", new AttributeValue { N = newOrder.orderDate.ToString() } },
            { "actualDate", new AttributeValue { S = newOrder.actualDate.ToString("o") } },
            { "userId", new AttributeValue { S = newOrder.userId } },
            { "eventId", new AttributeValue { S = newOrder.eventId } },
            { "totalPrice", new AttributeValue { N = newOrder.totalPrice.ToString() } },
            { "paymentMethod", new AttributeValue { S = newOrder.paymentMethod } },
            { "refundable", new AttributeValue { BOOL = newOrder.refundable } },
            { "billingInfo", new AttributeValue 
                { 
                    M = new Dictionary<string, AttributeValue>
                    {
                        { "name", new AttributeValue { S = newOrder.billingInfo.name } },
                        { "email", new AttributeValue { S = newOrder.billingInfo.email } },
                        { "address", new AttributeValue { S = newOrder.billingInfo.address } }
                    } 
                }
            },
            { "tickets", new AttributeValue
                {
                    L = newOrder.tickets.Select(t => 
                        new AttributeValue
                        {
                            M = new Dictionary<string, AttributeValue>
                            {
                                { "name", new AttributeValue { S = t.name } },
                                { "quantity", new AttributeValue { N = t.quantity.ToString() } },
                                { "price", new AttributeValue { N = t.price.ToString() } }
                            }
                        }).ToList()
                }
            }
        };

        await dynamoClient.PutItemAsync("OrdersTable", orderAttributes);
    }

    
    public async Task<List<Order>> GetOrdersByUserIdAsync(string userId)
    {
        return await _OrderCollection.Find(o => o.userId == userId).ToListAsync();
    }
    
    
}