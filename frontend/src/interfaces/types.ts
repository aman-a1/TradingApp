import { TradeType } from "./TradeTypes";

export interface TraderMadeQuote {
  base_currency: string;
  quote_currency: string; // e.g., "XAUUSD", "XAGUSD"
  bid: number;
  ask: number;
  mid: number;
}

export interface TraderMadeApiResponse {
  endpoint: string;
  quotes: TraderMadeQuote[];
  requested_time: string;
  timestamp: number; // Unix timestamp
}

export interface PortfolioItem {
  quantity: number; // Amount held (e.g., in 10gm units for gold, kg for silver)
  avgPrice: number; // Average purchase price per unit (e.g., INR/10gm for gold, INR/kg for silver)
}

export interface MetalPriceDetail {
  bid: number; // Price to sell gold
  ask: number; // Price to buy gold
  unit: string; // e.g., "INR/10gm"
  currency: string; // e.g., "INR"
}

export interface MetalPrices {
  gold: MetalPriceDetail;
  silver: MetalPriceDetail;
  lastUpdated: string; 
}

export enum MetalType {
  Gold = "gold",
  Silver = "silver",
}

export enum PriceCategory {
  Bid = "bid",
  Ask = "ask",
}

export interface Portfolio {
  cash: number;
  goldQuantity: PortfolioItem; // Quantity in 10gm units
  silverQuantity: PortfolioItem; // Quantity in kg units
}
export interface ActiveTradeFormState {
  metal: MetalType;
  tradeType: TradeType;
}

export interface User {
  id: number; // Corresponds to `Id` in C# User model
  username: string; // Corresponds to `Username` in C# User model
  email?: string; // Optional, as it's nullable in the backend (corresponds to `Email` in C#)
  createdAt: string; // Assuming DateTime from C# is serialized as an ISO string (corresponds to `CreatedAt` in C#)
}

/**
 * Interface representing a user's portfolio holdings.
 * This can be used to structure data fetched from the backend.
 */
export interface UserHoldings {
  userId: number; // Foreign key to User
  goldHolding: number;
  averageGoldPrice: number;
  silverHolding: number;
  averageSilverPrice: number;
  cashReserve: number;
  lastUpdated: string; // Assuming DateTime from C# is serialized as an ISO string
}


