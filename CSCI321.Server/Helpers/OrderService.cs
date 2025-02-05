using System.Text.Json;
using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Runtime;
using Amazon.S3;
using CSCI321.Server.DBSettings;
using CSCI321.Server.Models;
using Microsoft.Extensions.Options;

using Newtonsoft.Json;

namespace CSCI321.Server.Helpers;

public class OrderService
{
    
    private readonly AmazonDynamoDBClient dynamoClient;
        
    private const string TableName = "Orders";  // Replace with your table name

    private readonly IConfiguration _configuration;

    public OrderService(IConfiguration configuration)
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
    }
    
    
    public async Task CreateAsync(Order newOrder)
{
    if (newOrder == null)
        throw new ArgumentNullException(nameof(newOrder), "Order cannot be null.");

    if (newOrder.billingInfo == null)
        throw new ArgumentNullException(nameof(newOrder.billingInfo), "BillingInfo cannot be null.");

    if (newOrder.tickets == null || !newOrder.tickets.Any())
        throw new ArgumentException("Order must have at least one ticket.");

    if (newOrder.actualDate == DateTime.MinValue)
        throw new ArgumentException("ActualDate is invalid or not set.");

    var orderAttributes = new Dictionary<string, AttributeValue>
    {
        { "orderId", new AttributeValue { S = newOrder.orderId } },
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
                    { "address", new AttributeValue { S = newOrder.billingInfo.address } },
                    { "city", new AttributeValue { S = newOrder.billingInfo.city } },
                    { "postalCode", new AttributeValue { S = newOrder.billingInfo.postalCode } },
                    { "country", new AttributeValue { S = newOrder.billingInfo.country } }
                } 
            }
        },
        { "tickets", new AttributeValue
            {
                L = newOrder.tickets.Select(t => 
                {
                    if (string.IsNullOrEmpty(t.name) || t.quantity < 0 || t.price < 0)
                    {
                        throw new ArgumentException("Invalid ticket data.");
                    }

                    return new AttributeValue
                    {
                        M = new Dictionary<string, AttributeValue>
                        {
                            { "name", new AttributeValue { S = t.name } },
                            { "quantity", new AttributeValue { N = t.quantity.ToString() } },
                            { "price", new AttributeValue { N = t.price.ToString() } },
                            { "count", new AttributeValue { N = t.count.ToString() } },
                            { "bought", new AttributeValue { N = t.bought.ToString() } },
                            { "soldOut", new AttributeValue { BOOL = t.soldOut } }
                        }
                    };
                }).ToList()
            }
        }
    };

    try
    {
        Console.WriteLine("Transformed Order for DynamoDB: " + JsonConvert.SerializeObject(newOrder));
        await dynamoClient.PutItemAsync(TableName, orderAttributes);
    }
    catch (Exception ex)
    {
        throw new Exception($"Failed to save order to DynamoDB: {ex.Message}", ex);
    }
}


    
    public async Task<List<Order>> GetOrdersByUserIdAsync(string userId)
    {

        var queryRequest = new QueryRequest
        {
            TableName = "Orders",
            IndexName = "UserIdIndex",  // Replace with your GSI name if using one

            KeyConditionExpression = "userId = :userId",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":userId", new AttributeValue { S = userId } }
            }
        };

        var queryResponse = await dynamoClient.QueryAsync(queryRequest);

        var orders = queryResponse.Items.Select(item => new Order
        {
            orderId = item["orderId"].S,
            orderDate = long.Parse(item["orderDate"].N),
            actualDate = DateTime.Parse(item["actualDate"].S),
            userId = item["userId"].S,
            eventId = item["eventId"].S,
            totalPrice = double.Parse(item["totalPrice"].N),
            paymentMethod = item["paymentMethod"].S,
            refundable = item.ContainsKey("refundable") ? item["refundable"].BOOL ?? false : false,
            billingInfo = new BillingInfo
            {
                name = item["billingInfo"].M["name"].S,
                email = item["billingInfo"].M["email"].S,
                address = item["billingInfo"].M["address"].S,
                city = item["billingInfo"].M["city"].S,
                postalCode = item["billingInfo"].M["postalCode"].S,
                country = item["billingInfo"].M["country"].S
            },
            tickets = item["tickets"].L.Select(t => new Ticket
            {
                name = t.M["name"].S,
                quantity = int.Parse(t.M["quantity"].N),
                price = int.Parse(t.M["price"].N)
            }).ToList()
        }).ToList();

        return orders;
    }

    
    
}