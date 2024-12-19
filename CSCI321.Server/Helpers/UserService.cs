using CSCI321.Server.DBSettings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using CSCI321.Server.Models;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.Internal;
using Amazon.Runtime;
using Amazon;
using Amazon.DynamoDBv2.Model;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace CSCI321.Server.Helpers
{
    public class UserService
    {
        private readonly IMongoCollection<User> _UserCollection;
        
        private readonly AmazonDynamoDBClient dynamoClient;
        
        private const string TableName = "Users";  // Replace with your table name



        public UserService(
            IOptions<UserDatabaseSettings> UserDatabaseSettings)
        {
            
            var config = new AmazonDynamoDBConfig
            {
                RegionEndpoint = RegionEndpoint.APSoutheast2  // Change region if needed
            };

            dynamoClient = new AmazonDynamoDBClient(config);
            var mongoClient = new MongoClient(
                UserDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                UserDatabaseSettings.Value.DatabaseName);

            _UserCollection = mongoDatabase.GetCollection<User>(
                UserDatabaseSettings.Value.UserCollectionName);
        }
        
        
        // Method to get a refresh token from the database
        public async Task<(string refreshToken, DateTime expiry)?> GetRefreshTokenFromDB(string userId)
        {
            // Find the user by userId
            var request = new GetItemRequest
            {
                TableName = "Users",  // Replace with your table name
                Key = new Dictionary<string, AttributeValue>
                {
                    { "UserId", new AttributeValue { S = userId } }  // Key should match DynamoDB table
                }
            };

            var response = await dynamoClient.GetItemAsync(request);

            if (response.Item == null || response.Item.Count == 0)
            {
                return null;  // User not found
            }

            // Convert DynamoDB attributes to a User object
            var user = new User
            {
                refreshToken = response.Item["RefreshToken"].S,
                refreshTokenExpiry = DateTime.Parse(response.Item["RefreshTokenExpiry"].S),
                
            };
    
            // Check if user exists and return the refresh token and expiry date
            if (user != null)
            {
                return (user.refreshToken, user.refreshTokenExpiry);
            }
    
            return null; // Return null if user is not found
        }

        public async Task CreateAsync(User newUser)
        {

            // Example: Insert an Item
            var table = Table.LoadTable(dynamoClient, TableName);

            var item = new Document
            {
                ["userId"] = Guid.NewGuid().ToString(),
                ["name"] = newUser.name,
                ["email"] = newUser.email,
                ["password"] = newUser.password,
                ["userType"] = newUser.userType,
                ["company"] = newUser.company,
                ["preferences"] = newUser.preferences,
                ["refreshToken"] = newUser.refreshToken,
                ["refreshTokenExpiry"] = newUser.refreshTokenExpiry,
                ["tickets"] = JsonSerializer.Serialize(newUser.tickets),  // Serialize to JSON string
                ["createdDate"] = DateTime.UtcNow.ToString()
            };

            await table.PutItemAsync(item);
            Console.WriteLine("Item inserted successfully!");
        }
        
        public async Task<bool> CheckDuplicateEmailAsync(string email)
        {
            var request = new QueryRequest
            {
                TableName = TableName,
                IndexName = "EmailIndex",  // Use the created GSI
                KeyConditionExpression = "email = :email",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":email", new AttributeValue { S = email } }
                }
            };

            var response = await dynamoClient.QueryAsync(request);
            return response.Count > 0;
        }


        // Method to store a refresh token and its expiry date in the database
        public async Task StoreRefreshToken(string userId, string refreshToken, DateTime expiry)
        {
            var updateRequest = new UpdateItemRequest
            {
                TableName = "Users",
                Key = new Dictionary<string, AttributeValue>
                {
                    { "userId", new AttributeValue { S = userId } }
                },
                UpdateExpression = "SET refreshToken = :token, refreshTokenExpiry = :expiry",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":token", new AttributeValue { S = refreshToken } },
                    { ":expiry", new AttributeValue { S = expiry.ToString("o") } }
                },
                ReturnValues = "UPDATED_NEW"
            };

            try
            {
                var response = await dynamoClient.UpdateItemAsync(updateRequest);
                Console.WriteLine("Refresh token updated successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to update refresh token: {ex.Message}");
            }

        }

        public async Task<List<User>> GetAsync() =>
            await _UserCollection.Find(_ => true).ToListAsync();
        

        public async Task<User?> GetByIdAsync(string userId)
        {
            var request = new GetItemRequest
            {
                TableName = "Users",  // Replace with your table name
                Key = new Dictionary<string, AttributeValue>
                {
                    { "UserId", new AttributeValue { S = userId } }  // Key should match DynamoDB table
                }
            };

            var response = await dynamoClient.GetItemAsync(request);

            if (response.Item == null || response.Item.Count == 0)
            {
                return null;  // User not found
            }

            // Convert DynamoDB attributes to a User object
            var user = new User
            {
                userId = response.Item["UserId"].S,
                name = response.Item["Name"].S,
                email = response.Item["Email"].S,
                tickets = response.Item.ContainsKey("Tickets") ? 
                    JsonConvert.DeserializeObject<List<Ticket>>(response.Item["Tickets"].S) : new List<Ticket>(),
                refreshToken = response.Item["RefreshToken"].S,
                refreshTokenExpiry = DateTime.Parse(response.Item["RefreshTokenExpiry"].S),
                
            };

            return user;
        }

        // New method to get user by Email
        public async Task<Dictionary<string, AttributeValue>> GetUserByEmailAsync(string email)
        {
            var table = Table.LoadTable(dynamoClient, TableName);
            
            // Create a query configuration
            var queryRequest = new QueryRequest
            {
                TableName = TableName,
                IndexName = "EmailIndex", // Specify the GSI name
                KeyConditionExpression = "email = :email", // Correctly capitalized 'Email' for the partition key
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":email", new AttributeValue { S = email } } // The email value you're searching for
                },
                // Specify the attributes to retrieve with exact capitalized names
                ProjectionExpression = "#userId, #userType, #password, #name, #email",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    { "#userId", "userId" },
                    { "#userType", "userType" },
                    { "#password", "password" },
                    { "#name", "name" }, // 'name' should be handled as a reserved word in DynamoDB
                    { "#email", "email" } // Ensure 'Email' is the exact capitalization used in the index
                }
            };

            // Execute the query
            var response = await dynamoClient.QueryAsync(queryRequest);

            if (response.Items.Count > 0)
            {
                return response.Items[0]; // Return the first matching user
            }

            return null; // No match found
        }
        public async Task UpdateUserAsync(User updatedUser)
        {
            // if (updatedUser == null || string.IsNullOrEmpty(updatedUser.userId))
            // {
            //     throw new ArgumentException("Invalid user data.");
            // }
            //
            // var filter = Builders<User>.Filter.Eq(u => u.userId, updatedUser.userId);
            // var updateDefinition = Builders<User>.Update
            //     .Set(u => u.name, updatedUser.name)
            //     .Set(u => u.email, updatedUser.email)
            //     .Set(u => u.tickets, updatedUser.tickets);
            //
            // var result = await _UserCollection.UpdateOneAsync(filter, updateDefinition);
            //
            // if (result.ModifiedCount == 0)
            // {
            //     throw new InvalidOperationException("No records were updated. The user might not exist.");
            // }
            
            if (updatedUser == null || string.IsNullOrEmpty(updatedUser.userId))
            {
                throw new ArgumentException("Invalid user data.");
            }

            var updateRequest = new UpdateItemRequest
            {
                TableName = "Users",
                Key = new Dictionary<string, AttributeValue>
                {
                    { "userId", new AttributeValue { S = updatedUser.userId } }
                },
                UpdateExpression = "SET #name = :name, #email = :email, #tickets = :tickets",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    { "#name", "name" },   // Use placeholders for reserved keywords
                    { "#email", "email" },
                    { "#tickets", "tickets" }
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":name", new AttributeValue { S = updatedUser.name ?? string.Empty } },
                    { ":email", new AttributeValue { S = updatedUser.email ?? string.Empty } },
                    { ":tickets", new AttributeValue { S = Newtonsoft.Json.JsonConvert.SerializeObject(updatedUser.tickets) } }
                },
                ReturnValues = "UPDATED_NEW"
            };

            try
            {
                var response = await dynamoClient.UpdateItemAsync(updateRequest);

                if (response.Attributes.Count == 0)
                {
                    throw new InvalidOperationException("No records were updated. The user might not exist.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                throw;
            }
        }
    }
}

