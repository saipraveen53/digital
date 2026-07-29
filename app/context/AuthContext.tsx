// app/context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type UserRole = 'user' | 'admin';

interface User {
  id: string;
  email: string | null;
  role: UserRole;
  name: string | null;
  isLoggedIn: boolean;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  loginWithGoogleToken: (token: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 🔥 Listen to auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: 'user', // Default role, you can add admin logic
          isLoggedIn: true,
          photoURL: firebaseUser.photoURL,
        };
        setUser(userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      } else {
        // User is signed out
        setUser(null);
        await AsyncStorage.removeItem('userData');
      }
      setIsInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Check existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.isLoggedIn) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  // 🔥 Login with Email & Password (Firebase)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || email.split('@')[0],
        role: 'user',
        isLoggedIn: true,
        photoURL: firebaseUser.photoURL,
      };

      setUser(userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Navigate based on role
      setTimeout(() => {
        if (userData.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(user)/home');
        }
      }, 100);

      return { success: true, message: `Welcome back, ${userData.name}!` };
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Login with Google (Native)
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Check if Play Services are available (Android)
      await GoogleSignin.hasPlayServices();

      // Get the user's ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseUser = userCredential.user;

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: 'user',
        isLoggedIn: true,
        photoURL: firebaseUser.photoURL,
      };

      setUser(userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setTimeout(() => {
        if (userData.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(user)/home');
        }
      }, 100);

      return { success: true, message: `Welcome, ${userData.name}!` };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let message = 'Google Sign-In failed.';
      if (error.code === 'SIGN_IN_CANCELLED') {
        message = 'Sign-in cancelled.';
      } else if (error.code === 'IN_PROGRESS') {
        message = 'Sign-in already in progress.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        message = 'Google Play Services not available.';
      }
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Login with Google Token (for Web OAuth flow)
  const loginWithGoogleToken = async (token: string) => {
    setIsLoading(true);
    try {
      // Create credential from token
      const googleCredential = auth.GoogleAuthProvider.credential(token);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseUser = userCredential.user;

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: 'user',
        isLoggedIn: true,
        photoURL: firebaseUser.photoURL,
      };

      setUser(userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setTimeout(() => {
        if (userData.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(user)/home');
        }
      }, 100);

      return { success: true, message: `Welcome, ${userData.name}!` };
    } catch (error: any) {
      console.error('Google Token Login Error:', error);
      return { success: false, message: 'Google login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Logout
  const logout = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      setUser(null);
      await AsyncStorage.removeItem('userData');
      router.replace('/(public)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loginWithGoogle,
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