using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // For ForeignKey attribute

namespace TradingBackend.Models
{
    public class UserHoldings
    {
        [Key] // UserId is also the primary key for this table as it's a 1-to-1 or 1-to-many relationship
        [ForeignKey("User")] // Denotes this is a foreign key to the User table
        public int UserId { get; set; }

        public int GoldHolding { get; set; } = 0; // Default to 0


        [Required]
        [Column(TypeName = "decimal(18, 4)")] // Use decimal for currency precision
        public decimal AverageGoldPrice { get; set; } = 0m; // Default to 0, 'm' for decimal literal


        [Required]
        public int SilverHolding { get; set; } = 0; // Default to 0

    
        [Required]
        [Column(TypeName = "decimal(18, 4)")] // Use decimal for currency precision
        public decimal AverageSilverPrice { get; set; } = 0m; // Default to 0, 'm' for decimal literal
    

        [Required]
        public int CashReserve { get; set; } = 0; // Store the user's cash balance

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow; // Default to UTC current timestamp

        public User? User { get; set; }
    }
}
