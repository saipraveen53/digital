import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    
    const result = await login(email.trim(), password);
    
    if (result.success) {
      // The redirect will be handled by the auth state change
      // No need to manually navigate here
    } else {
      setError(result.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 bg-slate-50"
      >
        <View className="flex-1 justify-center items-center p-6 min-h-screen">
          <View className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
            {/* Logo/Header */}
            <View className="items-center mb-8">
              <View className="bg-teal-600 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                <Text className="text-white text-2xl font-bold">ET</Text>
              </View>
              <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</Text>
              <Text className="text-slate-500 text-center">
                Sign in to track your energy and wellbeing
              </Text>
            </View>
            
            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <View className="flex-row items-center gap-2">
                  <Text className="text-red-600 text-lg">⚠️</Text>
                  <Text className="text-red-600 text-sm flex-1">{error}</Text>
                </View>
              </View>
            ) : null}

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2">Email Address</Text>
              <TextInput 
                className={`w-full bg-slate-50 border p-4 rounded-xl text-slate-800 ${
                  error && !email.trim() ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-700 font-semibold">Password</Text>
                <Pressable>
                  <Text className="text-teal-600 text-sm font-medium">Forgot Password?</Text>
                </Pressable>
              </View>
              <TextInput 
                className={`w-full bg-slate-50 border p-4 rounded-xl text-slate-800 ${
                  error && !password.trim() ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                editable={!isLoading}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />
            </View>

            {/* Login Button */}
            <Pressable 
              onPress={handleLogin}
              disabled={isLoading}
              className={`py-4 rounded-xl items-center mb-6 ${
                isLoading 
                  ? 'bg-teal-400' 
                  : 'bg-teal-600 active:bg-teal-700'
              }`}
              style={({ pressed }) => [
                pressed && !isLoading && { opacity: 0.9 }
              ]}
            >
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold text-lg">Signing in...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg">Sign In</Text>
              )}
            </Pressable>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center gap-1">
              <Text className="text-slate-500">Don't have an account?</Text>
            <Link href="/register" asChild>
               <Pressable>
                 <Text className="text-teal-600 font-bold">Create Account</Text>
               </Pressable>
             </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}