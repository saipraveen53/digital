import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
import AnimatedRE, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useAuth } from '../context/AuthContext';

// 🔥 Firebase imports
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// 🔥 Google Sign-In Configure
GoogleSignin.configure({
  webClientId: '244036437664-1mpdpkua2p304d4tfk4ftfci93vfub4j.apps.googleusercontent.com',
  offlineAccess: true,
});

export default function Login() {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { height: screenHeight } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // 🔥 Forgot Password States (Firebase)
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const ballStyle1 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [0, -250]) }] }));
  const ballStyle2 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [120, -150]) }] }));
  const ballStyle3 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [-60, -420]) }] }));
  const ballStyle4 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [200, -100]) }] }));
  const ballStyle5 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [-150, -500]) }] }));
  const ballStyle6 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [300, 0]) }] }));

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    const result = await login(email.trim(), password);
    if (!result.success) setError(result.message);
  };

  // 🔥 Google Sign-In Handler (Native)
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      const googleIdToken = userInfo?.data?.idToken || userInfo?.idToken;

      if (googleIdToken) {
        const result = await loginWithGoogle();
        if (!result.success) setError(result.message);
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play services not available on this device.');
      } else {
        console.error('Google Sign-In Error:', error);
        setError("Native Google Sign-In failed.");
      }
    }
  };

  // 🔥 Firebase Forgot Password
  const handleForgotPassword = async () => {
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      await auth().sendPasswordResetEmail(forgotEmail.trim());
      setForgotSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      let message = 'Failed to send reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      Alert.alert('Error', message);
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setForgotModalVisible(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setForgotLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <View style={{ flex: 1, backgroundColor: '#FAF9F5' }}>
        <AnimatedRE.View style={[styles.blurredLiquidSphere1, ballStyle1]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere2, ballStyle2]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere3, ballStyle3]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere4, ballStyle4]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere5, ballStyle5]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere6, ballStyle6]} />

        <AnimatedRE.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1"
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          <View className="flex-1 justify-center items-center p-6 min-h-screen" style={{ zIndex: 3 }}>
            <View className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
              <View className="items-center mb-8">
                <View className="bg-teal-600 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                  <Text className="text-white text-2xl font-bold">WG</Text>
                </View>
                <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</Text>
                <Text className="text-slate-500 text-center">Sign in to track your wellbeing</Text>
              </View>

              {error ? (
                <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <Text className="text-red-600 text-sm flex-1">⚠️ {error}</Text>
                </View>
              ) : null}

              <View className="mb-4">
                <Text className="text-slate-700 font-semibold mb-2">Email Address</Text>
                <TextInput
                  className="w-full bg-slate-50 border p-4 rounded-xl text-slate-800 border-slate-200"
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-slate-700 font-semibold">Password</Text>
                  <Pressable onPress={() => setForgotModalVisible(true)}>
                    <Text className="text-teal-600 text-sm font-medium">Forgot Password?</Text>
                  </Pressable>
                </View>
                <View className="relative justify-center">
                  <TextInput
                    className="w-full bg-slate-50 border p-4 pr-12 rounded-xl text-slate-800 border-slate-200"
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 p-1">
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#64748b" />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className={`py-4 rounded-xl items-center mb-4 ${isLoading ? 'bg-teal-400' : 'bg-teal-600'}`}
              >
                <Text className="text-white font-bold text-lg">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </Pressable>

              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-slate-200" />
                <Text className="mx-4 text-slate-400 text-sm">OR</Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>

              {/* 🔥 Google Sign-In Button */}
              <Pressable
                onPress={handleGoogleLogin}
                disabled={isLoading}
                className="flex-row items-center justify-center border border-slate-200 py-3.5 rounded-xl bg-white mb-6 active:bg-slate-50"
              >
                <Text className="text-slate-700 font-bold text-base">Sign in with Google</Text>
              </Pressable>

              <View className="flex-row justify-center items-center gap-1">
                <Text className="text-slate-500">Don't have an account?</Text>
                <Link href="/register" asChild>
                  <Pressable><Text className="text-teal-600 font-bold">Create Account</Text></Pressable>
                </Link>
              </View>
            </View>
          </View>
        </AnimatedRE.ScrollView>
      </View>

      {/* 🔥 Forgot Password Modal - Firebase Version */}
      <Modal
        animationType="slide"
        transparent
        visible={forgotModalVisible}
        onRequestClose={closeForgotModal}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
          onPress={closeForgotModal}
        >
          <Pressable
            className="bg-white rounded-3xl p-6 w-full max-w-md mx-4"
            style={{ maxHeight: '90%' }}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity onPress={closeForgotModal} className="self-end p-2">
              <Feather name="x" size={24} color="#64748b" />
            </TouchableOpacity>

            {!forgotSuccess ? (
              <View>
                <View className="items-center mb-6">
                  <View className="bg-teal-600 w-14 h-14 rounded-2xl items-center justify-center mb-3">
                    <Feather name="mail" size={28} color="white" />
                  </View>
                  <Text className="text-2xl font-bold text-slate-900">Reset Password</Text>
                  <Text className="text-slate-500 text-center mt-1">
                    Enter your email and we'll send you a password reset link
                  </Text>
                </View>

                <View className="mb-6">
                  <Text className="text-slate-700 font-semibold mb-2">Email Address</Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800"
                    placeholder="Enter your email"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    editable={!forgotLoading}
                  />
                </View>

                <Pressable
                  onPress={handleForgotPassword}
                  disabled={forgotLoading}
                  className="bg-teal-600 py-4 rounded-xl items-center"
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Send Reset Link</Text>
                  )}
                </Pressable>

                <TouchableOpacity
                  onPress={closeForgotModal}
                  className="mt-4 items-center"
                >
                  <Text className="text-teal-600 font-semibold">← Back to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center py-6">
                <View className="bg-green-500 w-20 h-20 rounded-full items-center justify-center mb-4">
                  <Feather name="check" size={40} color="white" />
                </View>
                <Text className="text-2xl font-bold text-slate-900">Email Sent!</Text>
                <Text className="text-slate-500 text-center mt-2 mb-6">
                  We've sent a password reset link to {forgotEmail}. Please check your inbox.
                </Text>
                <Pressable
                  onPress={closeForgotModal}
                  className="bg-teal-600 py-4 rounded-xl w-full items-center"
                >
                  <Text className="text-white font-bold text-lg">Back to Login</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = {
  blurredLiquidSphere1: {
    position: 'absolute' as const,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E09643',
    opacity: 0.18,
    top: '5%',
    left: -80,
    ...Platform.select({ web: { filter: 'blur(75px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere2: {
    position: 'absolute' as const,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#336956',
    opacity: 0.14,
    bottom: '20%',
    right: -100,
    ...Platform.select({ web: { filter: 'blur(90px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere3: {
    position: 'absolute' as const,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1B4235',
    opacity: 0.15,
    top: '40%',
    left: '25%',
    ...Platform.select({ web: { filter: 'blur(70px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere4: {
    position: 'absolute' as const,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#E09643',
    opacity: 0.12,
    top: '25%',
    right: -50,
    ...Platform.select({ web: { filter: 'blur(80px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere5: {
    position: 'absolute' as const,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#336956',
    opacity: 0.14,
    bottom: '45%',
    left: -60,
    ...Platform.select({ web: { filter: 'blur(75px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere6: {
    position: 'absolute' as const,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1B4235',
    opacity: 0.10,
    bottom: '5%',
    left: '40%',
    ...Platform.select({ web: { filter: 'blur(85px)' } }),
    zIndex: 0,
  },
};