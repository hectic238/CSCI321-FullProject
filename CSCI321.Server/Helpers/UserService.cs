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
            await _UserCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(User newUser) =>
            await _UserCollection.InsertOneAsync(newUser);

        public async Task UpdateAsync(string id, User updateUser) =>
            await _UserCollection.ReplaceOneAsync(x => x.Id == id, updateUser);

        public async Task RemoveAsync(string id) =>
            await _UserCollection.DeleteOneAsync(x => x.Id == id);

        public async Task<User?> GetAsyncByCreds(string username, string password) =>
            await _UserCollection.Find(x => x.Email == username && x.Password == password).FirstOrDefaultAsync();
        
    }
}

