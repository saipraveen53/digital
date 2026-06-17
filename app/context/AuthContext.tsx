import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { rootApi } from '../utils/axiosInstance';

type UserRole = 'user' | 'admin';
type SubscriptionTier = 'free' | 'monthly' | 'yearly';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  subscription?: SubscriptionTier;
  isLoggedIn: boolean;
  token?: string;
}

interface JWTPayload {
  role: Array<{ authority: string }>;
  userId: string;
  sub: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extract user data from JWT token
const extractUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.log('Token expired');
      return null;
    }

    const authorities = decoded.role || [];
    const isAdmin = authorities.some(auth => auth.authority.includes('ADMIN'));
    const role: UserRole = isAdmin ? 'admin' : 'user';

    const emailParts = decoded.sub.split('@');
    const name = emailParts[0].split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');

    return {
      id: decoded.userId,
      email: decoded.sub,
      role: role,
      name: name,
      subscription: 'free',
      isLoggedIn: true,
      token: token,
    };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    checkExistingAuth();
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      const inAuthGroup = segments[0] === '(admin)' || segments[0] === '(user)';
      const inPublicGroup = segments[0] === '(public)';

      if (user && user.isLoggedIn && inPublicGroup) {
        if (user.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(user)/home');
        }
      } else if (!user && !inPublicGroup && !isInitializing) {
        router.replace('/(public)/login');
      }
    }
  }, [user, isInitializing, segments]);

  const checkExistingAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (token && userDataString) {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decoded.exp < currentTime) {
          console.log('Stored token expired');
          await AsyncStorage.multiRemove(['userToken', 'userData']);
          setUser(null);
        } else {
          const parsedUser: User = JSON.parse(userDataString);
          setUser({ ...parsedUser, isLoggedIn: true, token });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking existing auth:', error);
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
    } finally {
      setTimeout(() => {
        setIsInitializing(false);
      }, 100);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      const response = await rootApi.post<string>('/api/auth/login', { email, password });
      const token = response.data;

      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token received from server');
      }

      const userData = extractUserFromToken(token);
      if (!userData) {
        throw new Error('Failed to extract user data from token');
      }

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        subscription: userData.subscription,
      }));

      setUser(userData);
      setIsLoading(false);
      
      return { 
        success: true, 
        message: `Welcome back, ${userData.name}!` 
      };
    } catch (error: any) {
      setIsLoading(false);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Invalid credentials';
        
        switch (status) {
          case 401:
            return { success: false, message: 'Invalid email or password' };
          case 403:
            return { success: false, message: 'Account is disabled or not verified' };
          case 429:
            return { success: false, message: 'Too many attempts. Please try again later.' };
          default:
            return { success: false, message };
        }
      } else if (error.request) {
        return { 
          success: false, 
          message: 'Unable to connect to server. Please check your internet connection.' 
        };
      } else {
        return { 
          success: false, 
          message: error.message || 'An unexpected error occurred. Please try again.' 
        };
      }
    }
  };

  const logout = async () => {
    const confirmLogout = () => {
      return new Promise<boolean>((resolve) => {
        if (typeof window !== 'undefined' && window.confirm) {
          const result = window.confirm('Are you sure you want to logout?');
          resolve(result);
        } else {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Yes', onPress: () => resolve(true), style: 'destructive' },
            ],
            { cancelable: false }
          );
        }
      });
    };

    const shouldLogout = await confirmLogout();
    
    if (shouldLogout) {
      try {
        await AsyncStorage.multiRemove(['userToken', 'userData']);
        setUser(null);
        // Force immediate navigation to prevent admin layout from re-rendering with null user
        router.replace('/(public)/login');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isInitializing,
  };

  if (isInitializing) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}