// Models/TradeHistory.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // For ForeignKey attribute

namespace TradingBackend.Models
{
    public class TradeHistory
    {
        [Key] // Denotes the primary key
        public int TradeId { get; set; }

        // Foreign key to the User table
        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")] // Explicitly map to ENUM type for string
        public string Metal { get; set; } = string.Empty; // "gold" or "silver"

        [Required]
        [Column(TypeName = "varchar(10)")] // Explicitly map to ENUM type for string
        public string Action { get; set; } = string.Empty; // "buy" or "sell"

        [Required]
        public int Quantity { get; set; }

        [Required]
        public int Price { get; set; } // Assuming integer price

        public DateTime DateTime { get; set; } = DateTime.UtcNow; // Default to UTC current timestamp

        // Navigation property to the User
        public User? User { get; set; }
    }
}
