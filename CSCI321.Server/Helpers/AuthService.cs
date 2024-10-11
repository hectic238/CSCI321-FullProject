
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace CSCI321.Server.Helpers
{
    public class AuthService
    {

        public AuthService()
        {

        }


        public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("a very long and secure secret key");

            try
            {
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false, // Here we are disabling the lifetime validation
                    ClockSkew = TimeSpan.Zero
                };

                var principal =
                    tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

                if (securityToken is JwtSecurityToken jwtSecurityToken &&
                    jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                        StringComparison.InvariantCultureIgnoreCase))
                {
                    return principal; // Return the ClaimsPrincipal
                }
                else
                {
                    throw new SecurityTokenException("Invalid token");
                }
            }
            catch (Exception ex)
            {

                return null;
            }
        }
        
        public async Task storeRefreshToken(string userId, string refreshToken, DateTime expiry)
        {
            // Save the refresh token, userId, and expiry date to the database
        }
        
        public string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString(); // Generate a unique string for the refresh token
        }


        public string GenerateAccessToken(string userId, int tokenExpirationMinutes)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("a very long and secure secret key");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId),
                }),

                Expires = DateTime.UtcNow.AddMinutes(tokenExpirationMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        
        
    }
}