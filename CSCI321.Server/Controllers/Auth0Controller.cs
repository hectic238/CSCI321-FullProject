

using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace CSCI321.Server.Controllers;
[ApiController]
[Route("api/auth0")]
public class Auth0Controller : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public Auth0Controller(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    [HttpPost("update-user-metadata")]
    public async Task<IActionResult> UpdateUserMetadata([FromBody] UpdateUserMetadataRequest request)
    {
        try
        {
            // Get the Management API access token
            var accessToken = await GetManagementApiToken();
            if (string.IsNullOrEmpty(accessToken))
            {
                return StatusCode(500, "Failed to retrieve Auth0 Management API token.");
            }

            // Prepare the request to update user metadata
            var url = $"https://{_configuration["Auth0:Domain"]}/api/v2/users/{request.UserId}";
            var payload = new
            {
                user_metadata = new { userType = request.UserType }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            // Make the PATCH request to Auth0
            var response = await _httpClient.PatchAsync(url, content);
            if (response.IsSuccessStatusCode)
            {
                return Ok("User metadata updated successfully.");
            }
            else
            {
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    private async Task<string> GetManagementApiToken()
    {
        var tokenEndpoint = $"https://{_configuration["Auth0:Domain"]}/oauth/token";
        var clientId = _configuration["Auth0:ClientId"];
        var clientSecret = _configuration["Auth0:ClientSecret"];
        var audience = _configuration["Auth0:Audience"];

        var requestBody = new
        {
            client_id = clientId,
            client_secret = clientSecret,
            audience = audience,
            grant_type = "client_credentials"
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(tokenEndpoint, content);

        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var tokenResult = JsonSerializer.Deserialize<Auth0TokenResponse>(responseContent);
            return tokenResult?.Access_token;
        }
        return null;
    }
}

public class UpdateUserMetadataRequest
{
    public string UserId { get; set; }
    public string UserType { get; set; }
}

public class Auth0TokenResponse
{
    public string Access_token { get; set; }
    public string Token_type { get; set; }
}
