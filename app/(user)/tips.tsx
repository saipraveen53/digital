// app/(user)/tips.tsx
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Animated as RNAnimated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../context/AuthContext";
import { rootApi } from "../utils/axiosInstance";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isDesktop = screenWidth >= 768;

// Custom Burnt Sienna specifications configuration template palette
const COLORS = {
  background: "#F5F5DC",      // Soft cream beige background tone[cite: 14]
  cardBg: "rgba(255, 255, 255, 0.85)", // Glassmorphic translucent container base[cite: 14]
  textDark: "#4A231A",       // Deep rich warm slate clay[cite: 14]
  textLight: "#8C665C",      // Elegant sienna muted tone[cite: 14]
  primary: "#E35336",        // Vibrant dominant terracotta sienna[cite: 14]
  secondary: "#F4A460",      // Smooth sand sandy orange[cite: 14]
  darkSienna: "#A0522D",     // Luxury dark solid earth border[cite: 14]
  border: "rgba(160, 82, 45, 0.12)", // Elegant border link tint[cite: 14]
  
  // Dynamic Gauge Color Sync Track Tones
  excellent: "#0E9F9D",      
  balanced: "#F59E0B",       // Active amber indicator[cite: 14]
  critical: "#EF4444",       // Warning recovery required alert[cite: 14]
};

// Interface reflecting the new /api/tips schema structural design
interface TipItem {
  status: boolean;
  tipDescription: string;
  tipId: string;
  tipName: string;
  tipScore: number;
}

// Interface reflecting /tiplogs/{userId} schema structural design
interface TipLogItem {
  tipLogId: string;
  tipId: string;
  tipName: string;
  scoreChange: number;
  appliedAt: string;
}

interface UserScoreData {
  userId: string;
  wellScoreId: string;
  currentScore: number;
  updatedAt: string;
}

export default function TipsScreen() {
  const { user } = useAuth();
  const [tipsList, setTipsList] = useState<TipItem[]>([]);
  const [tipLogs, setTipLogs] = useState<TipLogItem[]>([]);
  const [scoreData, setScoreData] = useState<UserScoreData | null>(null);

  // UI Loading and Interaction States
  const [globalLoading, setGlobalLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showLogsOverlay, setShowLogsOverlay] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Native Animated Value for Drag down dismissal tracking mechanics
  const panY = useRef(new RNAnimated.Value(0)).current;

  // Reanimated Shared Animation Tokens
  const scrollY = useSharedValue(0);
  const waveOffset1 = useSharedValue(0);
  const waveOffset2 = useSharedValue(0);
  const waveBounce = useSharedValue(0);

  const userId = user?.id || "";
  const scorePercentage = scoreData ? scoreData.currentScore : 0;

  // PanResponder gesture monitoring context registration
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger dragging logic if pull direction vectors point downward
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          // Complete dismiss sequence transition down to floor metrics
          RNAnimated.timing(panY, {
            toValue: screenHeight,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setShowLogsOverlay(false);
            panY.setValue(0);
          });
        } else {
          // Snap back structural framework back up to base anchor location
          RNAnimated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  // Dynamic Gauge Range Color Switcher
  const getGaugeColor = (score: number) => {
    if (score >= 75) return COLORS.excellent;
    if (score >= 45) return COLORS.balanced;
    return COLORS.critical;
  };
  const activeGaugeColor = getGaugeColor(scorePercentage);

  // Scroll Interceptor for 3D Depth
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Loop Continuous Waves Motion Logic
  useEffect(() => {
    waveOffset1.value = withRepeat(
      withTiming(200, { duration: 2200, easing: Easing.linear }),
      -1,
      false,
    );
    waveOffset2.value = withRepeat(
      withTiming(-200, { duration: 2600, easing: Easing.linear }),
      -1,
      false,
    );
    waveBounce.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(-4, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(waveOffset1);
      cancelAnimation(waveOffset2);
      cancelAnimation(waveBounce);
    };
  }, []);

  useEffect(() => {
    if (userId) {
      fetchInitialData();
    }
  }, [userId]);

  const fetchInitialData = async () => {
    setGlobalLoading(true);
    try {
      // 1. Fetch current active tips recommendations via /api/tips
      const tipsRes = await rootApi.get<TipItem[]>("/api/tips");
      setTipsList(tipsRes.data || []);

      // 2. Fetch User Current Score Profile metrics via /user/{userId}
      const scoreRes = await rootApi.get<UserScoreData>(`/user/${userId}`);
      setScoreData(scoreRes.data || null);

      // 3. Fetch history tiplogs metrics to feed the totalcount statcards silently on init
      const logsRes = await rootApi.get<TipLogItem[]>(`/tiplogs/${userId}`);
      setTipLogs(logsRes.data || []);
    } catch (err) {
      console.error("Error fetching core endpoint profiles:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  const fetchHistoryLogs = async () => {
    setLogsLoading(true);
    try {
      // Fetch user specific activation items via /tiplogs/{userId}
      const logsRes = await rootApi.get<TipLogItem[]>(`/tiplogs/${userId}`);
      setTipLogs(logsRes.data || []);
      // Reset position anchor tokens before layout mounts up
      panY.setValue(0);
      setShowLogsOverlay(true);
    } catch (err) {
      console.error("Failed reading user specific history logs array:", err);
      Alert.alert("Error", "Could not sync history data at this time.");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleApplyTip = async (tipId: string, tipName: string) => {
    setActionLoadingId(tipId);
    try {
      // POST Apply verification payload details to /applytip
      await rootApi.post("/applytip", { userId, tipId });

      setSuccessMessage(`"${tipName}" applied into system logs successfully!`);
      setSuccessModalVisible(true);

      // Re-fetch score context and history matrix updates immediately
      const scoreRes = await rootApi.get<UserScoreData>(`/user/${userId}`);
      setScoreData(scoreRes.data || null);

      const logsRes = await rootApi.get<TipLogItem[]>(`/tiplogs/${userId}`);
      setTipLogs(logsRes.data || []);
    } catch (err) {
      console.error("Action payload rejected by remote engine:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- 3D Floating Mesh Orbs Anti-Direction Parallax Styling Engines ---
  const ballStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [0, -240]) },
    ],
  }));

  const ballStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [140, -130]) },
    ],
  }));

  const ballStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [-70, -380]) },
    ],
  }));

  const fluidHeightStyle = useAnimatedStyle(() => {
    // Normalizing percentage to make sure liquid doesn't overflow completely out of borders
    const boundedScore = Math.min(Math.max(scorePercentage, 0), 100);
    return {
      height: withTiming(`${boundedScore}%`, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      }),
    };
  });

  const animatedWave1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: waveOffset1.value },
      { translateY: waveBounce.value },
    ],
  }));

  const animatedWave2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: waveOffset2.value },
      { translateY: -waveBounce.value },
    ],
  }));

  if (globalLoading) {
    return (
      <View style={[styles.centerSpinnerWrapper, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingProgressMessageText, { color: COLORS.textDark }]}>
          Aligning wellbeing structures...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* 3D Hardware Accelerated Anti-Direction Floating Blur Spheres */}
      <Animated.View style={[styles.blurredLiquidSphere1, ballStyle1]} />
      <Animated.View style={[styles.blurredLiquidSphere2, ballStyle2]} />
      <Animated.View style={[styles.blurredLiquidSphere3, ballStyle3]} />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContentLayoutEngine}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveBentoConstraintWrapper}>
          <View style={styles.headingDescriptionRowFlex}>
            <Text style={[styles.metaSubtleInformationParagraphText, { color: COLORS.textLight }]}>
              Personalized by role, age, wellbeing score, and recent activity
              patterns.
            </Text>

            {/* Unified History Action Module */}
            <TouchableOpacity
              style={styles.historyLogTriggerAnchorButton}
              activeOpacity={0.7}
              onPress={fetchHistoryLogs}
              disabled={logsLoading}
            >
              {logsLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Feather
                    name="clock"
                    size={14}
                    color={COLORS.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.historyLogTriggerAnchorButtonText, { color: COLORS.primary }]}>
                    View History Logs
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* --- ULTRA COLORFUL STAT CARDS SECTION --- */}
          <View style={styles.statCardsContainer}>
            {/* Card 1: Active Tips */}
            <View style={[styles.statCardItem, styles.statCardTealVariant]}>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: "rgba(227, 83, 54, 0.12)" },
                ]}
              >
                <Feather name="list" size={18} color={COLORS.primary} />
              </View>
              <Text style={[styles.statCardValue, { color: COLORS.textDark }]}>
                {tipsList.length}
              </Text>
              <Text style={[styles.statCardLabel, { color: COLORS.textLight }]}>
                Active Tips
              </Text>
            </View>

            {/* Card 2: Total Actions */}
            <View style={[styles.statCardItem, styles.statCardIndigoVariant]}>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: "rgba(244, 164, 96, 0.12)" },
                ]}
              >
                <Feather name="check-square" size={18} color={COLORS.secondary} />
              </View>
              <Text style={[styles.statCardValue, { color: COLORS.textDark }]}>
                {tipLogs.length}
              </Text>
              <Text style={[styles.statCardLabel, { color: COLORS.textLight }]}>
                Total Actions
              </Text>
            </View>

            {/* Card 3: Current Score */}
            <View style={[styles.statCardItem, styles.statCardPurpleVariant]}>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: "rgba(160, 82, 45, 0.12)" },
                ]}
              >
                <Feather name="activity" size={18} color={COLORS.darkSienna} />
              </View>
              <Text style={[styles.statCardValue, { color: COLORS.textDark }]}>
                {scorePercentage}%
              </Text>
              <Text style={[styles.statCardLabel, { color: COLORS.textLight }]}>
                Current Score
              </Text>
            </View>
          </View>

          {/* --- TOP MATRIX METER CARD: CIRCULAR FLUID DISPLAY --- */}
          <View style={styles.wellbeingGaugeBentoCard}>
            <Text style={[styles.gaugeSectionSmallHeaderTitleText, { color: COLORS.textLight }]}>
              Current wellbeing
            </Text>

            <View style={[styles.fluidCircleMeterRingFrameOuter, { borderColor: "rgba(160, 82, 45, 0.15)" }]}>
              <View style={styles.fluidCircleContainerOverflowClipHiddenLayer}>
                <Animated.View
                  style={[
                    styles.fluidLiquidBaseFillTrack,
                    fluidHeightStyle,
                    { backgroundColor: activeGaugeColor },
                  ]}
                >
                  <Animated.View
                    style={[
                      animatedWave2,
                      styles.fluidWaveMicroRibbon,
                      { backgroundColor: "rgba(255,255,255,0.25)", top: -14 },
                    ]}
                  />
                  <Animated.View
                    style={[
                      animatedWave1,
                      styles.fluidWaveMicroRibbon,
                      { backgroundColor: "rgba(255,255,255,0.18)", top: -10 },
                    ]}
                  />
                </Animated.View>
              </View>

              <View style={styles.gaugeForegroundAbsoluteCenterLabelsStack}>
                <Text
                  style={[styles.gaugePercentagePrimaryValueDisplayValueText, { color: COLORS.textDark }]}
                >
                  {scorePercentage}%
                </Text>
              </View>
            </View>
          </View>

          {/* --- BOTTOM SECTION: SUGGESTED RECOMMENDATION CARDS FEED LAYOUT --- */}
          <View style={styles.tipsFeedCardsListStackContainer}>
            {tipsList.length === 0 ? (
              <View style={styles.emptyFeedFallbackCardLayout}>
                <Feather
                  name="sun"
                  size={28}
                  color={COLORS.textLight}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.emptyFeedFallbackCardLayoutText, { color: COLORS.textLight }]}>
                  All recommended task items completed for today!
                </Text>
              </View>
            ) : (
              tipsList.map((item, idx) => (
                <View
                  key={item.tipId || idx}
                  style={styles.premiumTipDescriptionTileCardItem}
                >
                  <Text style={[styles.tipCardBadgeCounterText, { color: COLORS.primary }]}>
                    Tip {idx + 1}
                  </Text>
                  <Text style={[styles.tipCardMainTitleText, { color: COLORS.textDark }]}>
                    {item.tipName}
                  </Text>

                  <Text
                    style={[
                      styles.tipCardExpectedGainValueText,
                      { color: activeGaugeColor },
                    ]}
                  >
                    Suggested gain: +{item.tipScore}%
                  </Text>

                  <Text style={[styles.tipCardStaticDescriptionParaText, { color: COLORS.textLight }]}>
                    {item.tipDescription ||
                      "Applying this targeted recovery break counters active burnout, cuts rumination, and lowers the chance of slipping into fatigue."}
                  </Text>

                  <TouchableOpacity
                    style={[styles.applyActionButtonCTA, { backgroundColor: COLORS.primary }]}
                    activeOpacity={0.8}
                    onPress={() => handleApplyTip(item.tipId, item.tipName)}
                    disabled={actionLoadingId !== null}
                  >
                    {actionLoadingId === item.tipId ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Feather
                          name="check"
                          size={16}
                          color="white"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.applyActionButtonCTAText}>
                          I do this
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* OVERLAY PANEL MODAL SHEET WINDOW: /tiplogs/{userId} RESPONSE DISPLAY VIEW WITH PAN GESTURE DISMISS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLogsOverlay}
        onRequestClose={() => setShowLogsOverlay(false)}
      >
        <View style={styles.modalSheetBlurOverlayDimmer}>
          <RNAnimated.View
            style={[
              styles.modalInteractiveSheetContainer,
              { transform: [{ translateY: panY }] },
            ]}
          >
            {/* Aesthetic Top Notch for Drawer Feel - Acting as Pan Handler Target Zone */}
            <View
              style={styles.modalTopIndicatorHandle}
              {...panResponder.panHandlers}
            />

            <View
              style={styles.modalHeaderRowLayout}
              {...panResponder.panHandlers}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={[styles.modalTitleIconContainer, { backgroundColor: COLORS.primary }]}>
                  <Feather name="activity" size={18} color="white" />
                </View>
                <Text style={[styles.modalSheetMainTitle, { color: COLORS.textDark }]}>
                  Applied History Logs
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseCircleButton}
                onPress={() => setShowLogsOverlay(false)}
              >
                <Feather name="x" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
            >
              {tipLogs.length === 0 ? (
                <View style={styles.emptyLogsContainer}>
                  <Feather
                    name="folder-minus"
                    size={40}
                    color={COLORS.textLight}
                    style={{ marginBottom: 12, opacity: 0.6 }}
                  />
                  <Text style={[styles.emptyLogsFallbackText, { color: COLORS.textLight }]}>
                    No items found in your history log matrix.
                  </Text>
                </View>
              ) : (
                tipLogs.map((log, index) => (
                  <View
                    key={log.tipLogId || index}
                    style={styles.logHistoryHorizontalItemTile}
                  >
                    {/* Left Colored Accent Bar to make it colorful */}
                    <View style={[styles.logTileLeftAccentIndicator, { backgroundColor: COLORS.primary }]} />

                    <View style={styles.logTileIconBadge}>
                      <Feather
                        name="check"
                        size={14}
                        color={COLORS.excellent}
                      />
                    </View>

                    <View style={{ flex: 1, paddingLeft: 4 }}>
                      <Text
                        style={[styles.logHistoryItemTitleMainText, { color: COLORS.textDark }]}
                        numberOfLines={1}
                      >
                        {log.tipName}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <Feather
                          name="calendar"
                          size={10}
                          color={COLORS.textLight}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.logHistoryItemTimestampSubtext, { color: COLORS.textLight }]}>
                          {log.appliedAt
                            ? new Date(log.appliedAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Applied Today"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.scoreImpactBadgeContainer}>
                      <Text style={styles.logHistoryItemScoreImpactBadgeText}>
                        +{log.scoreChange || 20}%
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </RNAnimated.View>
        </View>
      </Modal>

      {/* ACTION STATUS FEEDBACK POPUP DISMISS WINDOW PANEL MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalCenterDimmerView}>
          <View style={styles.modalSuccessAlertCard}>
            <View style={[styles.modalSuccessCheckCircleIconBadge, { backgroundColor: '#22C55E' }]}>
              <Feather name="check-circle" size={36} color="white" />
            </View>
            <Text style={[styles.modalSuccessAlertHeadingMainText, { color: COLORS.textDark }]}>
              Action Registered
            </Text>
            <Text style={[styles.modalSuccessAlertBodyParagraphText, { color: COLORS.textLight }]}>
              {successMessage}
            </Text>
            <TouchableOpacity
              style={[styles.modalDismissCTAButton, { backgroundColor: COLORS.primary }]}
              activeOpacity={0.8}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalDismissCTAButtonText}>Awesome</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerSpinnerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingProgressMessageText: {
    marginTop: 12,
    fontWeight: "600",
    fontSize: 14,
  },
  // Anti-Directional Smooth 3D Ambient Mesh Elements
  blurredLiquidSphere1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondary,
    opacity: 0.25,
    top: '12%',
    left: -60,
    ...Platform.select({
      web: { filter: 'blur(70px)' },
    }),
    zIndex: 0,
  },
  blurredLiquidSphere2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primary,
    opacity: 0.14,
    bottom: '25%',
    right: -90,
    ...Platform.select({
      web: { filter: 'blur(85px)' },
    }),
    zIndex: 0,
  },
  blurredLiquidSphere3: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: COLORS.darkSienna,
    opacity: 0.18,
    top: '48%',
    left: '30%',
    ...Platform.select({
      web: { filter: 'blur(75px)' },
    }),
    zIndex: 0,
  },
  scrollContentLayoutEngine: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },
  responsiveBentoConstraintWrapper: {
    maxWidth: isDesktop ? 1200 : "100%",
    width: "100%",
    alignSelf: "center",
    zIndex: 3,
  },
  headingDescriptionRowFlex: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  metaSubtleInformationParagraphText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  historyLogTriggerAnchorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(160, 82, 45, 0.15)",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.darkSienna,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  historyLogTriggerAnchorButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  statCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
    gap: 12,
  },
  statCardItem: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.darkSienna,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  statCardTealVariant: {
    backgroundColor: "rgba(227, 83, 54, 0.04)",
    borderColor: "rgba(227, 83, 54, 0.15)",
  },
  statCardIndigoVariant: {
    backgroundColor: "rgba(244, 164, 96, 0.04)",
    borderColor: "rgba(244, 164, 96, 0.15)",
  },
  statCardPurpleVariant: {
    backgroundColor: "rgba(160, 82, 45, 0.04)",
    borderColor: "rgba(160, 82, 45, 0.15)",
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  wellbeingGaugeBentoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 32,
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.darkSienna,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      },
      android: { elevation: 2 },
    }),
    zIndex: 2,
  },
  gaugeSectionSmallHeaderTitleText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 24,
  },
  fluidCircleMeterRingFrameOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 5,
    backgroundColor: "#FAFAFA",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  fluidCircleContainerOverflowClipHiddenLayer: {
    width: "100%",
    height: "100%",
    borderRadius: 85,
    overflow: "hidden",
    position: "absolute",
  },
  fluidLiquidBaseFillTrack: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  fluidWaveMicroRibbon: {
    position: "absolute",
    width: screenWidth * 1.5,
    height: 30,
    borderRadius: 45,
    left: -screenWidth * 0.25,
  },
  gaugeForegroundAbsoluteCenterLabelsStack: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  gaugePercentagePrimaryValueDisplayValueText: {
    fontSize: 44,
    fontWeight: "900",
    textShadowColor: "rgba(255, 255, 255, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
  },
  tipsFeedCardsListStackContainer: {
    zIndex: 3,
  },
  emptyFeedFallbackCardLayout: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyFeedFallbackCardLayoutText: {
    fontSize: 14,
    textAlign: "center",
  },
  premiumTipDescriptionTileCardItem: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.darkSienna,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  tipCardBadgeCounterText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  tipCardMainTitleText: {
    fontSize: 22,
    fontWeight: "800",
  },
  tipCardExpectedGainValueText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 14,
  },
  tipCardStaticDescriptionParaText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  applyActionButtonCTA: {
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  applyActionButtonCTAText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  modalSheetBlurOverlayDimmer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(74, 35, 26, 0.4)", // Dimmed overlay matching sienna context profile tint
  },
  modalInteractiveSheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: screenHeight * 0.75,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.darkSienna,
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),
  },
  modalTopIndicatorHandle: {
    width: 38,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
    paddingVertical: 4,
  },
  modalHeaderRowLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitleIconContainer: {
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  modalSheetMainTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modalCloseCircleButton: {
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 24,
  },
  emptyLogsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyLogsFallbackText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  logHistoryHorizontalItemTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF9F5", // Warm light tinted tile container background
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(160, 82, 45, 0.08)",
    position: "relative",
    overflow: "hidden",
  },
  logTileLeftAccentIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  logTileIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(14, 159, 157, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginLeft: 4,
  },
  logHistoryItemTitleMainText: {
    fontSize: 15,
    fontWeight: "700",
  },
  logHistoryItemTimestampSubtext: {
    fontSize: 12,
  },
  scoreImpactBadgeContainer: {
    backgroundColor: "rgba(14, 159, 157, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  logHistoryItemScoreImpactBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0E9F9D",
  },
  modalCenterDimmerView: {
    flex: 1,
    backgroundColor: "rgba(74, 35, 26, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalSuccessAlertCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  modalSuccessCheckCircleIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalSuccessAlertHeadingMainText: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  modalSuccessAlertBodyParagraphText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  modalDismissCTAButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  modalDismissCTAButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
});