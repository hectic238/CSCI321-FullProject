
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CSCI321.Server.Models;
using Microsoft.IdentityModel.Tokens;
namespace CSCI321.Server.Helpers
{
    public class AuthService
    {

        private readonly IConfiguration configuration;
        public AuthService(IConfiguration configuration)
        {
            this.configuration = configuration;
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
        
        
        public string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString(); // Generate a unique string for the refresh token
        }


        public string GenerateAccessToken(string userId, string email, string userType)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            
            Console.WriteLine("UserId in GenerateToken" + userId);
            Console.WriteLine("Email in GenerateToken" + email);
            Console.WriteLine("UserType in GenerateToken" + userType);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),  // This should work for sub
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("userType", userType),
            };
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var token = new JwtSecurityToken(
                configuration["Jwt:Issuer"],
                configuration["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddMinutes(2),
                signingCredentials: signIn
                );
            
            string tokenValue = new JwtSecurityTokenHandler().WriteToken(token);
            
            return tokenValue;
        }
        
        
    }
}