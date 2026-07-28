import { Link } from 'expo-router';
import { Check, Star } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import AnimatedRE, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export default function Pricing() {
  const { width, height: screenHeight } = useWindowDimensions();
  const isDesktop = width >= 768;

  const features = [
    "Full access to all features",
    "Customized recovery suggestions",
    "Weekly trend analysis",
    "Private & encrypted data",
    "Priority support"
  ];

  // ✅ FIXED: Reanimated 3 shared value for tracking scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // ✅ 6 COLORED BALLS - ANTI-DIRECTION SCROLL ANIMATION CONFIGURATION
  const ballStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [0, -250]) }],
  }));

  const ballStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [120, -150]) }],
  }));

  const ballStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [-60, -420]) }],
  }));

  const ballStyle4 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [200, -100]) }],
  }));

  const ballStyle5 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [-150, -500]) }],
  }));

  const ballStyle6 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [300, 0]) }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F5' }}>
      {/* ✅ 6 MULTIPLE COLORED BALLS DISTRIBUTED ON MULTIPLE SIDES */}
      <AnimatedRE.View style={[styles.blurredLiquidSphere1, ballStyle1]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere2, ballStyle2]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere3, ballStyle3]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere4, ballStyle4]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere5, ballStyle5]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere6, ballStyle6]} />

      <AnimatedRE.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 64 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={{ maxWidth: 1000, alignSelf: 'center', width: '100%', paddingHorizontal: 24, paddingTop: 32, zIndex: 3 }}>
          
          <View style={{ alignItems: 'center', marginBottom: 64 }}>
             <Text style={{ color: '#3E7B6A', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: '700' }}>
               Pricing
             </Text>
             <Text style={{ fontSize: isDesktop ? 56 : 40, lineHeight: isDesktop ? 64 : 48, color: '#111827', textAlign: 'center', marginBottom: 16, fontWeight: '900' }}>
               Choose the plan that fits you
             </Text>
             <Text style={{ color: '#6B7280', fontSize: 18, textAlign: 'center', maxWidth: 600 }}>
               Every plan starts with a 14-day free trial. No credit card required upfront.
             </Text>
          </View>

          <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'center', gap: 32, width: '100%' }}>
            
            {/* Monthly Plan */}
            <View style={{ width: isDesktop ? '45%' : '100%', padding: 40, borderRadius: 32, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1, borderColor: 'rgba(51, 105, 86, 0.08)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 }}>
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#374151', marginBottom: 8 }}>Monthly</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 32 }}>
                  <Text style={{ fontSize: 44, fontWeight: '800', color: '#111827' }}>₹499</Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', marginLeft: 4 }}>/month</Text>
              </View>
              
              <View style={{ gap: 16, marginBottom: 40 }}>
                  {features.map((f, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Check size={20} color="#3E7B6A" />
                          <Text style={{ fontSize: 16, color: '#4B5563' }}>{f}</Text>
                      </View>
                  ))}
              </View>

              <Link href="/login" asChild>
                <Pressable style={{ backgroundColor: '#F8F6F0', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' }}>
                  <Text style={{ color: '#3E7B6A', fontWeight: 'bold', fontSize: 18 }}>Start 14-Day Trial</Text>
                </Pressable>
              </Link>
            </View>

            {/* Yearly Plan - Popular */}
            <View style={{ width: isDesktop ? '45%' : '100%', padding: 40, borderRadius: 32, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 2, borderColor: '#3E7B6A', shadowColor: '#3E7B6A', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 }}>
              <View style={{ position: 'absolute', top: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#3E7B6A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                  <Star size={12} color="white" fill="white" />
                  <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>MOST POPULAR</Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#3E7B6A', marginBottom: 8 }}>Yearly</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
                  <Text style={{ fontSize: 44, fontWeight: '800', color: '#111827' }}>₹4,999</Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', marginLeft: 4 }}>/year</Text>
              </View>
              <Text style={{ color: '#059669', fontSize: 14, fontWeight: 'bold', marginBottom: 32 }}>Save 20% compared to monthly</Text>
              
              <View style={{ gap: 16, marginBottom: 40 }}>
                  {features.map((f, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Check size={20} color="#3E7B6A" />
                          <Text style={{ fontSize: 16, color: '#4B5563' }}>{f}</Text>
                      </View>
                  ))}
              </View>

              <Link href="/login" asChild>
                <Pressable style={{ backgroundColor: '#3E7B6A', paddingVertical: 18, borderRadius: 16, alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Start 14-Day Trial</Text>
                </Pressable>
              </Link>
            </View>
            
          </View>

        </View>
      </AnimatedRE.ScrollView>
    </View>
  );
}

const styles = {
  blurredLiquidSphere1: {
    position: 'absolute' as const,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E09643', // Orange Amber
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
    backgroundColor: '#336956', // Emerald Green
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
    backgroundColor: '#1B4235', // Dark Forest Green
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
    backgroundColor: '#E09643', // Orange Amber Split
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
    backgroundColor: '#336956', // Soft Emerald
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
    backgroundColor: '#1B4235', // Deep Accent
    opacity: 0.10,
    bottom: '5%',
    left: '40%',
    ...Platform.select({ web: { filter: 'blur(85px)' } }),
    zIndex: 0,
  },
};