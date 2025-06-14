using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradingBackend.Models.Enums
{
    // HIGHLIGHT: Defines the type of order
    public enum OrderType
    {
        Limit,    // Buy below a certain price or Sell above a certain price
        StopLoss  // Sell if price drops below a certain level
    }

    // HIGHLIGHT: Defines the current status of the order
    public enum OrderStatus
    {
        Pending,   // Order placed, waiting for condition to be met
        Executed,  // Order successfully bought/sold
        Canceled,  // Order manually canceled by user or admin
        Expired,   // Order expired if a time limit is set (optional, but good to have)
        Failed     // Order failed to execute (e.g., insufficient funds/holdings at execution time)
    }
}
