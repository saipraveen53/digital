import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isDesktop = screenWidth >= 768;

const COLORS = {
  background: "#FAF9F5",      // Crisp warm minimalist cream theme matching Image-2
  textDark: "#101B42",        // Deep Midnight Navy text
  textSlate: "#565D7A",       // Elegant body slate
  cardYellow: "#FFF9E6",      // Light warm yellow accent container for info box
  primaryButton: "#5B46E5",   // Premium Indigo Blue matching the Book Now button
  accentGreen: "#336956",     // Green highlight color for checklist indicators
  border: "rgba(16, 27, 66, 0.05)",
  sphereColors: ["#E09643", "#5B46E5", "#336956", "#101B42"],
};

export default function SleepFirstAidDetails() {
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Multicolored fluid background spheres animation matching Image-2 style guidelines
  const ballStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [0, -220]) }],
  }));
  const ballStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [140, -110]) }],
  }));
  const ballStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [-60, -390]) }],
  }));
  const ballStyle4 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [180, -80]) }],
  }));

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Multiple Colored Background Blobs / Balls */}
      <Animated.View style={[styles.blurredSphere1, ballStyle1]} />
      <Animated.View style={[styles.blurredSphere2, ballStyle2]} />
      <Animated.View style={[styles.blurredSphere3, ballStyle3]} />
      <Animated.View style={[styles.blurredSphere4, ballStyle4]} />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/sleepFirstAid")}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Get Sleep First Aid</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.contentCard, isDesktop && styles.desktopConstraint]}>
          
          {/* Main Illustration from consult.png */}
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/consult.png")}
              style={styles.consultImage}
              resizeMode="contain"
            />
          </View>

          {/* Heading Description Blocks */}
          <Text style={styles.mainTitle}>Talk to a Wellbeing Professional</Text>
          <Text style={styles.subtitleText}>
            A 30-minute non-clinical support session to help you understand and improve your sleep.
          </Text>

          {/* Highlight Specifications Card Panel */}
          <View style={styles.specificationHighlightCard}>
            <View style={styles.specRow}>
              <Feather name="clock" size={18} color={COLORS.primaryButton} style={styles.specIcon} />
              <Text style={styles.specText}>Duration: <Text style={styles.boldLabel}>30 Minutes</Text></Text>
            </View>
            <View style={styles.specRow}>
              <Feather name="phone" size={18} color={COLORS.primaryButton} style={styles.specIcon} />
              <Text style={styles.specText}>Mode: <Text style={styles.boldLabel}>WhatsApp Call</Text></Text>
            </View>
            {/*<View style={styles.specRow}>
              <Text style={[styles.currencySymbolCustom, { color: COLORS.primaryButton }]}>₹</Text>
              <Text style={styles.specText}>Fee: <Text style={styles.boldLabel}>₹500 per session</Text></Text>
            </View>*/}
            <View style={styles.specRow}>
              <Feather name="shield" size={18} color={COLORS.primaryButton} style={styles.specIcon} />
              <Text style={styles.specText}>Non-clinical support & guidance</Text>
            </View>
          </View>

          {/* Checklist Expectations Section */}
          <Text style={styles.expectationsHeader}>What you can expect</Text>
          
          <View style={styles.checklistContainer}>
            <View style={styles.checkRow}>
              <Feather name="check-circle" size={18} color={COLORS.accentGreen} style={styles.checkIcon} />
              <Text style={styles.checklistBodyText}>Understand what may be affecting your sleep</Text>
            </View>
            <View style={styles.checkRow}>
              <Feather name="check-circle" size={18} color={COLORS.accentGreen} style={styles.checkIcon} />
              <Text style={styles.checklistBodyText}>Learn practical sleep hygiene strategies</Text>
            </View>
            <View style={styles.checkRow}>
              <Feather name="check-circle" size={18} color={COLORS.accentGreen} style={styles.checkIcon} />
              <Text style={styles.checklistBodyText}>Explore stress, worries or routines that impact sleep</Text>
            </View>
            <View style={styles.checkRow}>
              <Feather name="check-circle" size={18} color={COLORS.accentGreen} style={styles.checkIcon} />
              <Text style={styles.checklistBodyText}>Guidance on next steps if further support is needed</Text>
            </View>
          </View>

          {/* Book Now Core Call-To-Action Button Row */}
          <TouchableOpacity
            style={styles.bookNowCTAButton}
            activeOpacity={0.9}
            onPress={() => router.push("/consultation")}
          >
            <Text style={styles.bookNowCTAButtonText}>Book Now</Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" style={styles.arrowIconCTA} />
          </TouchableOpacity>

        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  desktopConstraint: {
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
  },
  contentCard: {
    flex: 1,
    paddingHorizontal: 24,
    zIndex: 3,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    width: "100%",
  },
  consultImage: {
    width: "100%",
    height: 200,
  },
  mainTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textSlate,
    lineHeight: 20,
    fontWeight: "500",
    marginBottom: 20,
  },
  specificationHighlightCard: {
    backgroundColor: COLORS.cardYellow,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(224, 150, 67, 0.1)",
    gap: 14,
    marginBottom: 24,
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  specIcon: {
    marginRight: 12,
    width: 20,
    textAlign: "center",
  },
  currencySymbolCustom: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 12,
    width: 20,
    textAlign: "center",
  },
  specText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  boldLabel: {
    fontWeight: "700",
  },
  expectationsHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
    textTransform: "capitalize",
    marginBottom: 16,
  },
  checklistContainer: {
    gap: 16,
    marginBottom: 32,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkIcon: {
    marginRight: 12,
    marginTop: 1,
  },
  checklistBodyText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSlate,
    lineHeight: 20,
    fontWeight: "600",
  },
  bookNowCTAButton: {
    backgroundColor: COLORS.primaryButton,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: COLORS.primaryButton,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  bookNowCTAButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  arrowIconCTA: {
    position: "absolute",
    right: 20,
  },
  // Multi-colored decorative layout circles supporting parallax fluid depth mapping
  blurredSphere1: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.sphereColors[0],
    opacity: 0.12,
    top: "12%",
    left: -60,
    ...Platform.select({ web: { filter: "blur(70px)" } }),
    zIndex: 0,
  },
  blurredSphere2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.sphereColors[1],
    opacity: 0.08,
    bottom: "15%",
    right: -80,
    ...Platform.select({ web: { filter: "blur(85px)" } }),
    zIndex: 0,
  },
  blurredSphere3: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.sphereColors[2],
    opacity: 0.10,
    top: "45%",
    right: -40,
    ...Platform.select({ web: { filter: "blur(65px)" } }),
    zIndex: 0,
  },
  blurredSphere4: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.sphereColors[3],
    opacity: 0.06,
    bottom: "40%",
    left: -40,
    ...Platform.select({ web: { filter: "blur(60px)" } }),
    zIndex: 0,
  },
});