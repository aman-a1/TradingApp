import { UserHoldings } from "./types";

// --- Type Definitions for Service (mirroring backend DTOs/responses) ---
export interface TradeRequest {
  metal: 'gold' | 'silver';
  quantity: number;
  price: number; // Current ask/bid price from frontend (for market orders)
  action: 'buy' | 'sell'; // Explicitly added action for clarity in TradeForm logic

  // Optional fields for pending orders
  triggerPrice?: number; // Price at which the pending order should execute
  type?: 'Limit' | 'StopLoss'; // Order type: 'Limit' or 'StopLoss'
}

// New interfaces for Pending Orders
export type OrderStatus = 'Pending' | 'Executed' | 'Canceled' | 'Expired' | 'Failed';

/**
 * Interface representing a Pending Order as received from the backend.
 */
export interface PendingOrder {
  orderId: number;
  userId: number;
  metal: 'gold' | 'silver';
  action: 'buy' | 'sell';
  quantity: number;
  triggerPrice: number;
  type: OrderType;
  status: OrderStatus;
  placedAt: string; // ISO 8601 string
  executedAt?: string; // ISO 8601 string, nullable
  failureReason?: string; // nullable
}


// Response from a successful trade (mirrors backend's TradeResult)
export interface TradeResponse {
  message: string;
  trade: Trade;
  holdings: UserHoldings;
  order?: PendingOrder;
}


// Generic API error response structure (common for .NET Core validation errors)
export interface TradeApiErrorResponse {
  type: string;
  title: string;
  status: number;
  traceId: string;
  errors: {
    [key: string]: string[]; // Key is field name (e.g., "Quantity"), value is array of error messages
  };
}

export enum TradeType {
  Buy = "buy",
  Sell = "sell",
}

export enum OrderMode {
    Market = "market",
    Pending = "pending"
}

export enum OrderType {
    Limit = "Limit",
    StopLoss = "StopLoss"
}
export interface Trade {
  tradeId: number;
  userId: number; // Foreign key to User
  metal: "gold" | "silver"; // Enum type mapped to string
  action: "buy" | "sell"; // Enum type mapped to string
  quantity: number;
  price: number;
  dateTime: string;
  status: "executed" | "failed";
  reason?: string;
  // Assuming DateTime from C# is serialized as an ISO string
}