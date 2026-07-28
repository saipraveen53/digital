import { ChevronDown, ChevronUp, Heart, HelpCircle, Leaf, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const FAQ_DATA = [
  {
    q: "What is Wellbeing Gauge?",
    a: "Wellbeing Gauge is a personal wellbeing companion designed to help you understand, monitor, and build your wellbeing through self-awareness, self-regulation, and intentional action. Rather than focusing only on problems or illness, the application helps you recognize the habits, behaviours, and experiences that influence your overall wellbeing.",
    cat: "General"
  },
  {
    q: "Is Wellbeing Gauge a mental health diagnosis app?",
    a: "No. Wellbeing Gauge is not designed to diagnose mental health conditions or replace professional care. It is a wellbeing assessment and self-development application that helps you better understand yourself and make informed decisions to improve your wellbeing.",
    cat: "General"
  },
  {
    q: "What is Wellbeing?",
    a: "Wellbeing is the overall quality of your experience in life. It includes your emotional, psychological, physical, social, and personal functioning. Wellbeing is not simply the absence of illness or the presence of happiness—it is the ability to live, adapt, grow, and function meaningfully despite life's challenges.",
    cat: "General"
  },
  {
    q: "What does my Wellbeing Score represent?",
    a: "Your Wellbeing Score represents your current experience of wellbeing based on your assessment responses and the meaningful activities you log within the application. It is not a measure of your worth, personality, or success. Think of it as a compass that helps you understand where you are today and how your wellbeing changes over time.",
    cat: "Metrics"
  },
  {
    q: "What do the different score ranges mean? (Flourishing, Balanced, Strained, Depleted)",
    a: "• Flourishing (75% and above): Suggests that your current habits, behaviours, and experiences are generally supporting your wellbeing. Indicates developed resources that help you adapt.\n\n• Balanced (50–75%): Indicates that your wellbeing is generally stable, although certain areas of your life may require greater attention.\n\n• Strained (30–50%): Suggests that your current demands may be exceeding your available psychological or physical resources. It simply indicates that your wellbeing would benefit from greater self-care.\n\n• Depleted (Below 30%): Indicates that your wellbeing may currently require immediate attention. This score should be viewed as an invitation to prioritize self-care or seek support.",
    cat: "Metrics"
  },
  {
    q: "Why did my Wellbeing Score change?",
    a: "Wellbeing is dynamic and changes as life changes. Your score may change due to your habits, sleep, physical health, relationships, work demands, emotional experiences, and the meaningful activities you log. These changes are a normal reflection of your ongoing wellbeing journey.",
    cat: "Metrics"
  },
  {
    q: "Do I have to log every activity I perform?",
    a: "No.\nWellbeing Gauge is not intended to record every activity in your day. Instead, it encourages you to log activities that have a meaningful influence on your wellbeing.\n\nFor example, activities such as:\n• Reading or learning something meaningful\n• Completing physical exercise or yoga\n• Practicing meditation or mindfulness\n• Having a balanced and nutritious meal\n• Spending quality time with loved ones\n• Getting adequate sleep\n• Achieving a personal or professional goal\n\nSimilarly, activities that may reduce your wellbeing can also be logged, such as:\n• Smoking or tobacco use\n• Excessive alcohol consumption\n• Prolonged sleep deprivation\n• Skipping meals\n• Excessive screen time\n• High levels of unmanaged stress\n• Other behaviours that leave you feeling physically or emotionally depleted\n\nEach meaningful activity contributes differently to your overall wellbeing. Some behaviours may strengthen your wellbeing, while others may temporarily reduce it. The app considers these influences to provide a more accurate and dynamic understanding of your wellbeing over time.\n\nThe goal is not to record everything you do, but to become more aware of the behaviours that meaningfully shape your physical, emotional, social, and psychological wellbeing.",
    cat: "Tracking"
  },
  {
    q: "How does the app decide how much an activity affects my Wellbeing?",
    a: "Wellbeing is a personal and subjective experience. The same activity may influence different people in different ways.\n\nTo support this, Wellbeing Gauge provides a library of default activities based on common wellbeing practices. In addition, you can create your own custom activities and decide how much they positively or negatively influence your wellbeing based on your personal experience.\n\nThis approach encourages active participation rather than allowing the application to make every decision for you. As your understanding of yourself grows, you can continue refining your activities and their influence to better reflect your personal wellbeing journey.\n\nTo support informed decisions, Wellbeing Gauge also provides educational resources through its FAQs, knowledge articles, Shinray Health blogs, and learning materials.",
    cat: "Tracking"
  },
  {
    q: "Can I create my own activities?",
    a: "Yes.\nEvery person's Wellbeing journey is unique. If an activity that is important to your Wellbeing is not included in the application, you can create a custom activity, decide whether it improves or reduces your Wellbeing, and assign its level of influence based on your own experience.\n\nYou may also edit or delete custom activities whenever your needs change.",
    cat: "Tracking"
  },
  {
    q: "Is my Wellbeing information confidential?",
    a: "Yes.\nYour Wellbeing information belongs to you. Wellbeing Gauge is designed to support your personal understanding and growth—not to evaluate, compare, or judge you.\n\nYour Wellbeing Score is intended as a personal reflection of your own experiences and is not designed for comparison with other individuals.",
    cat: "Privacy"
  },
  {
    q: "Why doesn't the app compare my Wellbeing with other people?",
    a: "Wellbeing is a subjective experience that is influenced by each person's unique circumstances, values, relationships, health, and life experiences.\n\nComparing Wellbeing scores between individuals can be misleading and does not provide meaningful insight. Instead, Wellbeing Gauge encourages you to compare your present Wellbeing with your own past Wellbeing and focus on your personal growth over time.",
    cat: "Privacy"
  },
  {
    q: "What is the philosophy behind Wellbeing Gauge?",
    a: "Wellbeing Gauge is built on the belief that lasting Wellbeing is developed—not given.\n\nThe application is based on three core psychological principles:\n• Self-awareness – understanding your thoughts, emotions, behaviours, and experiences.\n• Self-regulation – intentionally managing your thoughts, emotions, and behaviours to support your Wellbeing.\n• Self-instruction – consciously guiding yourself toward healthier choices through reflection and purposeful action.\n\nRather than telling you how to live, Wellbeing Gauge helps you understand yourself more deeply so that you can become an active participant in building your own Wellbeing.",
    cat: "General"
  },
  {
    q: "What is the difference between Draining Activities, Recovery Activities, and Today's Wellbeing Prescription?",
    a: "Draining Activities and Recovery Activities are user-logged activities. They allow you to record meaningful behaviours or experiences that have already occurred and reflect how they have influenced your wellbeing. Draining Activities capture experiences that reduce your wellbeing, while Recovery Activities capture those that restore or strengthen it.\n\nIn contrast, Today's Wellbeing Prescription is provided by Shinray Health. It consists of evidence-informed psychological and wellbeing strategies recommended by the application to help you improve your Wellbeing. Once you complete a recommended activity, you can log it as completed, allowing your wellbeing score to reflect the positive impact of your effort. In simple terms, Draining and Recovery Activities measure your wellbeing based on what you have experienced, whereas Today's Wellbeing Prescription guides you toward evidence-based actions that help you build your Wellbeing.",
    cat: "Tracking"
  }
];

export default function FAQPage() {
  const { width, height: screenHeight } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categories = ['ALL', 'GENERAL', 'TRACKING', 'METRICS', 'PRIVACY'];

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || faq.cat.toUpperCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // ✅ FIXED: 6 COLORED BALLS WITH ANTI-DIRECTION SCROLL ANIMATION (distributed on multiple sides)
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
      {/* ✅ 6 MULTIPLE COLORED BALLS BACKGROUND */}
      <Animated.View style={[styles.blurredLiquidSphere1, ballStyle1]} />
      <Animated.View style={[styles.blurredLiquidSphere2, ballStyle2]} />
      <Animated.View style={[styles.blurredLiquidSphere3, ballStyle3]} />
      <Animated.View style={[styles.blurredLiquidSphere4, ballStyle4]} />
      <Animated.View style={[styles.blurredLiquidSphere5, ballStyle5]} />
      <Animated.View style={[styles.blurredLiquidSphere6, ballStyle6]} />

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={{ maxWidth: 1000, alignSelf: 'center', width: '100%', paddingHorizontal: isDesktop ? 24 : 16, paddingTop: isDesktop ? 48 : 24 }}>
          
          {/* Decorative Header Block */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-[#336956]/10 border border-[#336956]/20 mb-4 shadow-sm">
              <Leaf size={14} color="#336956" />
              <Text style={{ color: '#336956', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700' }}>
                Knowledge Base
              </Text>
            </View>
            <Text 
              style={{ fontSize: isDesktop ? 44 : 30, fontWeight: '900', color: '#11231D', textAlign: 'center', letterSpacing: -0.5 }}
              className="mb-3"
            >
              How can we help you today?
            </Text>
            <Text style={{ color: '#576860', fontSize: 15, textAlign: 'center', maxWidth: 600, lineHeight: 22 }}>
              Find answers to common questions regarding scores, logging mechanics, metrics algorithms, and privacy standards.
            </Text>
          </View>

          {/* Dynamic Search Controller Component */}
          <View style={{ width: '100%', marginBottom: 32 }}>
            <TextInput
              placeholder="Search for questions, keywords, principles..."
              placeholderTextColor="#576860"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setExpandedIndex(null);
              }}
              style={styles.searchBar}
            />
          </View>

          {/* Category Pill Filters Matrix */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40, justifyContent: isDesktop ? 'center' : 'flex-start' }}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  setSelectedCategory(cat);
                  setExpandedIndex(null);
                }}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 99,
                  backgroundColor: selectedCategory === cat ? '#336956' : 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1,
                  borderColor: selectedCategory === cat ? '#336956' : 'rgba(51, 105, 86, 0.08)',
                }}
                className="active:scale-95 transition-all shadow-sm"
              >
                <Text style={{ color: selectedCategory === cat ? 'white' : '#576860', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' }}>
                  {cat.toLowerCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Interactive Accordion List Container */}
          <View style={{ gap: 16 }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <View 
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: isExpanded ? '#336956' : 'rgba(51, 105, 86, 0.08)',
                      overflow: 'hidden',
                    }}
                    className="shadow-sm"
                  >
                    <Pressable
                      onPress={() => toggleExpand(idx)}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 24,
                        backgroundColor: isExpanded ? '#FDFDFD' : 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', gap: 14 }}>
                        <HelpCircle size={20} color={isExpanded ? '#336956' : '#576860'} />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#11231D', flex: 1 }}>
                          {item.q}
                        </Text>
                      </View>
                      <View className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        {isExpanded ? <ChevronUp size={16} color="#336956" /> : <ChevronDown size={16} color="#576860" />}
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 4 }}>
                        <Text style={{ color: '#576860', fontSize: 15, lineHeight: 26, fontWeight: '500' }}>
                          {item.a}
                        </Text>
                        <View className="flex-row items-center gap-1.5 mt-4 self-start bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <View className="w-1.5 h-1.5 rounded-full bg-[#336956]" />
                          <Text style={{ fontSize: 11, color: '#576860', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            Module: {item.cat}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={{ padding: 48, alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(51, 105, 86, 0.08)' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#576860', textAlign: 'center' }}>
                  No matches found for "{searchQuery}"
                </Text>
                <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4, textAlign: 'center' }}>
                  Try switching categories or verifying spelling rules.
                </Text>
              </View>
            )}
          </View>

          {/* Bento Footer Info Block */}
          <View style={{ marginTop: 56, flexDirection: isDesktop ? 'row' : 'column', gap: 16 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(51, 105, 86, 0.06)', padding: 24, borderRadius: 24, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <View className="bg-white p-3 rounded-xl shadow-sm"><ShieldCheck size={24} color="#336956" /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#11231D', fontSize: 15 }}>100% Confidential</Text>
                <Text style={{ color: '#576860', fontSize: 13, marginTop: 2 }}>Scores represent private developmental trajectories, never shared.</Text>
              </View>
            </View>
            
            <View style={{ flex: 1, backgroundColor: '#FDF7F4', padding: 24, borderRadius: 24, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <View className="bg-white p-3 rounded-xl shadow-sm"><Heart size={24} color="#E09643" /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#11231D', fontSize: 15 }}>Not Professional Diagnosis</Text>
                <Text style={{ color: '#576860', fontSize: 13, marginTop: 2 }}>Self-development companion architecture built to monitor wellness loops.</Text>
              </View>
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
  mobileHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderBottomWidth: 1,
    borderColor: 'rgba(51, 105, 86, 0.08)',
  },
  backButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(51, 105, 86, 0.06)',
    marginRight: 14,
  },
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#11231D',
  },
  searchBar: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 105, 86, 0.08)',
    fontSize: 15,
    color: '#11231D',
  }
};