// src/services/authService.ts

import axios from 'axios';
import { User } from '../interfaces/types'; // HIGHLIGHT: NEW IMPORT for the User interface

// Define your backend API base URL.
const API_BASE_URL = 'http://localhost:5000/api';

// --- Type Definitions for Service ---

// Request payload for registration
interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

// Request payload for login
interface LoginRequest {
  username: string;
  password: string;
}

// HIGHLIGHT: UPDATED INTERFACE for LoginResponse to include the full User object
interface LoginResponse {
  token: string;
  user: User; // Now includes the full User object
}

// Generic API error response structure
interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  traceId: string;
  errors: {
    [key: string]: string[];
  };
}


/**
 * Service for handling user authentication (registration and login).
 */
const authService = {

  /**
   * Registers a new user with the backend.
   */
  register: async (data: RegisterRequest): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Account/register`, data);
      return response.data.message || 'Registration successful!';
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiErrorResponse;
        if (apiError.errors) {
          const errorMessages = Object.values(apiError.errors).flat().join('; ');
          throw new Error(`Registration failed: ${errorMessages}`);
        } else if (typeof error.response.data === 'string') {
          throw new Error(`Registration failed: ${error.response.data}`);
        } else {
          throw new Error(`Registration failed: ${apiError.title || error.response.statusText}`);
        }
      } else {
        throw new Error('An unexpected error occurred during registration.');
      }
    }
  },

  /**
   * Logs in a user and retrieves an authentication token and user data.
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Account/login`, data);
      // Ensure the response matches the new LoginResponse interface
      if (response.data && response.data.token && response.data.user) {
        // HIGHLIGHT: Now returning the full user object from the response
        return {
          token: response.data.token,
          user: response.data.user, // Return the full user object
        };
      }
      // HIGHLIGHT: Updated error message for clarity on invalid response structure
      throw new Error('Login failed: Invalid response structure from server.');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiErrorResponse;
        if (typeof error.response.data === 'string') {
          throw new Error(`Login failed: ${error.response.data}`);
        } else if (apiError.title) {
          throw new Error(`Login failed: ${apiError.title}`);
        } else {
          throw new Error(`Login failed: ${error.response.statusText}`);
        }
      } else {
        throw new Error('An unexpected error occurred during login.');
      }
    }
  },
};

export default authService;
