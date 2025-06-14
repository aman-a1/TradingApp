// src/services/tradingService.ts

import axios from 'axios';
import { UserHoldings } from '../interfaces/types'; // Assuming you consolidated types here
import { TradeRequest, TradeResponse, Trade, TradeApiErrorResponse, PendingOrder } from '../interfaces/TradeTypes';

// Define your backend API base URL
const API_BASE_URL = 'http://localhost:5000/api'; // Ensure this matches your .NET backend's URL


/**
 * Service for handling trading operations (buy, sell, get holdings).
 */
const tradingService = {

  /**
   * Retrieves the authentication token from local storage.
   * @returns The JWT token string or null if not found.
   */
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  /**
   * Configures Axios with the Authorization header.
   * @returns An Axios instance with the bearer token.
   */
  getAuthenticatedAxiosInstance: () => {
    const token = tradingService.getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Executes a buy trade.
   * @param data - The trade request data (metal, quantity, price).
   * @returns A Promise that resolves with the trade response or rejects with an error.
   */
buy: async (data: TradeRequest): Promise<TradeResponse> => {
    try {
      const api = tradingService.getAuthenticatedAxiosInstance();
      // HIGHLIGHT: The `data` object now contains `triggerPrice` and `type` if it's a pending order
      const response = await api.post('/Trades/buy', data);
      return response.data as TradeResponse;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Unauthorized: Please log in again.');
        }
        const apiError = error.response.data as TradeApiErrorResponse;
        if (apiError.errors) {
          const errorMessages = Object.values(apiError.errors).flat().join('; ');
          throw new Error(`Buy operation failed: ${errorMessages}`);
        } else if (typeof error.response.data === 'string') {
          throw new Error(`Buy operation failed: ${error.response.data}`);
        } else {
          throw new Error(`Buy operation failed: ${apiError.title || error.response.statusText}`);
        }
      } else {
        throw new Error('An unexpected error occurred during buy operation.');
      }
    }
  },

  /**
   * Executes a sell trade.
   * @param data - The trade request data (metal, quantity, price).
   * @returns A Promise that resolves with the trade response or rejects with an error.
   */
 sell: async (data: TradeRequest): Promise<TradeResponse> => {
    try {
      const api = tradingService.getAuthenticatedAxiosInstance();
      // HIGHLIGHT: The `data` object now contains `triggerPrice` and `type` if it's a pending order
      const response = await api.post('/Trades/sell', data);
      return response.data as TradeResponse;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Unauthorized: Please log in again.');
        }
        const apiError = error.response.data as TradeApiErrorResponse;
        if (apiError.errors) {
          const errorMessages = Object.values(apiError.errors).flat().join('; ');
          throw new Error(`Sell operation failed: ${errorMessages}`);
        } else if (typeof error.response.data === 'string') {
          throw new Error(`Sell operation failed: ${error.response.data}`);
        } else {
          throw new Error(`Sell operation failed: ${apiError.title || error.response.statusText}`);
        }
      } else {
        throw new Error('An unexpected error occurred during sell operation.');
      }
    }
  },

  /**
   * Fetches the authenticated user's current holdings.
   * @returns A Promise that resolves with the user's holdings or rejects with an error.
   */
  getHoldings: async (): Promise<UserHoldings> => {
    try {
      const api = tradingService.getAuthenticatedAxiosInstance();
      const response = await api.get('/Trades/holdings');
      return response.data as UserHoldings;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Unauthorized: Please log in again.');
        } else if (error.response.status === 404) {
          throw new Error('User holdings not found. This might be a new user.');
        }
        const apiError = error.response.data as TradeApiErrorResponse;
        if (typeof error.response.data === 'string') {
          throw new Error(`Failed to fetch holdings: ${error.response.data}`);
        } else if (apiError.title) {
          throw new Error(`Failed to fetch holdings: ${apiError.title}`);
        } else {
          throw new Error(`Failed to fetch holdings: ${error.response.statusText}`);
        }
      } else {
        throw new Error('An unexpected error occurred while fetching holdings.');
      }
    }
  },

    getHistory: async (): Promise<Trade[]> => {
    try {
      const api = tradingService.getAuthenticatedAxiosInstance();
      const response = await api.get('/Trades/tradeHistory');
      return response.data as Trade[];
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Unauthorized: Please log in again.');
        } else if (error.response.status === 404) {
          throw new Error('History not found. This might be a new user.');
        }
        const apiError = error.response.data as TradeApiErrorResponse;
        if (typeof error.response.data === 'string') {
          throw new Error(`Failed to fetch History: ${error.response.data}`);
        } else if (apiError.title) {
          throw new Error(`Failed to fetch History: ${apiError.title}`);
        } else {
          throw new Error(`Failed to fetch history: ${error.response.statusText}`);
        }
      } else {
        throw new Error('An unexpected error occurred while fetching history.');
      }
    }
  },
   /**
   * Fetches the authenticated user's pending orders.
   * @returns A Promise that resolves with an array of PendingOrder or rejects with an error.
   */
  getPendingOrders: async (): Promise<PendingOrder[]> => {
    try {
      const api = tradingService.getAuthenticatedAxiosInstance();
      const response = await api.get('/Trades/pending-orders');
      console.log(response);
      return response.data as PendingOrder[];
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Unauthorized: Please log in again.');
        }
        const apiError = error.response.data as TradeApiErrorResponse;
        if (typeof error.response.data === 'string') {
          throw new Error(`Failed to fetch pending orders: ${error.response.data}`);
        } else if (apiError.title) {
          throw new Error(`Failed to fetch pending orders: ${apiError.title}`);
        } else {
          throw new Error(`Failed to fetch pending orders: ${error.response.statusText}`);
        }
      } else {
        throw new Error('An unexpected error occurred while fetching pending orders.');
      }
    }
  },
};

export default tradingService;
