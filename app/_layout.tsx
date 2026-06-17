// app/_layout.tsx
import { Slot } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import "./globals.css";

// Simple loading component inline to avoid circular imports
function LoadingSpinner() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5DC' }}>
      <ActivityIndicator size="large" color="#E35336" />
      <Text style={{ marginTop: 12, color: '#4A231A', fontSize: 14 }}>Loading...</Text>
    </View>
  );
}

function RootLayoutContent() {
  const { user, isLoading } = useAuth();

  // Show loading while auth is initializing
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If user is not logged in, show login screen
  // If user is logged in, show the app
  return <Slot />;
}

export default function RootLayout() {
  return (
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
  );
}