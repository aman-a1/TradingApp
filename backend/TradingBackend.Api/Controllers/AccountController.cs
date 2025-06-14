using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradingBackend.Data;
using TradingBackend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net; // For password hashing
using Microsoft.Extensions.Configuration; // For accessing appsettings.json

namespace TradingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AccountController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Account/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {

            // Basic validation
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if username already exists
            if (await _context.Users.AnyAsync(u => u.Username == model.Username))
            {
                return Conflict("Username already exists.");
            }

            // Hash the password using BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var user = new User
            {
                Username = model.Username,
                PasswordHash = passwordHash,
                Email = model.Email,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();


            var userHolding = new UserHoldings
            {
                UserId = user.Id, // Link to the newly created user's ID
                GoldHolding = 0,
                AverageGoldPrice = 0,
                SilverHolding = 0,
                AverageSilverPrice = 0,
                CashReserve = 100000, // Initial cash balance
                LastUpdated = DateTime.UtcNow
            };

            _context.userHoldings.Add(userHolding);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Registration successful!" });
        }

        // POST: api/Account/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find the user by username
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == model.Username);

            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            // Verify the password using BCrypt
            if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid credentials.");
            }

            // User authenticated, generate JWT token
            var tokenString = GenerateJwtToken(user);

            return Ok(new { Token = tokenString, user = user });
        }

        // Helper method to generate JWT token
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!); // Get secret key from configuration
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // User ID
                    new Claim(ClaimTypes.Name, user.Username) // Username
                }),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"]!)), // Token expiry
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}