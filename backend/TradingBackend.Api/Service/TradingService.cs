// Services/TradingService.cs
using Microsoft.EntityFrameworkCore;
using TradingBackend.Data;
using TradingBackend.Models;
using TradingBackend.Models.Enums;
using System;
using System.Threading.Tasks;

namespace TradingBackend.Services
{
    public class TradingService : ITradingService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TradingService> _logger; // Added for logging

        public TradingService(AppDbContext context, ILogger<TradingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves a user's current holdings.
        /// </summary>
        public async Task<UserHoldings?> GetUserHoldingsAsync(int userId)
        {
            return await _context.userHoldings.SingleOrDefaultAsync(uh => uh.UserId == userId);
        }

        /// <summary>
        /// Retrieves the trade history for a specific user.
        /// </summary>
        public async Task<IEnumerable<TradeHistory>> GetTradeHistoryAsync(int userId)
        {
            // Use .Where() to filter records based on a condition
            // Use .OrderByDescending() to get the latest trades first
            return await _context.TradeHistories
                                 .Where(t => t.UserId == userId)
                                 .OrderByDescending(t => t.DateTime) // Order by latest trades first
                                 .ToListAsync(); // Execute the query and return as a list
        }

        /// <summary>
        /// Handles a buy trade operation.
        /// </summary>
        public async Task<ITradingService.TradeResult> ExecuteBuyTradeAsync(int userId, string metal, decimal quantity, decimal currentAskPrice)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var userHolding = await _context.userHoldings.SingleOrDefaultAsync(uh => uh.UserId == userId);
                    if (userHolding == null)
                    {
                        return new ITradingService.TradeResult { IsSuccess = false, Message = "User holdings not found." };
                    }

                    if (currentAskPrice <= 0)
                    {
                        return new ITradingService.TradeResult { IsSuccess = false, Message = "Invalid buy price." };
                    }

                    decimal totalCost = quantity * currentAskPrice;

                    if (userHolding.CashReserve < totalCost)
                    {
                        return new ITradingService.TradeResult { IsSuccess = false, Message = "Insufficient cash reserve." };
                    }

                    userHolding.CashReserve -= (int)totalCost; // Deduct cost
                    userHolding.LastUpdated = DateTime.UtcNow;

                    TradeHistory tradeRecord;

                    if (metal.ToLower() == "gold")
                    {
                        if (userHolding.GoldHolding > 0)
                        {
                            userHolding.AverageGoldPrice =
                                ((userHolding.GoldHolding * userHolding.AverageGoldPrice) + (quantity * currentAskPrice)) / (userHolding.GoldHolding + quantity);
                        }
                        else
                        {
                            userHolding.AverageGoldPrice = currentAskPrice; // First purchase
                        }

                        userHolding.GoldHolding += (int)quantity; // Add gold quantity
                        tradeRecord = new TradeHistory
                        {
                            UserId = userId,
                            Metal = "gold",
                            Action = "buy",
                            Quantity = (int)quantity,
                            Price = (int)currentAskPrice,
                            DateTime = DateTime.UtcNow
                        };
                    }
                    else if (metal.ToLower() == "silver")
                    {
                        if (userHolding.SilverHolding > 0)
                        {
                            userHolding.AverageSilverPrice =
                                ((userHolding.SilverHolding * userHolding.AverageSilverPrice) + (quantity * currentAskPrice)) / (userHolding.SilverHolding + quantity);
                        }
                        else
                        {
                            userHolding.AverageSilverPrice = currentAskPrice; // First purchase
                        }
                        userHolding.SilverHolding += (int)quantity;
                        tradeRecord = new TradeHistory
                        {
                            UserId = userId,
                            Metal = "silver",
                            Action = "buy",
                            Quantity = (int)quantity,
                            Price = (int)currentAskPrice,
                            DateTime = DateTime.UtcNow
                        };
                    }
                    else
                    {
                        return new ITradingService.TradeResult { IsSuccess = false, Message = "Invalid metal specified." };
                    }

                    _context.TradeHistories.Add(tradeRecord);
                    _context.userHoldings.Update(userHolding); // Mark holdings as modified

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation($"User {userId} successfully bought {quantity} of {metal} for {totalCost}. New balance: {userHolding.CashReserve}");
                    return new ITradingService.TradeResult { IsSuccess = true, Message = "Buy trade successful.", TradeRecord = tradeRecord, UpdatedHoldings = userHolding };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, $"Error executing buy trade for user {userId}, metal {metal}, quantity {quantity}.");
                    return new ITradingService.TradeResult { IsSuccess = false, Message = $"An error occurred during the buy trade: {ex.Message}" };
                }
            }
        }

        /// <summary>
        /// Handles a sell trade operation.
        /// </summary>
        public async Task<ITradingService.TradeResult> ExecuteSellTradeAsync(int userId, string metal, decimal quantity, decimal currentBidPrice)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var userHolding = await _context.userHoldings.SingleOrDefaultAsync(uh => uh.UserId == userId);
                    if (userHolding == null)
                    {
                        return new ITradingService.TradeResult { IsSuccess = false, Message = "User holdings not found." };
                    }

                    if (currentBidPrice <= 0)
                    {
                        return new ITradingService.TradeResult { IsSuccess = false, Message = "Invalid sell price." };
                    }

                    decimal totalRevenue = quantity * currentBidPrice;

                    TradeHistory tradeRecord;

                    if (metal.ToLower() == "gold")
                    {
                        if (userHolding.GoldHolding < quantity)
                        {
                            return new ITradingService.TradeResult { IsSuccess = false, Message = "Insufficient gold holding." };
                        }
                        userHolding.GoldHolding -= (int)quantity;
        
                        if (userHolding.GoldHolding == 0)
                        {
                            userHolding.AverageGoldPrice = 0m;
                        }

                        tradeRecord = new TradeHistory
                        {
                            UserId = userId,
                            Metal = "gold",
                            Action = "sell",
                            Quantity = (int)quantity,
                            Price = (int)currentBidPrice,
                            DateTime = DateTime.UtcNow
                        };
                    }
                    else if (metal.ToLower() == "silver")
                    {
                        if (userHolding.SilverHolding < quantity)
                        {
                            return new ITradingService.TradeResult { IsSuccess = false, Message = "Insufficient silver holding." };
                        }
                        userHolding.SilverHolding -= (int)quantity;
                        if (userHolding.SilverHolding == 0)
                        {
                            userHolding.AverageSilverPrice = 0m;
                        }

                        tradeRecord = new TradeHistory
                        {
                            UserId = userId,
                            Metal = "silver",
                            Action = "sell",
                            Quantity = (int)quantity,
                            Price = (int)currentBidPrice,
                            DateTime = DateTime.UtcNow
                        };
                    }
                    else
                    {
                        return new ITradingService.TradeResult { IsSuccess = false, Message = "Invalid metal specified." };
                    }

                    userHolding.CashReserve += (int)totalRevenue; // Add revenue to cash
                    userHolding.LastUpdated = DateTime.UtcNow;

                    _context.TradeHistories.Add(tradeRecord);
                    _context.userHoldings.Update(userHolding); // Mark holdings as modified

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation($"User {userId} successfully sold {quantity} of {metal} for {totalRevenue}. New balance: {userHolding.CashReserve}");
                    return new ITradingService.TradeResult { IsSuccess = true, Message = "Sell trade successful.", TradeRecord = tradeRecord, UpdatedHoldings = userHolding };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, $"Error executing sell trade for user {userId}, metal {metal}, quantity {quantity}.");
                    return new ITradingService.TradeResult { IsSuccess = false, Message = $"An error occurred during the sell trade: {ex.Message}" };
                }
            }
        }


        public async Task<ITradingService.PlaceOrderResult> PlacePendingOrderAsync(
            int userId,
            string metal,
            string action,
            int quantity,
            decimal triggerPrice,
            OrderType orderType)
        {
            if (quantity <= 0)
            {
                return new ITradingService.PlaceOrderResult { IsSuccess = false, Message = "Quantity must be greater than 0." };
            }
            if (triggerPrice <= 0)
            {
                return new ITradingService.PlaceOrderResult { IsSuccess = false, Message = "Trigger price must be greater than 0." };
            }
            if (metal.ToLower() != "gold" && metal.ToLower() != "silver")
            {
                return new ITradingService.PlaceOrderResult { IsSuccess = false, Message = "Invalid metal specified." };
            }
            if (action.ToLower() != "buy" && action.ToLower() != "sell")
            {
                return new ITradingService.PlaceOrderResult { IsSuccess = false, Message = "Invalid action specified (must be 'buy' or 'sell')." };
            }

            try
            {
                var newOrder = new PendingOrder
                {
                    UserId = userId,
                    Metal = metal.ToLower(),
                    Action = action.ToLower(),
                    Quantity = quantity,
                    TriggerPrice = triggerPrice,
                    Type = orderType,
                    Status = OrderStatus.Pending,
                    PlacedAt = DateTime.UtcNow
                };

                _context.PendingOrders.Add(newOrder);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User {userId} placed a {orderType} {action} order for {quantity} of {metal} at {triggerPrice}. Order ID: {newOrder.OrderId}");
                return new ITradingService.PlaceOrderResult { IsSuccess = true, Message = "Order placed successfully.", PendingOrder = newOrder };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error placing pending order for user {userId}.");
                return new ITradingService.PlaceOrderResult { IsSuccess = false, Message = $"Failed to place order: {ex.Message}" };
            }
        }

        public async Task<IEnumerable<PendingOrder>> GetPendingOrdersAsync(int userId)
        {
            return await _context.PendingOrders
                                 .Where(po => po.UserId == userId && po.Status == OrderStatus.Pending) // Only pending orders
                                 .OrderByDescending(po => po.PlacedAt)
                                 .ToListAsync();
        }
    }
}
