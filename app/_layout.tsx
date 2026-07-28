// app/_layout.tsx
import { Slot } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
//import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import "./globals.css";

// Loading component
function LoadingSpinner() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5DC' }}>
      <ActivityIndicator size="large" color="#E35336" />
      <Text style={{ marginTop: 12, color: '#4A231A', fontSize: 14 }}>Loading...</Text>
    </View>
  );
}
const GoogleOAuthProvider =
  Platform.OS === 'web'
    ? require('@react-oauth/google').GoogleOAuthProvider
    : ({ children }: any) => <>{children}</>;
function RootLayoutContent() {
  const { isInitializing } = useAuth(); 

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
      <GoogleOAuthProvider clientId="341709776135-2gc8sr7belb8if4d19sse44dkvlr9rh7.apps.googleusercontent.com">
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