﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CSCI321.Server.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string userId { get; set; }
    public string name { get; set; }
    public string email { get; set; }
    public string password { get; set; }
    public string userType { get; set; }
    public string company { get; set; }
    public string preferences { get; set; }
    }
}
