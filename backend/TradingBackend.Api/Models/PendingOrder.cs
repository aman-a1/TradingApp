using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TradingBackend.Models.Enums;

namespace TradingBackend.Models
{
    public class PendingOrder
    {
        [Key]
        public int OrderId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")] // "gold" or "silver"
        public string Metal { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(10)")] // "buy" or "sell"
        public string Action { get; set; } = string.Empty;

        [Required]
        public int Quantity { get; set; } // Quantity of metal to trade

        [Required]
        [Column(TypeName = "decimal(18, 4)")] // Price at which the order should execute
        public decimal TriggerPrice { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")] // HIGHLIGHT: Stores the order type (Limit or StopLoss)
        public OrderType Type { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")] // HIGHLIGHT: Stores the current status of the order
        public OrderStatus Status { get; set; } = OrderStatus.Pending; // Default to Pending

        public DateTime PlacedAt { get; set; } = DateTime.UtcNow; // When the order was placed

        public DateTime? ExecutedAt { get; set; } // When the order was executed

        public string? FailureReason { get; set; } // Reason if order failed

        public User? User { get; set; }
    }
}
