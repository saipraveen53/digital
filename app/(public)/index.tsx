import { useRouter } from "expo-router";
import { Activity, ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Sparkles, Star, Zap } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, Text, View, useWindowDimensions } from "react-native";
import AnimatedRE, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { WaterGauge } from "../components/WaterGauge";

const ACTIVITIES = [
  { emoji: "🧘", name: "Morning Meditation", pts: 18, category: "mind" },
  { emoji: "🏃", name: "Gym / Run", pts: 25, category: "body" },
  { emoji: "🥗", name: "Healthy Meal", pts: 20, category: "food" },
  { emoji: "😴", name: "8h Sleep", pts: 30, category: "rest" },
  { emoji: "💧", name: "2L Water", pts: 15, category: "food" },
  { emoji: "🤝", name: "Social Time", pts: 12, category: "social" },
  { emoji: "😤", name: "Work Stress", pts: -20, category: "stress" },
  { emoji: "📱", name: "3h+ Screen Time", pts: -15, category: "habit" },
  { emoji: "🍕", name: "Junk Food", pts: -10, category: "food" },
  { emoji: "📝", name: "Journaling", pts: 14, category: "mind" },
];

const REVIEWS = [
  { name: "Sarah J.", role: "Product Designer", text: "Seeing my wellbeing as a water gauge completely changed how I manage stress. It's so visual and intuitive!", rating: 5 },
  { name: "Michael T.", role: "Software Engineer", text: "The AI tips are actually helpful. When my gauge drops to 30%, it reminds me to step away from the screen.", rating: 5 },
  { name: "Priya R.", role: "Student", text: "Logging takes 10 seconds. It's the only mental wellness app I've managed to stick with for over a month.", rating: 5 },
  { name: "David L.", role: "Entrepreneur", text: "The weekly trends graph helped me realize my energy always crashes on Thursdays. Now I plan better!", rating: 5 },
  { name: "Anita K.", role: "Teacher", text: "Drains vs Gains makes so much sense. It validates my exhaustion after a tough day and helps me recover.", rating: 5 },
  { name: "James W.", role: "Freelancer", text: "14 days free trial was enough to hook me. The CTA card at the bottom literally called out to me!", rating: 5 },
];

function getAITip(pct: number): string {
  if (pct >= 80) return "You're thriving today! 🌟 Consider sharing your energy — help a friend or do something creative.";
  if (pct >= 60) return "Good day so far! 👍 A short evening walk or 10 minutes of reading can push you higher.";
  if (pct >= 40) return "You're halfway there. Try drinking a glass of water and stepping away from the screen for 5 minutes. ⚡";
  if (pct >= 20) return "Your body needs care today. Start small — a healthy snack and 3 deep breaths can reset your energy. 🌱";
  return "Take it easy today. Rest is productive too. Try 5 minutes of stillness and one nourishing meal. ❤️";
}

const AnimatedCounter = ({ target, suffix = "", duration = 2000, start = false, decimals = 0 }: { target: number, suffix?: string, duration?: number, start?: boolean, decimals?: number }) => {
  const [count, setCount] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!start) return;

    anim.setValue(0);

    const listener = anim.addListener(({ value }) => {
      setCount(value);
    });

    Animated.timing(anim, {
      toValue: target,
      duration: duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, 
    }).start();

    return () => {
      anim.removeListener(listener);
    };
  }, [target, duration, start, anim]);

  return (
    <Text className="text-4xl md:text-5xl font-bold text-[#3B7563]">
      {count.toFixed(decimals)}{suffix}
    </Text>
  );
};

export default function PublicLandingPage() {
  const router = useRouter();
  const { width, height: screenHeight } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [score, setScore] = useState(65);
  const [logs, setLogs] = useState([
    { emoji: "🧘", name: "Morning Meditation", pts: 18 },
    { emoji: "🥗", name: "Healthy Breakfast", pts: 20 },
    { emoji: "😤", name: "Work Stress", pts: -20 },
    { emoji: "💧", name: "2L Water", pts: 15 },
  ]);

  const [startStats, setStartStats] = useState(false);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== "undefined") {
      const handleScroll = (e: any) => {
        const scrollTop = e.target?.scrollTop || document.documentElement?.scrollTop || window.scrollY || 0;
        if (scrollTop > 100 && !startStats) {
          setStartStats(true);
        }
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    } else {
      const timer = setTimeout(() => {
        setStartStats(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [startStats]);

  const scrollX = useRef(new Animated.Value(0)).current;
  const itemWidth = isDesktop ? 424 : 344;
  const totalWidth = itemWidth * REVIEWS.length;
  const DISPLAY_REVIEWS = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];

  useEffect(() => {
    scrollX.setValue(0);
    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [totalWidth, scrollX]);

  const getGraphColor = (val: number) => {
    if (val >= 70) return "bg-emerald-500";
    if (val >= 40) return "bg-amber-400";
    return "bg-red-400";
  };

  // ✅ FIXED: 6 COLORED BALLS WITH ANTI-DIRECTION SCROLL MAPPING
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
      {/* ✅ 6 MULTIPLE COLORED BALLS BACKGROUND DISTRIBUTED ACROSS SIDES */}
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
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={{ minHeight: screenHeight * 0.8, zIndex: 3 }} className={`${Platform.OS === 'web' ? 'pt-32 md:pt-32' : 'pt-14 md:pt-24'} pb-12 px-6 md:px-12 items-center justify-center w-full`}>
          <View className="w-full">
            <View className={`w-full flex ${isDesktop ? 'flex-row items-center justify-between' : 'flex-col items-center'} gap-8 md:gap-12`}>

              <View className={`flex-col ${isDesktop ? 'w-[50%]' : 'w-full items-center text-center'}`}>
                <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#3B7563]/20 mb-5 shadow-sm self-start" style={{ alignSelf: isDesktop ? 'flex-start' : 'center' }}>
                  <Zap size={14} color="#3B7563" />
                  <Text className="text-[#3B7563] text-xs font-bold uppercase tracking-widest">Interactive Wellness Tracker</Text>
                </View>

                <Text className={`text-slate-900 mb-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight ${!isDesktop && 'text-center'}`}>
                  How full is your <Text className="text-[#3B7563] italic font-serif">wellbeing</Text> today?
                </Text>

                <Text className={`text-slate-600 text-lg md:text-xl mb-6 leading-relaxed pr-4 ${!isDesktop && 'text-center pr-0'}`}>
                  Track daily activities and watch your gauge fill. A score of 60%+ means you're thriving. Monitor your energy, avoid burnout, and build recovering habits.
                </Text>

                <View className={`w-full mb-8 ${!isDesktop && 'items-center'}`}>
                  <View className="flex-col items-start">
                    <View className="flex-row items-center gap-3">
                      <CheckCircle2 size={18} color="#3B7563" />
                      <Text className="text-slate-700 text-base font-medium">Smart AI recovery suggestions</Text>
                    </View>
                    <View className="flex-row items-center gap-3 mt-3">
                      <CheckCircle2 size={18} color="#3B7563" />
                      <Text className="text-slate-700 text-base font-medium">Visual trends & weekly energy patterns</Text>
                    </View>
                    <View className="flex-row items-center gap-3 mt-3">
                      <CheckCircle2 size={18} color="#3B7563" />
                      <Text className="text-slate-700 text-base font-medium">100% private and secure tracking</Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={() => router.push("/login")}
                  className="flex-row items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#3B7563] active:scale-95 transition-all duration-200"
                  style={{
                    alignSelf: isDesktop ? 'flex-start' : 'center',
                    elevation: 6,
                    shadowColor: '#3B7563',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6
                  }}
                >
                  <Text className="text-white font-bold text-lg">Try It Now</Text>
                  <ArrowRight size={20} color="white" />
                </Pressable>
              </View>

              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} className={`rounded-[32px] p-8 border border-slate-200 shadow-xl flex-col items-center justify-center ${isDesktop ? 'w-[40%] max-w-md' : 'w-full max-w-sm'}`}>
                <WaterGauge percentage={score} size={200} />

                <View className="mt-8 w-full bg-[#F8F6F0] rounded-2xl p-5 border border-slate-100">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Sparkles size={16} color="#3B7563" />
                    <Text className="text-sm text-[#3B7563] font-bold">Live AI Insight</Text>
                  </View>
                  <Text className="text-sm text-slate-800 leading-relaxed font-medium">{getAITip(score)}</Text>
                </View>
              </View>

            </View>
          </View>
        </View>

        <View style={{ zIndex: 3 }} className="py-12 px-6 md:px-12 items-center bg-white border-y border-slate-200 w-full">
          <View className="w-full">
            <View className={`flex ${isDesktop ? 'flex-row justify-around' : 'flex-col gap-10'} items-center w-full`}>
              <View className="items-center">
                <AnimatedCounter target={50} suffix="K+" start={startStats} />
                <Text className="text-slate-500 mt-2 text-base font-medium uppercase tracking-wider">Happy Users</Text>
              </View>

              <View className="items-center">
                <AnimatedCounter target={98} suffix="%" start={startStats} />
                <Text className="text-slate-500 mt-2 text-base font-medium uppercase tracking-wider">Feel Better</Text>
              </View>

              <View className="items-center">
                <AnimatedCounter target={4.9} suffix="★" decimals={1} start={startStats} />
                <Text className="text-slate-500 mt-2 text-base font-medium uppercase tracking-wider">App Rating</Text>
              </View>

              <View className="items-center">
                <AnimatedCounter target={1} suffix="M+" start={startStats} />
                <Text className="text-slate-500 mt-2 text-base font-medium uppercase tracking-wider">Logs Tracked</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ zIndex: 3 }} className="py-24 px-6 md:px-12 items-center">
          <View className="w-full">
            <Text className="text-center text-[#3B7563] text-sm font-bold uppercase tracking-widest mb-3">How It Works</Text>
            <Text className="text-center text-4xl md:text-5xl font-bold text-slate-900 mb-16">Understand your energy</Text>

            <View className={`flex ${isDesktop ? 'flex-row' : 'flex-col'} gap-8`}>

              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} className={`p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:-translate-y-2 ${isDesktop ? 'flex-1' : 'w-full'}`}>
                <View className="w-14 h-14 bg-[#F8F6F0] rounded-2xl items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <Activity size={28} color="#3B7563" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 mb-4">Log Drains & Gains</Text>
                <Text className="text-slate-600 text-lg leading-relaxed mb-6">
                  Your daily energy isn't static. Track recovering habits like an 8-hour sleep (+30%) and draining events like work stress (-20%). Seeing your true balance helps you prioritize self-care.
                </Text>
                <View className="bg-[#F8F6F0] rounded-xl p-3 border border-slate-100 gap-2">
                  <View className="flex-row items-center justify-between bg-emerald-50 p-2 rounded-lg">
                    <Text className="text-slate-700">🏃 Gym Session</Text>
                    <Text className="text-emerald-600 font-bold">+25%</Text>
                  </View>
                  <View className="flex-row items-center justify-between bg-red-50 p-2 rounded-lg">
                    <Text className="text-slate-700">📱 Doom Scrolling</Text>
                    <Text className="text-red-500 font-bold">-15%</Text>
                  </View>
                </View>
              </View>

              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} className={`p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:-translate-y-2 ${isDesktop ? 'flex-1' : 'w-full'}`}>
                <View className="w-14 h-14 bg-[#F8F6F0] rounded-2xl items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <BarChart3 size={28} color="#3B7563" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 mb-4">Spot Weekly Trends</Text>
                <Text className="text-slate-600 text-lg leading-relaxed mb-6">
                  Graphs turn feelings into facts. Visualize your wellbeing percentage across the week. Spot which days you naturally thrive and when you consistently need a boost.
                </Text>
                <View className="bg-[#F8F6F0] rounded-xl p-4 border border-slate-100">
                  <View className="flex-row items-end justify-between h-24 border-b border-slate-300 pb-2">
                    {[35, 65, 45, 85, 55, 95, 75].map((h, i) => (
                      <View key={i} className="items-center w-[12%] h-full justify-end group">
                        <View className={`w-full ${getGraphColor(h)} rounded-t-lg opacity-85 transition-all group-hover:opacity-100`} style={{ height: `${h}%`, minHeight: 4 }} />
                      </View>
                    ))}
                  </View>
                  <View className="flex-row justify-between mt-3 px-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <Text key={i} className="text-xs font-bold text-slate-500">{day}</Text>)}
                  </View>
                </View>
              </View>

              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} className={`p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:-translate-y-2 ${isDesktop ? 'flex-1' : 'w-full'}`}>
                <View className="w-14 h-14 bg-[#F8F6F0] rounded-2xl items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <BrainCircuit size={28} color="#3B7563" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 mb-4">Percentage-Based AI</Text>
                <Text className="text-slate-600 text-lg leading-relaxed mb-6">
                  Our AI doesn't give generic advice. If your gauge is at 20%, it suggests critical rest. If you're at 80%, it pushes you to share your energy. Get exactly what you need, when you need it.
                </Text>
                <View className="bg-[#F8F6F0] rounded-xl p-4 border border-slate-100">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-red-500 font-bold text-lg">20%</Text>
                    <Text className="text-slate-500 text-xs uppercase tracking-wider font-bold">Depleted</Text>
                  </View>
                  <Text className="text-sm text-slate-700 italic">"Your body needs care today. Start small — a healthy snack and 3 deep breaths can reset your energy."</Text>
                </View>
              </View>

            </View>
          </View>
        </View>

        <View style={{ zIndex: 3 }} className="py-16 md:py-24 items-center bg-white w-full overflow-hidden border-t border-slate-200">
          <View className="w-full px-6 md:px-12 mb-12">
            <Text className="text-[#3B7563] text-sm font-bold uppercase tracking-widest mb-3">User Stories</Text>
            <Text className="text-4xl md:text-5xl font-bold text-slate-900">Loved by people like you</Text>
          </View>

          <View className="w-full relative h-[340px] md:h-[300px] overflow-hidden">
            <Animated.View
              style={{
                flexDirection: 'row',
                position: 'absolute',
                left: 0,
                transform: [{ translateX: scrollX }],
                width: totalWidth * 4
              }}
            >
              {DISPLAY_REVIEWS.map((review, idx) => (
                <View
                  key={idx}
                  style={{ width: isDesktop ? 400 : 320, marginHorizontal: 12 }}
                  className="bg-[#F8F6F0] p-8 rounded-3xl border border-slate-100 shadow-sm flex-shrink-0"
                >
                  <View className="flex-row gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} size={18} color="#F59E0B" fill="#F59E0B" />)}
                  </View>
                  <Text className="text-slate-700 text-lg leading-relaxed mb-8 flex-1">"{review.text}"</Text>
                  <View className="flex-row items-center gap-4 border-t border-slate-200 pt-5">
                    <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                      <Text className="text-[#3B7563] font-bold text-xl">{review.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-slate-900 text-lg">{review.name}</Text>
                      <Text className="text-sm text-slate-500">{review.role}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Animated.View>
          </View>
        </View>

        <View style={{ zIndex: 3 }} className="py-16 md:py-24 px-6 md:px-12 items-center">
          <View className="w-full max-w-5xl bg-[#3B7563] rounded-[48px] p-12 md:p-20 items-center text-center shadow-2xl relative overflow-hidden">

            <View className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <View className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />

            <Text className="text-white text-4xl md:text-6xl font-extrabold mb-6 text-center leading-tight relative z-10">
              Ready to fill your gauge?
            </Text>
            <Text className="text-emerald-50 text-lg md:text-2xl mb-12 text-center max-w-3xl leading-relaxed relative z-10">
              Join thousands of users who are taking control of their mental wellness. It takes less than 30 seconds a day to track your journey.
            </Text>

            <Pressable
              onPress={() => router.push("/login")}
              className="flex-row items-center justify-center gap-3 px-8 py-4 rounded-full bg-white active:scale-95 active:opacity-90 transition-all duration-300 relative z-10 hover:-translate-y-1"
              style={{
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8
              }}
            >
              <Text className="text-[#3B7563] font-bold text-lg tracking-wide text-center">Start your 14-day free trial</Text>
              <ArrowRight size={20} color="#3B7563" />
            </Pressable>
            <Text className="text-emerald-100/80 text-sm mt-6 font-medium tracking-wide relative z-10">No credit card required upfront.</Text>
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
    backgroundColor: '#336956', // Soft Emerald Mid-node
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
    backgroundColor: '#1B4235', // Deep Accent Bottom Left
    opacity: 0.10,
    bottom: '5%',
    left: '40%',
    ...Platform.select({ web: { filter: 'blur(85px)' } }),
    zIndex: 0,
  },
};