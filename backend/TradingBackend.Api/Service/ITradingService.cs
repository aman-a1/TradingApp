// Services/ITradingService.cs
using TradingBackend.Models;
using TradingBackend.Models.Enums;
using System.Threading.Tasks;

namespace TradingBackend.Services
{
    public interface ITradingService
    {
        // Represents the outcome of a trade operation
        public class TradeResult
        {
            public bool IsSuccess { get; set; }
            public string Message { get; set; } = string.Empty;
            public TradeHistory? TradeRecord { get; set; } // The recorded trade history entry
            public UserHoldings? UpdatedHoldings { get; set; } // The user's updated holdings
        }

        public class PlaceOrderResult
        {
            public bool IsSuccess { get; set; }
            public string Message { get; set; } = string.Empty;
            public PendingOrder? PendingOrder { get; set; }
        }

        /// <summary>
        /// Handles a buy trade operation for a specific metal and quantity.
        /// </summary>
        /// <param name="userId">The ID of the user performing the trade.</param>
        /// <param name="metal">The type of metal ('gold' or 'silver').</param>
        /// <param name="quantity">The quantity of metal to buy.</param>
        /// <param name="currentAskPrice">The current ask price per unit of the metal.</param>
        /// <returns>A TradeResult indicating success/failure and details.</returns>
        Task<TradeResult> ExecuteBuyTradeAsync(int userId, string metal, decimal quantity, decimal currentAskPrice);

        /// <summary>
        /// Handles a sell trade operation for a specific metal and quantity.
        /// </summary>
        /// <param name="userId">The ID of the user performing the trade.</param>
        /// <param name="metal">The type of metal ('gold' or 'silver').</param>
        /// <param name="quantity">The quantity of metal to sell.</param>
        /// <param name="currentBidPrice">The current bid price per unit of the metal.</param>
        /// <returns>A TradeResult indicating success/failure and details.</returns>
        Task<TradeResult> ExecuteSellTradeAsync(int userId, string metal, decimal quantity, decimal currentBidPrice);

        /// <summary>
        /// Retrieves a user's current holdings.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>The UserHolding object or null if not found.</returns>
        Task<UserHoldings?> GetUserHoldingsAsync(int userId);

        /// <summary>
        /// Retrieves the trade history for a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A collection of TradeHistory entries for the user.</returns>
        Task<IEnumerable<TradeHistory>> GetTradeHistoryAsync(int userId);


        Task<PlaceOrderResult> PlacePendingOrderAsync(
         int userId,
         string metal,
         string action,
         int quantity,
         decimal triggerPrice,
         OrderType orderType
     );


        Task<IEnumerable<PendingOrder>> GetPendingOrdersAsync(int userId);

    }
}
