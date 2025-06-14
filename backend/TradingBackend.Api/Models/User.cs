using System.ComponentModel.DataAnnotations;
using TradingBackend.Models;

namespace TradingBackend.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Email { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<TradeHistory> TradeHistories { get; set; } = new List<TradeHistory>();

        public UserHoldings UserHolding { get; set; } = default;

        public ICollection<PendingOrder> PendingOrders { get; set; } = new List<PendingOrder>();
    }
}
