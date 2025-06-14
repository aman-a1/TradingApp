using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // For ForeignKey attribute

namespace TradingBackend.Models
{
    public class TradeRequest
    {
        [Required]
        public string Metal { get; set; } = string.Empty; // "gold" or "silver"

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; } // Current ask/bid price from frontend

        [Range(0.01, (double)decimal.MaxValue, ErrorMessage = "Trigger price must be greater than 0.")]
        public decimal? TriggerPrice { get; set; } // Nullable for market orders

        public string? Type { get; set; }
    }
}