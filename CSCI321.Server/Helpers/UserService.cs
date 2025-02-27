using System.Text;
using CSCI321.Server.DBSettings;
using Microsoft.Extensions.Options;
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
        
        private readonly AmazonDynamoDBClient dynamoClient;
        
        private readonly IConfiguration _configuration;
        
        private const string TableName = "Users";  



        public UserService(
            IOptions<UserDatabaseSettings> UserDatabaseSettings, IConfiguration configuration)
        {
            _configuration = configuration;

            var config = new AmazonDynamoDBConfig
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
        }
        
        
        // Method to get a refresh token from the database
        public async Task<(string refreshToken, DateTime? expiry)?> GetRefreshTokenFromDB(string userId)
        {
            // Find the user by userId
            var request = new GetItemRequest
            {
                TableName = "Users",  
                Key = new Dictionary<string, AttributeValue>
                {
                    { "userId", new AttributeValue { S = userId } }  
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
                refreshToken = response.Item["refreshToken"].S,
                refreshTokenExpiry = DateTime.Parse(response.Item["refreshTokenExpiry"].S),
                
            };
    
            // Check if user exists and return the refresh token and expiry date
            if (user != null)
            {
                return (user.refreshToken, user.refreshTokenExpiry);
            }
    
            return null; // Return null if user is not found
        }

        public async Task CreateAsync(User2 newUser)
        {

            
            var table = Table.LoadTable(dynamoClient, TableName);

            var item = new Document
            {
                ["userId"] = newUser.userId,
                ["phoneNumber"] = newUser.phoneNumber,
                ["name"] = newUser.name,
                ["title"] = newUser.title,
                ["userType"] = newUser.userType,
                ["company"] = newUser.company,
                ["preferences"] = newUser.preferences,
                ["refreshToken"] = newUser.refreshToken,
                ["refreshTokenExpiry"] = newUser.refreshTokenExpiry,
                ["tickets"] = JsonSerializer.Serialize(newUser.tickets),  
                ["dateOfBirth"] = newUser.dateOfBirth.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                ["createdDate"] = DateTime.UtcNow.ToString(),
                ["interests"] = JsonSerializer.Serialize(newUser.interests)

            };
            
            

            await table.PutItemAsync(item);
            Console.WriteLine("Item inserted successfully!");
        }
        
        public async Task<bool> CheckDuplicateUserIdAsync(string userId)
        {
            var request = new QueryRequest
            {
                TableName = TableName,
                KeyConditionExpression = "userId = :userId",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":userId", new AttributeValue { S = userId } }
                }
            };

            var response = await dynamoClient.QueryAsync(request);
            return response.Count > 0;
        }
        public async Task<bool> CheckDuplicateEmailAsync(string email)
        {
            var request = new QueryRequest
            {
                TableName = TableName,
                IndexName = "EmailIndex",  
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
        
        
        public async Task<User?> GetPasswordByIdAsync(string userId)
        {
            var request = new GetItemRequest
            {
                TableName = "Users",  
                Key = new Dictionary<string, AttributeValue>
                {
                    { "userId", new AttributeValue { S = userId } }  
                }
            };

            var response = await dynamoClient.GetItemAsync(request);

            if (response.Item == null || response.Item.Count == 0)
            {
                return null;  
            }
            
            var user = new User
            {
                password = response.Item["password"].S,
                userId = response.Item["userId"].S,
            };

            return user;
        }
        

        public async Task<User?> GetByIdAsync(string userId)
        {
            var request = new GetItemRequest
            {
                TableName = "Users",  
                Key = new Dictionary<string, AttributeValue>
                {
                    { "userId", new AttributeValue { S = userId } }  
                }
            };

            var response = await dynamoClient.GetItemAsync(request);

            if (response.Item == null || response.Item.Count == 0)
            {
                return null;  
            }


            var user = new User
            {
                interests = response.Item["interests"].L.Select(attribute => attribute.S).ToList(),
                userId = response.Item["userId"].S,
                name = response.Item["name"].S,
                userType = response.Item["userType"].S,
                // refreshToken = response.Item["refreshToken"].S,
                // refreshTokenExpiry = DateTime.Parse(response.Item["refreshTokenExpiry"].S),
                title = response.Item["title"].S,
                dateOfBirth = DateTime.Parse(response.Item["dateOfBirth"].S),

                phoneNumber = response.Item["phoneNumber"].S,

            };
            return user;
        }

        
        public async Task<Dictionary<string, AttributeValue>> GetUserByEmailAsync(string email)
        {
            
            var queryRequest = new QueryRequest
            {
                TableName = TableName,
                IndexName = "EmailIndex", 
                KeyConditionExpression = "email = :email", 
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":email", new AttributeValue { S = email } } 
                },
                
                ProjectionExpression = "#userId, #userType, #password, #name, #email",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    { "#userId", "userId" },
                    { "#userType", "userType" },
                    { "#password", "password" },
                    { "#name", "name" }, 
                    { "#email", "email" } 
                }
            };

            
            var response = await dynamoClient.QueryAsync(queryRequest);

            if (response.Items.Count > 0)
            {
                return response.Items[0]; 
            }

            return null; 
        }
        
        // Updating Users Information from the Profile Page
        public async Task UpdateUserAsync(User updatedUser)
        {
            
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
                UpdateExpression = "SET #name = :name, #dateOfBirth = :dateOfBirth,#phoneNumber = :phoneNumber ,#title = :title, #interests = :interests ",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    { "#name", "name" },   
                    { "#dateOfBirth", "dateOfBirth" },
                    { "#phoneNumber", "phoneNumber" },
                    { "#title", "title" },
                    { "#interests", "interests" }
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":name", new AttributeValue { S = updatedUser.name ?? string.Empty } },
                    { ":dateOfBirth", new AttributeValue { S = updatedUser.dateOfBirth.ToString("o") } },
                    { ":phoneNumber", new AttributeValue { S = updatedUser.phoneNumber ?? string.Empty } },
                    { ":title", new AttributeValue { S = updatedUser.title ?? string.Empty } },
                    { ":interests", new AttributeValue { L = updatedUser.interests.Select(interest => new AttributeValue { S = interest }).ToList() } }

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
        
        public async Task UpdateUserPasswordAsync(User updatedUser)
        {
            
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
                UpdateExpression = "SET #password = :password",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    { "#password", "password" },   
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":password", new AttributeValue { S = updatedUser.password ?? string.Empty } },

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

