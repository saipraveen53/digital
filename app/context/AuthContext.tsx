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
  loginWithGoogleToken: (token: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) return null;

    const authorities = decoded.role || [];
    const isAdmin = authorities.some(auth => auth.authority.includes('ADMIN'));
    const role: UserRole = isAdmin ? 'admin' : 'user';

    const emailParts = decoded.sub.split('@');
    const name = emailParts[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

    return { id: decoded.userId, email: decoded.sub, role, name, isLoggedIn: true, token };
  } catch (error) {
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
      const inPublicGroup = segments[0] === '(public)';
      if (user && user.isLoggedIn && inPublicGroup) {
        if (user.role === 'admin') router.replace('/(admin)/dashboard');
        else router.replace('/(user)/home');
      } else if (!user && !inPublicGroup) {
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
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
          await AsyncStorage.multiRemove(['userToken', 'userData']);
          setUser(null);
        } else {
          setUser({ ...JSON.parse(userDataString), isLoggedIn: true, token });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAuthSuccess = async (token: string, userData: User) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
    }));
    setUser(userData);
    setIsLoading(false);
    setTimeout(() => {
      if (userData.role === 'admin') router.replace('/(admin)/dashboard');
      else router.replace('/(user)/home');
    }, 100);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await rootApi.post<string>('/api/auth/login', { email, password });
      const token = response.data;
      const userData = extractUserFromToken(token);
      if (!userData) throw new Error('Invalid token');
      
      await handleAuthSuccess(token, userData);
      return { success: true, message: `Welcome back, ${userData.name}!` };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

const loginWithGoogleToken = async (token: string) => {
  setIsLoading(true);
  try {
    const userData = extractUserFromToken(token);
    if (!userData) throw new Error('Invalid OAuth Token');
    
    await handleAuthSuccess(token, userData);
    
    return { success: true, message: `Welcome, ${userData.name}!` };
  } catch (error: any) {
    setIsLoading(false);
    return { success: false, message: error.message || 'Google Login Failed' };
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
  loginWithGoogleToken,
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