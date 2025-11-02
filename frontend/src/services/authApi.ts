import api from '../config/axios';

export interface User {
  _id: string;
  username: string;
  email: string;
  isOnline?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.success && response.data.data) {
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Registration failed',
    };
  }
};

/**
 * Sign in an existing user
 * @route POST /api/auth/signin
 */
export const signin = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/signin', data);
    if (response.data.success && response.data.data) {
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Sign in failed',
    };
  }
};

/**
 * Sign out the current user
 */
export const signout = async (): Promise<void> => {
  // Clear local storage
  localStorage.removeItem('user');
  // You can add a logout API call here if your backend supports it
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};
