import { BarChart3, BrainCircuit, Droplets, Lock, Sparkles, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { WaterGauge } from "../components/WaterGauge";

const FeatureCard = ({ f, isDesktop }: { f: any, isDesktop: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const showImage = !isDesktop || isHovered;

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={{ 
        width: isDesktop ? '31%' : '100%', 
        backgroundColor: 'white', 
        borderRadius: 24, 
        borderWidth: 1, 
        borderColor: '#F3F4F6',
        overflow: 'hidden'
      }}
      className="hover:-translate-y-2 hover:shadow-xl transition-all duration-300 relative"
    >
      {showImage && (
        <Image 
          source={{ uri: f.img }} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
          resizeMode="cover" 
        />
      )}
      
      {showImage && (
        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(28, 43, 42, 0.75)' }} />
      )}

      <View style={{ padding: 28, minHeight: 280, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: showImage ? 'rgba(255,255,255,0.15)' : '#EBF4F1', alignItems: 'center', justifyContent: 'center' }}>
            {f.icon(showImage ? '#ffffff' : '#3E7B6A')}
          </View>
          <View style={{ backgroundColor: showImage ? 'rgba(255,255,255,0.15)' : '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: showImage ? '#ffffff' : '#3E7B6A', fontSize: 12, fontWeight: 'bold' }}>{f.tag}</Text>
          </View>
        </View>
        <View>
          <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: showImage ? '#ffffff' : '#111827', marginBottom: 12 }}>
            {f.title}
          </Text>
          <Text style={{ color: showImage ? 'rgba(255,255,255,0.85)' : '#6B7280', fontSize: 15, lineHeight: 24 }}>
            {f.desc}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const AnimatedBar = ({ d, index, color, isDesktop, start }: { d: { day: string, val: number }, index: number, color: string, isDesktop: boolean, start: boolean }) => {
  const animHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!start) return;
    
    Animated.timing(animHeight, {
      toValue: d.val,
      duration: 1000,
      delay: index * 100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [d.val, start]);

  return (
    <View style={{ alignItems: 'center', width: `${100/7 - 2}%`, height: '100%', justifyContent: 'flex-end' }}>
      <Text style={{ fontSize: isDesktop ? 13 : 11, fontWeight: 'bold', color: color, marginBottom: 8 }}>
        {d.val}%
      </Text>
      <Animated.View 
        style={{ 
          width: '100%', 
          height: animHeight.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%']
          }), 
          backgroundColor: color, 
          borderRadius: 8, 
          minHeight: 4 
        }} 
        className="shadow-sm"
      />
      <Text style={{ fontSize: isDesktop ? 14 : 12, color: '#4B5563', marginTop: 12, fontWeight: '600' }}>
        {d.day}
      </Text>
    </View>
  );
};

export default function Features() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; 

  const [demoScore, setDemoScore] = useState(42);
  const [recentLogs, setRecentLogs] = useState([
    { emoji: "🥗", name: "Healthy Meal", pts: 20 },
    { emoji: "😤", name: "Work Stress", pts: -20 },
  ]);
  const [startGraph, setStartGraph] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== "undefined") {
      const handleScroll = (e: any) => {
        const scrollTop = e.target?.scrollTop || document.documentElement?.scrollTop || window.scrollY || 0;
        if (scrollTop > (isDesktop ? 300 : 1000) && !startGraph) {
          setStartGraph(true);
        }
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    } else {
      const timer = setTimeout(() => {
        setStartGraph(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [startGraph, isDesktop]);

  const handleLog = (emoji: string, name: string, pts: number) => {
    setDemoScore(prev => Math.min(100, Math.max(0, prev + pts)));
    setRecentLogs(prev => [{ emoji, name, pts }, ...prev].slice(0, 3));
  };

  const weeklyData = [
    { day: 'Mon', val: 45 },
    { day: 'Tue', val: 80 },
    { day: 'Wed', val: 60 },
    { day: 'Thu', val: 95 },
    { day: 'Fri', val: 35 },
    { day: 'Sat', val: 85 },
    { day: 'Sun', val: 70 },
  ];

  const getGraphColor = (val: number) => {
    if (val >= 70) return '#059669';
    if (val >= 40) return '#D97706'; 
    return '#DC2626'; 
  };

  const features = [
    { 
      icon: (color: string) => <Droplets size={28} color={color} />, 
      title: "Visual Water Gauge", 
      desc: "Your score is displayed as a filling gauge — immediately intuitive. Color shifts from red → orange → green as you improve.", 
      tag: "Core",
      img: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=600&q=80" 
    },
    { 
      icon: (color: string) => <Zap size={28} color={color} />, 
      title: "Instant Score Updates", 
      desc: "Log an activity and your gauge updates in real time. Every positive action you see reflected immediately.", 
      tag: "Core",
      img: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&q=80" 
    },
    { 
      icon: (color: string) => <BrainCircuit size={28} color={color} />, 
      title: "Personalized AI Tips", 
      desc: "Score below 60%? AI analyzes your log and suggests specific, realistic actions to boost your day.", 
      tag: "AI",
      img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80" 
    },
    { 
      icon: (color: string) => <BarChart3 size={28} color={color} />, 
      title: "Weekly Graph Trends", 
      desc: "See your score history as a chart. Spot patterns — what consistently helps or hurts your mental state.", 
      tag: "Analytics",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80" 
    },
    { 
      icon: (color: string) => <Sparkles size={28} color={color} />, 
      title: "Smart Activity Logging", 
      desc: "Log your daily actions with just two taps. Easily track what drains your energy and what replenishes it.", 
      tag: "Tracking",
      img: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80" 
    },
    { 
      icon: (color: string) => <Lock size={28} color={color} />, 
      title: "Private & Encrypted", 
      desc: "Everything is end-to-end encrypted. Your wellness data is deeply personal — we treat it that way.", 
      tag: "Privacy",
      img: "https://images.unsplash.com/photo-1614064641913-6b2169eb3c13?w=600&q=80" 
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 64 }}>
        
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
           <Text style={{ color: '#3E7B6A', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: '700' }}>
             Features
           </Text>
           <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: isDesktop ? 56 : 40, lineHeight: isDesktop ? 64 : 48, color: '#111827', textAlign: 'center', marginBottom: 16 }}>
             Everything you need to understand yourself better
           </Text>
           <Text style={{ color: '#6B7280', fontSize: 18, textAlign: 'center' }}>
             Log in under 30 seconds. Understand yourself in minutes.
           </Text>
        </View>

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 24, marginBottom: 48 }}>
           
           <View style={{ flex: isDesktop ? 1 : undefined, width: '100%', backgroundColor: '#F8F6F0', borderRadius: 32, padding: isDesktop ? 48 : 32, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' }}>
              
              <Text style={{ textAlign: 'center', color: '#6B7280', marginBottom: 32, fontSize: 16 }}>
                Try logging activities below to see your gauge react live
              </Text>

              <WaterGauge percentage={demoScore} size={isDesktop ? 220 : 180} />
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 40, width: '100%', justifyContent: 'center' }}>
                 {[
                   { label: "Critical", val: 15, color: "#E74C3C" },
                   { label: "Baseline", val: 60, color: "#F39C12" },
                   { label: "Thriving", val: 85, color: "#2ECC71" },
                 ].map((preset) => (
                   <Pressable
                     key={preset.label}
                     onPress={() => setDemoScore(preset.val)}
                     style={{ backgroundColor: preset.color, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                     className="active:scale-95 transition-all"
                   >
                     <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{preset.label}</Text>
                   </Pressable>
                 ))}
              </View>
           </View>

           <View style={{ flex: isDesktop ? 1.2 : undefined, width: '100%', backgroundColor: 'white', borderRadius: 32, padding: isDesktop ? 40 : 28, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15, elevation: 2 }}>
              
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 20 }}>Log Activity</Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                 {[
                    { emoji: "🧘", name: "Meditation", pts: 18 },
                    { emoji: "💧", name: "Drink Water", pts: 15 },
                    { emoji: "😤", name: "Work Stress", pts: -20 },
                    { emoji: "📱", name: "Doom Scroll", pts: -15 },
                 ].map((act, i) => (
                    <Pressable 
                       key={i}
                       onPress={() => handleLog(act.emoji, act.name, act.pts)}
                       style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: act.pts > 0 ? '#F0FBF4' : '#FFF0EE', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: act.pts > 0 ? '#D1FAE5' : '#FEE2E2', width: isDesktop ? '48%' : '100%' }}
                       className="active:scale-95 transition-all hover:opacity-80"
                    >
                       <Text style={{ fontSize: 22, marginRight: 12 }}>{act.emoji}</Text>
                       <View>
                          <Text style={{ fontWeight: '700', color: '#111827', fontSize: 15 }}>{act.name}</Text>
                          <Text style={{ color: act.pts > 0 ? '#059669' : '#DC2626', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                            {act.pts > 0 ? '+' : ''}{act.pts}%
                          </Text>
                       </View>
                    </Pressable>
                 ))}
              </View>

              <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 24 }} />

              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4B5563', marginBottom: 16 }}>Recent Logs</Text>
              <View style={{ gap: 12 }}>
                 {recentLogs.map((log, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16 }}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={{ fontSize: 24 }}>{log.emoji}</Text>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{log.name}</Text>
                       </View>
                       <Text style={{ fontSize: 16, fontWeight: 'bold', color: log.pts > 0 ? '#059669' : '#DC2626' }}>
                          {log.pts > 0 ? '+' : ''}{log.pts}%
                       </Text>
                    </View>
                 ))}
              </View>
           </View>

        </View>

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', backgroundColor: 'white', borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 80, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15, elevation: 2 }}>
           <View style={{ flex: isDesktop ? 1 : undefined, width: '100%' }}>
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" }}
                style={{ width: '100%', height: isDesktop ? '100%' : 250, minHeight: 250 }} 
                resizeMode="cover" 
              />
           </View>

           <View style={{ flex: isDesktop ? 1.2 : undefined, width: '100%', padding: isDesktop ? 48 : 28, justifyContent: 'center' }}>
              <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#111827', marginBottom: 12 }}>
                Weekly Graph Trends
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 16, lineHeight: 24, marginBottom: 40 }}>
                See your score history as a chart. Spot patterns to understand what consistently helps or hurts your mental state over the week.
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 200 }}>
                 {weeklyData.map((d, i) => (
                    <AnimatedBar key={i} d={d} index={i} color={getGraphColor(d.val)} isDesktop={isDesktop} start={startGraph} />
                 ))}
              </View>
           </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between' }}>
           {features.map((f, i) => (
             <FeatureCard key={i} f={f} isDesktop={isDesktop} />
           ))}
        </View>

      </View>
    </View>
  );
}