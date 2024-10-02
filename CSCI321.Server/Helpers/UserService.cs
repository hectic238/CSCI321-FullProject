using CSCI321.Server.DBSettings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using CSCI321.Server.Models;

namespace CSCI321.Server.Helpers
{
    public class UserService
    {
        private readonly IMongoCollection<User> _UserCollection;

        public UserService(
            IOptions<UserDatabaseSettings> UserDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                UserDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                UserDatabaseSettings.Value.DatabaseName);

            _UserCollection = mongoDatabase.GetCollection<User>(
                UserDatabaseSettings.Value.UserCollectionName);
        }

        public async Task<List<User>> GetAsync() =>
            await _UserCollection.Find(_ => true).ToListAsync();

        public async Task<User?> GetAsync(string id) =>
            await _UserCollection.Find(x => x.userId == id).FirstOrDefaultAsync();

        public async Task CreateAsync(User newUser) =>
            await _UserCollection.InsertOneAsync(newUser);

        public async Task UpdateAsync(string id, User updateUser) =>
            await _UserCollection.ReplaceOneAsync(x => x.userId == id, updateUser);

        public async Task RemoveAsync(string id) =>
            await _UserCollection.DeleteOneAsync(x => x.userId == id);

        public async Task<User?> GetAsyncByCreds(string username, string password) =>
            await _UserCollection.Find(x => x.email == username && x.password == password).FirstOrDefaultAsync();
        

                public async Task<User?> GetByIdAsync(string userId) =>
            await _UserCollection.Find(x => x.userId == userId).FirstOrDefaultAsync();

        // New method to get user by Email
        public async Task<User?> GetByEmailAsync(string email) =>
            await _UserCollection.Find(x => x.email == email).FirstOrDefaultAsync();
    }
}

