using Microsoft.AspNetCore.Authorization; // For [Authorize] attribute
using Microsoft.AspNetCore.Mvc;
using TradingBackend.Services;
using System.Security.Claims; // For accessing user ID from token
using System.Threading.Tasks;
using TradingBackend.Models;
using TradingBackend.Models.Enums;

namespace TradingBackend.Controllers
{
    [Authorize] // HIGHLIGHT: Ensures that only authenticated users can access these endpoints
    [Route("api/[controller]")]
    [ApiController]
    public class TradesController : ControllerBase
    {
        private readonly ITradingService _tradingService;
        private readonly ILogger<TradesController> _logger; // For logging

        public TradesController(ITradingService tradingService, ILogger<TradesController> logger)
        {
            _tradingService = tradingService;
            _logger = logger;
        }

        // Helper to get UserId from JWT token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                _logger.LogWarning("UserId claim not found or invalid in token.");
                throw new UnauthorizedAccessException("User ID not found in token.");
            }
            return userId;
        }

        // POST: api/Trades/buy
        /// <summary>
        /// Initiates a buy trade for a specified metal and quantity.
        /// </summary>
        /// <param name="request">Contains metal, quantity, and current ask price.</param>
        [HttpPost("buy")]
        public async Task<IActionResult> Buy([FromBody] TradeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userId = GetUserId();

                // HIGHLIGHT START: Logic to differentiate between Market Order and Pending Order
                if (request.TriggerPrice.HasValue && !string.IsNullOrWhiteSpace(request.Type))
                {
                    // This is a request to place a pending order
                    if (!Enum.TryParse(request.Type, true, out OrderType orderTypeEnum))
                    {
                        return BadRequest("Invalid order type specified. Must be 'Limit' or 'StopLoss'.");
                    }

                    var placeOrderResult = await _tradingService.PlacePendingOrderAsync(
                        userId,
                        request.Metal,
                        "buy", // Action for the pending order
                        request.Quantity,
                        request.TriggerPrice.Value,
                        orderTypeEnum
                    );

                    if (placeOrderResult.IsSuccess)
                    {
                        return Ok(new { Message = placeOrderResult.Message, Order = placeOrderResult.PendingOrder });
                    }
                    return BadRequest(placeOrderResult.Message);
                }
                else
                {
                    // This is a market buy order
                    var tradeResult = await _tradingService.ExecuteBuyTradeAsync(
                        userId,
                        request.Metal,
                        request.Quantity,
                        request.Price // Price for market order
                    );

                    if (tradeResult.IsSuccess)
                    {
                        return Ok(new { Message = tradeResult.Message, Trade = tradeResult.TradeRecord, Holdings = tradeResult.UpdatedHoldings });
                    }
                    return BadRequest(tradeResult.Message);
                }
                // HIGHLIGHT END
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Buy action.");
                return StatusCode(500, "An internal server error occurred during buy operation.");
            }
        }

        // POST: api/Trades/sell
        /// <summary>
        /// Initiates a sell trade for a specified metal and quantity.
        /// </summary>
        /// <param name="request">Contains metal, quantity, and current bid price.</param>
        [HttpPost("sell")]
        public async Task<IActionResult> Sell([FromBody] TradeRequest request)
        {
           
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                try
                {
                    var userId = GetUserId();

                    if (request.TriggerPrice.HasValue && !string.IsNullOrWhiteSpace(request.Type))
                    {
                        // This is a request to place a pending order
                        if (!Enum.TryParse(request.Type, true, out OrderType orderTypeEnum))
                        {
                            return BadRequest("Invalid order type specified. Must be 'Limit' or 'StopLoss'.");
                        }

                        var placeOrderResult = await _tradingService.PlacePendingOrderAsync(
                            userId,
                            request.Metal,
                            "sell", // Action for the pending order
                            request.Quantity,
                            request.TriggerPrice.Value,
                            orderTypeEnum
                        );

                        if (placeOrderResult.IsSuccess)
                        {
                            return Ok(new { Message = placeOrderResult.Message, Order = placeOrderResult.PendingOrder });
                        }
                        return BadRequest(placeOrderResult.Message);
                    }
                    else
                    {
                        // This is a market sell order
                        var tradeResult = await _tradingService.ExecuteSellTradeAsync(
                            userId,
                            request.Metal,
                            request.Quantity,
                            request.Price // Price for market order
                        );

                        if (tradeResult.IsSuccess)
                        {
                            return Ok(new { Message = tradeResult.Message, Trade = tradeResult.TradeRecord, Holdings = tradeResult.UpdatedHoldings });
                        }
                        return BadRequest(tradeResult.Message);
                    }
                }
                catch (UnauthorizedAccessException ex)
                {
                    return Unauthorized(ex.Message);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Sell action.");
                    return StatusCode(500, "An internal server error occurred during sell operation.");
                }
        }

                // GET: api/Trades/holdings
                /// <summary>
                /// Retrieves the current holdings for the authenticated user.
                /// </summary>
                [HttpGet("holdings")]
        public async Task<IActionResult> GetHoldings()
        {
            try
            {
                var userId = GetUserId();
                var holdings = await _tradingService.GetUserHoldingsAsync(userId);

                if (holdings == null)
                {
                    return NotFound("User holdings not found.");
                }
                return Ok(holdings);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user holdings.");
                return StatusCode(500, "An internal server error occurred while retrieving holdings.");
            }
        }

        // GET: api/Trades/holdings
        /// <summary>
        /// Retrieves the current holdings for the authenticated user.
        /// </summary>
        [HttpGet("tradeHistory")]
        public async Task<IActionResult> GetTradeHistory()
        {
            try
            {
                var userId = GetUserId();
                var history = await _tradingService.GetTradeHistoryAsync(userId);

                if (history == null)
                {
                    return NotFound("No History Trades Found");
                }
                return Ok(history);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user holdings.");
                return StatusCode(500, "An internal server error occurred while retrieving holdings.");
            }
        }

        [HttpGet("pending-orders")]
        public async Task<IActionResult> GetPendingOrders()
        {
            try
            {
                var userId = GetUserId();
                var pendingOrders = await _tradingService.GetPendingOrdersAsync(userId);
                return Ok(pendingOrders);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving pending orders: {ex.Message}");
                return StatusCode(500, "An internal server error occurred while retrieving pending orders.");
            }
        }
    }


}
