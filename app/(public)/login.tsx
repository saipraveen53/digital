import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
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
import { rootApi } from '../utils/axiosInstance';

// NATIVE GOOGLE SIGN-IN IMPORTS
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// GOOGLE CONFIGURATION (App load ayyaka okkasari run aithe chalu)
GoogleSignin.configure({
  // MEE GOOGLE CLOUD CONSOLE NUNDI "WEB CLIENT ID" IKKADA PETTALI
  webClientId: '341709776135-2gc8sr7belb8if4d19sse44dkvlr9rh7.apps.googleusercontent.com',
  offlineAccess: true,
});

export default function Login() {
  const { login, loginWithGoogleToken, isLoading } = useAuth();
  const { width, height: screenHeight } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password States
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS'>('EMAIL');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpArray, setForgotOtpArray] = useState<string[]>(["", "", "", "", "", ""]);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const otpRefs = useRef<Array<TextInput | null>>([]);

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

  // NATIVE GOOGLE SIGN-IN HANDLER
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
  
      // 🔥 IKKADA MARCHU:
      // Nuvvu sign in avvadaniki mundu, okasari GoogleSignin.signOut() 
      // call chesi, malli signIn() cheste Google pakka account picker chupistundi.
      // Idhi prathi saari user ki kotha account select chesukune option istundi.
      
      await GoogleSignin.signOut(); // Iddhi previous session ni clear chesthundi
      
      const userInfo = await GoogleSignin.signIn();
      
      const googleIdToken = userInfo?.data?.idToken || userInfo?.idToken;
  
      if (googleIdToken) {
        console.log("Got Google ID Token Successfully!");
        await loginWithGoogleToken(googleIdToken); 
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

  const handleSendForgotOtp = async () => {
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      await rootApi.post('/api/auth/forget-Password', null, {
        params: { email: forgotEmail.trim() },
      });
      setForgotStep('OTP');
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotOtpChange = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (!cleanedText) {
      const newOtp = [...forgotOtpArray];
      newOtp[index] = '';
      setForgotOtpArray(newOtp);
      return;
    }
    if (cleanedText.length > 1) {
      const pastedDigits = cleanedText.slice(0, 6).split('');
      const newOtp = [...forgotOtpArray];
      pastedDigits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setForgotOtpArray(newOtp);
      const targetIndex = Math.min(pastedDigits.length - 1, 5);
      otpRefs.current[targetIndex]?.focus();
      return;
    }
    const newOtp = [...forgotOtpArray];
    newOtp[index] = cleanedText;
    setForgotOtpArray(newOtp);
    if (index < 5 && cleanedText) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !forgotOtpArray[index] && index > 0) {
      const newOtp = [...forgotOtpArray];
      newOtp[index - 1] = '';
      setForgotOtpArray(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotPasteClipboard = async () => {
    const content = await Clipboard.getStringAsync();
    const cleaned = content.replace(/[^0-9]/g, '').slice(0, 6);
    if (cleaned.length === 6) {
      setForgotOtpArray(cleaned.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyForgotOtp = async () => {
    const fullOtp = forgotOtpArray.join('');
    if (fullOtp.length < 6) {
      setForgotError('Please enter the complete 6-digit OTP');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      await rootApi.post('/api/auth/verify-otp', { email: forgotEmail.trim(), otp: fullOtp });
      setForgotStep('NEW_PASSWORD');
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotNewPassword.trim() || forgotNewPassword.length < 8) {
      setForgotError('Password must be at least 8 characters');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(forgotNewPassword)) {
      setForgotError('Password must contain at least 1 uppercase, 1 lowercase, and 1 digit');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      await rootApi.post('/api/auth/reset-Password', { email: forgotEmail.trim(), newPassword: forgotNewPassword });
      setForgotStep('SUCCESS');
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setForgotModalVisible(false);
    setForgotStep('EMAIL');
    setForgotEmail('');
    setForgotOtpArray(["", "", "", "", "", ""]);
    setForgotNewPassword('');
    setForgotError('');
    setForgotLoading(false);
  };

  const renderOtpInputs = () => (
    <View className="flex-row justify-between items-center w-full my-4">
      {forgotOtpArray.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (otpRefs.current[index] = ref)}
          style={{
            width: '14%',
            height: 50,
            backgroundColor: '#F8FAFC',
            borderWidth: 1.5,
            borderColor: digit ? '#0d9488' : '#CBD5E1',
            borderRadius: 16,
            fontSize: 24,
            fontWeight: '700',
            color: '#1E293B',
            textAlign: 'center',
            padding: 0,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleForgotOtpChange(text, index)}
          onKeyPress={(e) => handleForgotOtpKeyPress(e, index)}
          placeholder="•"
          placeholderTextColor="#94A3B8"
          editable={!forgotLoading}
          selectTextOnFocus
        />
      ))}
    </View>
  );

  return (
   <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <View style={{ flex: 1, backgroundColor: '#FAF9F5' }}>
        <AnimatedRE.View style={[styles.blurredLiquidSphere1, ballStyle1]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere2, ballStyle2]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere3, ballStyle3]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere4, ballStyle4]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere5, ballStyle5]} />
        <AnimatedRE.View style={[styles.blurredLiquidSphere6, ballStyle6]} />

        <AnimatedRE.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={{ flexGrow: 1 }} className="flex-1" showsVerticalScrollIndicator={Platform.OS === 'web'}>
          <View className="flex-1 justify-center items-center p-6 min-h-screen" style={{ zIndex: 3 }}>
            <View className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
              <View className="items-center mb-8">
                <View className="bg-teal-600 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                  <Text className="text-white text-2xl font-bold">ET</Text>
                </View>
                <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</Text>
                <Text className="text-slate-500 text-center">Sign in to track your energy and wellbeing</Text>
              </View>

              {error ? (
                <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <Text className="text-red-600 text-sm flex-1">⚠️ {error}</Text>
                </View>
              ) : null}

              <View className="mb-4">
                <Text className="text-slate-700 font-semibold mb-2">Email Address</Text>
                <TextInput className="w-full bg-slate-50 border p-4 rounded-xl text-slate-800 border-slate-200" placeholder="Enter your email" autoCapitalize="none" value={email} onChangeText={setEmail} />
              </View>

              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-slate-700 font-semibold">Password</Text>
                  <Pressable onPress={() => setForgotModalVisible(true)}>
                    <Text className="text-teal-600 text-sm font-medium">Forgot Password?</Text>
                  </Pressable>
                </View>
                <View className="relative justify-center">
                  <TextInput className="w-full bg-slate-50 border p-4 pr-12 rounded-xl text-slate-800 border-slate-200" placeholder="Enter your password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                  <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 p-1">
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#64748b" />
                  </Pressable>
                </View>
              </View>

              <Pressable onPress={handleLogin} disabled={isLoading} className={`py-4 rounded-xl items-center mb-4 ${isLoading ? 'bg-teal-400' : 'bg-teal-600'}`}>
                <Text className="text-white font-bold text-lg">{isLoading ? "Signing in..." : "Sign In"}</Text>
              </Pressable>

              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-slate-200" />
                <Text className="mx-4 text-slate-400 text-sm">OR</Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>

              {/* NATIVE GOOGLE LOGIN BUTTON */}
              <Pressable 
                onPress={handleGoogleLogin}
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

      {/* Forgot Password Modal */}
      <Modal animationType="slide" transparent visible={forgotModalVisible} onRequestClose={closeForgotModal}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }} onPress={closeForgotModal}>
          <Pressable className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" style={{ maxHeight: '90%' }} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity onPress={closeForgotModal} className="self-end p-2">
              <Feather name="x" size={24} color="#64748b" />
            </TouchableOpacity>

            {forgotStep === 'EMAIL' && (
              <View>
                <View className="items-center mb-6">
                  <View className="bg-teal-600 w-14 h-14 rounded-2xl items-center justify-center mb-3">
                    <Feather name="mail" size={28} color="white" />
                  </View>
                  <Text className="text-2xl font-bold text-slate-900">Reset Password</Text>
                  <Text className="text-slate-500 text-center mt-1">Enter your email to receive a verification code</Text>
                </View>
                {forgotError ? (
                  <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <Text className="text-red-600 text-sm">{forgotError}</Text>
                  </View>
                ) : null}
                <View className="mb-6">
                  <Text className="text-slate-700 font-semibold mb-2">Email Address</Text>
                  <TextInput className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800" placeholder="Enter your email" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={forgotEmail} onChangeText={setForgotEmail} editable={!forgotLoading} />
                </View>
                <Pressable onPress={handleSendForgotOtp} disabled={forgotLoading} className="bg-teal-600 py-4 rounded-xl items-center">
                  {forgotLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold text-lg">Send Verification Code</Text>}
                </Pressable>
              </View>
            )}

            {forgotStep === 'OTP' && (
              <View>
                <View className="items-center mb-6">
                  <View className="bg-teal-600 w-14 h-14 rounded-2xl items-center justify-center mb-3">
                    <Feather name="shield" size={28} color="white" />
                  </View>
                  <Text className="text-2xl font-bold text-slate-900">Verify OTP</Text>
                  <Text className="text-slate-500 text-center mt-1">Enter the 6-digit code sent to {forgotEmail}</Text>
                </View>
                {forgotError ? (
                  <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <Text className="text-red-600 text-sm">{forgotError}</Text>
                  </View>
                ) : null}
                {renderOtpInputs()}
                <TouchableOpacity onPress={handleForgotPasteClipboard} className="flex-row items-center justify-center my-2">
                  <Feather name="clipboard" size={14} color="#0d9488" />
                  <Text className="text-teal-600 text-sm font-bold ml-1">Paste from clipboard</Text>
                </TouchableOpacity>
                <Pressable onPress={handleVerifyForgotOtp} disabled={forgotLoading} className="bg-teal-600 py-4 rounded-xl items-center mt-4">
                  {forgotLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold text-lg">Verify OTP</Text>}
                </Pressable>
                <TouchableOpacity onPress={() => setForgotStep('EMAIL')} className="mt-4 items-center">
                  <Text className="text-teal-600 font-semibold">← Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {forgotStep === 'NEW_PASSWORD' && (
              <View>
                <View className="items-center mb-6">
                  <View className="bg-teal-600 w-14 h-14 rounded-2xl items-center justify-center mb-3">
                    <Feather name="lock" size={28} color="white" />
                  </View>
                  <Text className="text-2xl font-bold text-slate-900">New Password</Text>
                  <Text className="text-slate-500 text-center mt-1">Enter your new password for {forgotEmail}</Text>
                </View>
                {forgotError ? (
                  <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <Text className="text-red-600 text-sm">{forgotError}</Text>
                  </View>
                ) : null}
                <View className="mb-6 relative">
                  <Text className="text-slate-700 font-semibold mb-2">New Password</Text>
                  <TextInput className="w-full bg-slate-50 border border-slate-200 p-4 pr-12 rounded-xl text-slate-800" placeholder="Enter new password" placeholderTextColor="#94a3b8" secureTextEntry={!forgotShowPassword} value={forgotNewPassword} onChangeText={setForgotNewPassword} editable={!forgotLoading} />
                  <Pressable onPress={() => setForgotShowPassword(!forgotShowPassword)} className="absolute right-4 top-12">
                    <Feather name={forgotShowPassword ? "eye" : "eye-off"} size={20} color="#64748b" />
                  </Pressable>
                </View>
                <Pressable onPress={handleResetPassword} disabled={forgotLoading} className="bg-teal-600 py-4 rounded-xl items-center">
                  {forgotLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold text-lg">Reset Password</Text>}
                </Pressable>
              </View>
            )}

            {forgotStep === 'SUCCESS' && (
              <View className="items-center py-6">
                <View className="bg-green-500 w-20 h-20 rounded-full items-center justify-center mb-4">
                  <Feather name="check" size={40} color="white" />
                </View>
                <Text className="text-2xl font-bold text-slate-900">Password Reset!</Text>
                <Text className="text-slate-500 text-center mt-2 mb-6">Your password has been successfully updated. You can now log in with your new password.</Text>
                <Pressable onPress={closeForgotModal} className="bg-teal-600 py-4 rounded-xl w-full items-center">
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
  blurredLiquidSphere1: { position: 'absolute' as const, width: 260, height: 260, borderRadius: 130, backgroundColor: '#E09643', opacity: 0.18, top: '5%', left: -80, ...Platform.select({ web: { filter: 'blur(75px)' } }), zIndex: 0 },
  blurredLiquidSphere2: { position: 'absolute' as const, width: 320, height: 320, borderRadius: 160, backgroundColor: '#336956', opacity: 0.14, bottom: '20%', right: -100, ...Platform.select({ web: { filter: 'blur(90px)' } }), zIndex: 0 },
  blurredLiquidSphere3: { position: 'absolute' as const, width: 200, height: 200, borderRadius: 100, backgroundColor: '#1B4235', opacity: 0.15, top: '40%', left: '25%', ...Platform.select({ web: { filter: 'blur(70px)' } }), zIndex: 0 },
  blurredLiquidSphere4: { position: 'absolute' as const, width: 240, height: 240, borderRadius: 120, backgroundColor: '#E09643', opacity: 0.12, top: '25%', right: -50, ...Platform.select({ web: { filter: 'blur(80px)' } }), zIndex: 0 },
  blurredLiquidSphere5: { position: 'absolute' as const, width: 210, height: 210, borderRadius: 105, backgroundColor: '#336956', opacity: 0.14, bottom: '45%', left: -60, ...Platform.select({ web: { filter: 'blur(75px)' } }), zIndex: 0 },
  blurredLiquidSphere6: { position: 'absolute' as const, width: 280, height: 280, borderRadius: 140, backgroundColor: '#1B4235', opacity: 0.10, bottom: '5%', left: '40%', ...Platform.select({ web: { filter: 'blur(85px)' } }), zIndex: 0 },
};