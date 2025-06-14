using Microsoft.EntityFrameworkCore;
using TradingBackend.Data;
using TradingBackend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MySql.EntityFrameworkCore;
using System.Text.Json.Serialization; // Don't forget this using statement



var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configure MySQL database connection with Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(connectionString
   // ,new ServerVersion.AutoDetect(connectionString))
    )); // AutoDetect for MySQL version


builder.Services.AddScoped<ITradingService, TradingService>();

// Add Controllers for MVC API endpoints
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!))
    };
});

// Configure CORS for frontend access

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // <--- CHANGED FROM 5173 to 3000
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Important for JWT if using cookies or specific headers
        });
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); // Redirect HTTP to HTTPS

app.UseCors(); // Use CORS policy

app.UseAuthentication(); // Enable authentication
app.UseAuthorization(); // Enable authorization

app.MapControllers(); // Map controller endpoints

app.Run();
