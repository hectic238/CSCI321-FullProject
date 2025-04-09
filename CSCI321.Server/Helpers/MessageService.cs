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
    public class MessageService
    {
        private readonly AmazonDynamoDBClient dynamoClient;

        private readonly IConfiguration _configuration;

        private const string TableName = "Messages";  // Replace with your table name



        public MessageService(
            IConfiguration configuration)
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
                    awsAccessKeyId, awsSecretAccessKey
                ),
                config);    
        }
        public async Task CreateAsync(MessageModel newMessageModel)
        {

            // Example: Insert an Item
            var table = Table.LoadTable(dynamoClient, TableName);

            var item = new Document
            {
                ["messageId"] = newMessageModel.messageId,
                ["firstName"] = newMessageModel.firstName,
                ["lastName"] = newMessageModel.lastName,
                ["message"] = newMessageModel.message,
                ["email"] = newMessageModel.email,  
            };

            await table.PutItemAsync(item);
            Console.WriteLine("Item inserted successfully!");
        }
    }
}