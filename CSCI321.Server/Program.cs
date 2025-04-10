using System.Text;
using CSCI321.Server.DBSettings;
using CSCI321.Server.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Auth0.AspNetCore.Authentication;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<UserDatabaseSettings>(
    builder.Configuration.GetSection("Database"));

builder.Services.Configure<EventDatabaseSettings>(
    builder.Configuration.GetSection("Database"));

builder.Services.Configure<OrderDatabaseSettings>(
    builder.Configuration.GetSection("Database"));

builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<EventService>();
builder.Services.AddSingleton<OrderService>();
builder.Services.AddSingleton<MessageService>();

builder.Services.AddAuth0WebAppAuthentication(options =>
{
    options.Domain = builder.Configuration["Auth0:Domain"];
    options.ClientId = builder.Configuration["Auth0:ClientId"];
});

builder.Services.AddHttpClient();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.Authority = "https://dev-6iygpn0kdurcf4mw.us.auth0.com/";
    options.Audience = "https://dev-6iygpn0kdurcf4mw.us.auth0.com/api/v2/";
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true
    };
});

builder.Services.AddControllers();

builder.Services.AddAuthorization();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("https://localhost:5173","http://localhost:5173") // Replace with your frontend URL
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

// Add other services
builder.Services.AddControllers(); 

builder.WebHost.ConfigureKestrel(options =>
{
    // Listen on any IP for HTTP and HTTPS
    options.ListenAnyIP(5144, listenOptions =>
    {
        listenOptions.UseHttps();  // Enable HTTPS
    });
});




var app = builder.Build();

// Enable CORS globally or on specific endpoints
app.UseCors("AllowSpecificOrigin");

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.Urls.Add("https://localhost:5144");

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
