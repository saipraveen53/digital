import { Beaker, Leaf, Lock, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export default function AboutPage() {
  const { width, height: screenHeight } = useWindowDimensions();
  const isDesktop = width >= 768; 

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const values = [
    { icon: <Leaf size={28} color="#3E7B6A" />, title: "Daily Growth", desc: "Small consistent steps create lasting transformation. Every single log matters." },
    { icon: <Lock size={28} color="#3E7B6A" />, title: "Total Privacy", desc: "Your data is yours. End-to-end encrypted. Never sold, never shared." },
    { icon: <Beaker size={28} color="#3E7B6A" />, title: "Science-Backed", desc: "Activity weights are built on research in positive psychology and behavioral science." },
    { icon: <Sparkles size={28} color="#3E7B6A" />, title: "Judgment-Free", desc: "Bad days are data, not failure. Wellbeing Gauge guides — never shames." },
  ];

  // ✅ ANTI-DIRECTION SCROLL ANIMATION FOR BALLS
  const ballStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [0, -220]) }],
  }));

  const ballStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [120, -110]) }],
  }));

  const ballStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [-60, -390]) }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F5' }}>
      {/* ✅ MULTIPLE COLORED BALLS BACKGROUND */}
      <Animated.View style={[styles.blurredLiquidSphere1, ballStyle1]} />
      <Animated.View style={[styles.blurredLiquidSphere2, ballStyle2]} />
      <Animated.View style={[styles.blurredLiquidSphere3, ballStyle3]} />

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 64 }}
      >
        <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%', paddingHorizontal: 24, paddingTop: 32, zIndex: 3 }}>
          
          <View style={{ alignItems: 'center', marginBottom: 64 }}>
            <Text style={{ color: '#3E7B6A', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: '700' }}>
              Our Story
            </Text>
            <Text 
              style={{ fontSize: isDesktop ? 64 : 44, lineHeight: isDesktop ? 76 : 52, color: '#111827', textAlign: 'center', fontWeight: '900' }} 
              className="mb-8"
            >
              Mental wellness is a <Text style={{ color: '#3E7B6A', fontStyle: 'italic' }}>daily practice</Text>,{"\n"}
              not a destination.
            </Text>
            <Text style={{ color: '#576860', fontSize: 18, lineHeight: 28, textAlign: 'center', maxWidth: 800 }}>
              We built the tool we wished we had — a simple, visual way to see how your daily choices affect your mental state in real time.
            </Text>
          </View>

          <View style={{ width: '100%', height: 350, borderRadius: 24, overflow: 'hidden', marginBottom: 80 }}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=1200&h=400&fit=crop&auto=format" }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          <View style={{ width: '100%' }}>
            <Text 
              style={{ fontSize: 36, color: '#111827', textAlign: 'center', marginBottom: 48, fontWeight: '800' }} 
            >
              What we stand for
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 }}>
              {values.map((v, i) => (
                <Pressable 
                  key={i} 
                  style={{ width: isDesktop ? '48%' : '100%', padding: 32, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  className="rounded-3xl border border-gray-100 flex-row gap-6 shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
                >
                  <View className="bg-[#EBF4F1] w-14 h-14 rounded-2xl items-center justify-center flex-shrink-0">
                    {v.icon}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text 
                      style={{ fontSize: 24, color: '#111827', marginBottom: 12, fontWeight: '700' }} 
                    >
                      {v.title}
                    </Text>
                    <Text style={{ color: '#576860', fontSize: 16, lineHeight: 24 }}>
                      {v.desc}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = {
  blurredLiquidSphere1: {
    position: 'absolute' as const,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E09643',
    opacity: 0.22,
    top: '10%',
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
    bottom: '22%',
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
    opacity: 0.18,
    top: '55%',
    left: '35%',
    ...Platform.select({ web: { filter: 'blur(70px)' } }),
    zIndex: 0,
  },
};