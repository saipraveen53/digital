import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedRE, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isDesktop = screenWidth >= 768;

// Global theme metrics
const COLORS = {
  background: '#FAF9F5',
  cardBg: 'rgba(255, 255, 255, 0.90)',
  textDark: '#11231D',
  textLight: '#576860',
  primary: '#336956',         
  secondary: '#E09643',       
  darkSienna: '#1B4235',
  border: 'rgba(51, 105, 86, 0.08)',
  accentBg: 'rgba(51, 105, 86, 0.06)',
  buttonCTA: '#5B46E5',       

  iconBgs: [
    "rgba(51, 105, 86, 0.06)", 
    "rgba(224, 150, 67, 0.06)", 
    "rgba(27, 66, 53, 0.06)", 
    "rgba(17, 35, 29, 0.04)"
  ],
  iconColors: ['#336956', '#E09643', '#1B4235', '#576860'],
};

interface StrategyItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

export default function SleepFirstAid() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>("STRAT_01");

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const strategies: StrategyItem[] = [
    {
      id: "STRAT_01",
      title: "Value Your Rest Time",
      description: "Remind yourself that rest is still beneficial, even if sleep doesn't come immediately.",
      icon: "moon",
    },
    {
      id: "STRAT_02",
      title: "Release Clock Pressure",
      description: "Avoid checking the clock repeatedly, as it often increases pressure and anxiety.",
      icon: "eye-off",
    },
    {
      id: "STRAT_03",
      title: "Settle Your Breathing",
      description: "Take slow, gentle breaths and allow your body to settle naturally.",
      icon: "wind",
    },
    {
      id: "STRAT_04",
      title: "Externalize Racing Thoughts",
      description: "If racing thoughts continue, write them down instead of trying to solve them in bed.",
      icon: "edit-3",
    },
    {
      id: "STRAT_05",
      title: "Minimize Stimulation",
      description: "Reduce bright screens and stimulating activities before attempting to sleep again.",
      icon: "smartphone",
    },
  ];

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
    <SafeAreaView style={styles.safeContainerWrapper}>
      <AnimatedRE.View style={[styles.blurredLiquidSphere1, ballStyle1]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere2, ballStyle2]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere3, ballStyle3]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere4, ballStyle4]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere5, ballStyle5]} />
      <AnimatedRE.View style={[styles.blurredLiquidSphere6, ballStyle6]} />

      <AnimatedRE.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentLayout}
      >
        <View style={[styles.mainMasterCardContainer, isDesktop && styles.desktopWidthConstraint]}>
          
          {/* Header Action Row Bar */}
          <View style={styles.headerActionRowBar}>
            <TouchableOpacity style={styles.backButtonCircle} onPress={() => router.push("/home")}>
              <Feather name="arrow-left" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={[styles.topNavigationTitleText, { color: COLORS.textDark }]}>Sleep First Aid</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Graphical Representation Section */}
          <View style={styles.illustrationHeroCenteredBlock}>
              <Image
                source={require("../../assets/images/cloude2.png")}
                style={styles.heroCloudyImageGraphics}
                resizeMode="contain"
              />
          </View>

          {/* Introduction Headline Blocks */}
          <View style={styles.introductoryTextGroupPanel}>
            <Text style={[styles.primaryMainHeadingHeadline, { color: COLORS.textDark }]}>
              Having difficulty{"\n"}falling asleep?
            </Text>
            <Text style={[styles.secondaryParagraphBodySubtitle, { color: COLORS.textLight }]}>
              You're not alone. Try these simple strategies first. If you still need support, we're here to help.
            </Text>
          </View>

          {/* Strategy Accordion Stack Component Area */}
          <View style={[styles.strategiesStackContainerCard, { borderColor: COLORS.border, backgroundColor: COLORS.cardBg }]}>
            <Text style={[styles.strategiesSectionInnerTitleHeader, { color: COLORS.textDark }]}>
              Try These Strategies First
            </Text>

            {strategies.map((strat, index) => {
              const isExpanded = expandedId === strat.id;
              const bgIdx = index % COLORS.iconBgs.length;

              return (
                <View
                  key={strat.id}
                  style={[
                    styles.accordionTileWrapperItem,
                    index === strategies.length - 1 && { borderBottomWidth: 0 }
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => toggleAccordion(strat.id)}
                    activeOpacity={0.7}
                    style={styles.accordionHeaderClickableRow}
                  >
                    <View
                      style={[
                        styles.strategyIconBackgroundSquareBadge,
                        { backgroundColor: COLORS.iconBgs[bgIdx] }
                      ]}
                    >
                      <Feather
                        name={strat.icon}
                        size={18}
                        color={COLORS.iconColors[bgIdx]}
                      />
                    </View>

                    <View style={styles.strategyTitleContentFlexibleColumn}>
                      <Text style={[styles.strategyMainTitleHeaderLabel, { color: COLORS.textDark }]}>
                        {strat.title}
                      </Text>
                      {!isExpanded && (
                        <Text
                          numberOfLines={1}
                          style={[styles.strategyCollapsedInlinePreviewText, { color: COLORS.textLight }]}
                        >
                          {strat.description}
                        </Text>
                      )}
                    </View>

                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={COLORS.textLight}
                      style={styles.accordionToggleArrowIcon}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.accordionBodyExpandedContentBlock}>
                      <Text style={[styles.strategyDetailedParagraphDescriptionBody, { color: COLORS.textLight }]}>
                        {strat.description}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Callout Action Block */}
          <View style={[styles.strugglingAdvisoryBox, { borderColor: COLORS.border }]}>
            <Text style={[styles.strugglingHeadingText, { color: COLORS.textDark }]}>Still struggling to sleep?</Text>
            <Text style={[styles.strugglingSubtitleText, { color: COLORS.textLight }]}>
              Our wellbeing professional can talk to you and help you take the first step.
            </Text>
            
            <TouchableOpacity 
              style={[styles.indigoFirstAidCTAButton, { backgroundColor: COLORS.buttonCTA }]}
              activeOpacity={0.85}
              onPress={() => router.push("/sleepFirstAidDetails")}
            >
              <Feather name="headphones" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.indigoFirstAidCTAButtonText}>Get Sleep First Aid</Text>
            </TouchableOpacity>
          </View>

        </View>
      </AnimatedRE.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainerWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContentLayout: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  desktopWidthConstraint: {
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
    marginTop: 20,
    borderRadius: 36,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.90)",
  },
  mainMasterCardContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 3,
  },
  headerActionRowBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    height: 48,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topNavigationTitleText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  illustrationHeroCenteredBlock: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
    width: "100%",
  },
  imageBackgroundWrapperBox: {
    backgroundColor: "rgba(91, 70, 229, 0.08)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Explicit full layout width block matching parent constraint bounds
  },
  // ✅ INCREASED IMAGE SIZE TO FILL THE CONTAINER COMPONENT ACCORDING TO REQUIREMENTS
  heroCloudyImageGraphics: {
    width: isDesktop ? 380 : screenWidth * 0.88, 
    height: isDesktop ? 220 : screenWidth * 0.52,
  },
  introductoryTextGroupPanel: {
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  primaryMainHeadingHeadline: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  secondaryParagraphBodySubtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  strategiesStackContainerCard: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  strategiesSectionInnerTitleHeader: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 16,
    paddingHorizontal: 4,
    letterSpacing: -0.1,
  },
  accordionTileWrapperItem: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 35, 29, 0.05)",
    paddingVertical: 14,
  },
  accordionHeaderClickableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  strategyIconBackgroundSquareBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  strategyTitleContentFlexibleColumn: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  strategyMainTitleHeaderLabel: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  strategyCollapsedInlinePreviewText: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  accordionToggleArrowIcon: {
    padding: 2,
  },
  accordionBodyExpandedContentBlock: {
    paddingLeft: 56, 
    paddingRight: 6,
    marginTop: 6,
    paddingBottom: 2,
  },
  strategyDetailedParagraphDescriptionBody: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
  },
  strugglingAdvisoryBox: {
    backgroundColor: "#F7F6FB", 
    borderRadius: 24,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  strugglingHeadingText: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  strugglingSubtitleText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    marginBottom: 16,
  },
  indigoFirstAidCTAButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  indigoFirstAidCTAButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  blurredLiquidSphere1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.secondary, 
    opacity: 0.16,
    top: '5%',
    left: -80,
    ...Platform.select({ web: { filter: 'blur(75px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere2: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.primary, 
    opacity: 0.12,
    bottom: '20%',
    right: -100,
    ...Platform.select({ web: { filter: 'blur(90px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.darkSienna, 
    opacity: 0.14,
    top: '40%',
    left: '25%',
    ...Platform.select({ web: { filter: 'blur(70px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere4: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.secondary, 
    opacity: 0.12,
    top: '25%',
    right: -50,
    ...Platform.select({ web: { filter: 'blur(80px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere5: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: COLORS.primary, 
    opacity: 0.12,
    bottom: '45%',
    left: -60,
    ...Platform.select({ web: { filter: 'blur(75px)' } }),
    zIndex: 0,
  },
  blurredLiquidSphere6: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.darkSienna, 
    opacity: 0.10,
    bottom: '5%',
    left: '40%',
    ...Platform.select({ web: { filter: 'blur(85px)' } }),
    zIndex: 0,
  },
});