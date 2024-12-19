using System.Text.Json;
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
            var user = await _UserCollection.Find(x => x.userId == userId).FirstOrDefaultAsync();
    
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
                ["Name"] = newUser.name,
                ["Email"] = newUser.email,
                ["Password"] = newUser.password,
                ["UserType"] = newUser.userType,
                ["Company"] = newUser.company,
                ["Preferences"] = newUser.preferences,
                ["RefreshToken"] = newUser.refreshToken,
                ["RefreshTokenExpiry"] = newUser.refreshTokenExpiry,
                ["Tickets"] = JsonSerializer.Serialize(newUser.tickets),  // Serialize to JSON string
                ["CreatedDate"] = DateTime.UtcNow.ToString()
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
                KeyConditionExpression = "Email = :email",
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
            var user = await _UserCollection.Find(x => x.userId == userId).FirstOrDefaultAsync();
            if (user != null)
            {
                user.refreshToken = refreshToken; // Store the new refresh token
                user.refreshTokenExpiry = expiry; // Store the expiration date
                await _UserCollection.ReplaceOneAsync(x => x.userId == userId, user);
            }
        }

        public async Task<List<User>> GetAsync() =>
            await _UserCollection.Find(_ => true).ToListAsync();

        public async Task<User?> GetAsync(string id) =>
            await _UserCollection.Find(x => x.userId == id).FirstOrDefaultAsync();
        

        public async Task UpdateAsync(string id, User updateUser) =>
            await _UserCollection.ReplaceOneAsync(x => x.userId == id, updateUser);

        public async Task RemoveAsync(string id) =>
            await _UserCollection.DeleteOneAsync(x => x.userId == id);

        public async Task<User?> GetAsyncByCreds(string username, string password) =>
            await _UserCollection.Find(x => x.email == username && x.password == password).FirstOrDefaultAsync();
        

                public async Task<User?> GetByIdAsync(string userId) =>
            await _UserCollection.Find(x => x.userId == userId).FirstOrDefaultAsync();

        // New method to get user by Email
        public async Task<Dictionary<string, AttributeValue>> GetUserByEmailAsync(string email)
        {
            var table = Table.LoadTable(dynamoClient, TableName);
            
            // Create a query configuration
            var queryRequest = new QueryRequest
            {
                TableName = TableName,
                IndexName = "EmailIndex", // Specify the GSI name
                KeyConditionExpression = "email = :email", // Email is the partition key for the GSI
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":email", new AttributeValue { S = email } }
                },
                ProjectionExpression = "userId, userType, password, name, email" // Specify the attributes you want to retrieve
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
            if (updatedUser == null || string.IsNullOrEmpty(updatedUser.userId))
            {
                throw new ArgumentException("Invalid user data.");
            }

            var filter = Builders<User>.Filter.Eq(u => u.userId, updatedUser.userId);
            var updateDefinition = Builders<User>.Update
                .Set(u => u.name, updatedUser.name)
                .Set(u => u.email, updatedUser.email)
                .Set(u => u.tickets, updatedUser.tickets);

            var result = await _UserCollection.UpdateOneAsync(filter, updateDefinition);

            if (result.ModifiedCount == 0)
            {
                throw new InvalidOperationException("No records were updated. The user might not exist.");
            }
        }
    }
}

