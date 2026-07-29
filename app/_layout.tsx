// app/_layout.tsx
import { Slot } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import "./globals.css";

// 🔥 Firebase imports
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Web Google OAuth
const GoogleOAuthProvider = Platform.OS === 'web'
  ? require('@react-oauth/google').GoogleOAuthProvider
  : ({ children }: any) => <>{children}</>;

// 🔥 Google Sign-In Configure (Android/iOS)
GoogleSignin.configure({
  webClientId: '244036437664-1mpdpkua2p304d4tfk4ftfci93vfub4j.apps.googleusercontent.com',
  offlineAccess: true,
});

function LoadingSpinner() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5DC' }}>
      <ActivityIndicator size="large" color="#E35336" />
      <Text style={{ marginTop: 12, color: '#4A231A', fontSize: 14 }}>Loading...</Text>
    </View>
  );
}

function RootLayoutContent() {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GoogleOAuthProvider clientId="244036437664-1mpdpkua2p304d4tfk4ftfci93vfub4j.apps.googleusercontent.com">
      <AuthProvider>
        <SubscriptionProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <RootLayoutContent />
              <Toast />
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </SubscriptionProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}