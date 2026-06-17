// app/(user)/trends.tsx
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppAnimated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { rootApi } from "../utils/axiosInstance";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isDesktop = screenWidth >= 768;

// Exact color codes matching image_accbb1.png sienna design matrix specifications
const COLORS = {
  background: "#F5F5DC",      // Smooth cream beige background tone
  cardBg: "rgba(255, 255, 255, 0.85)",  // Premium translucent frosted glass profile
  textDark: "#4A231A",       // Deep warm charcoal clay
  textLight: "#8C665C",      // Muted sienna slate text
  primary: "#E35336",        // Dominant burnt sienna hue decorator
  secondary: "#F4A460",      // Balanced dynamic sandy orange tone
  darkSienna: "#A0522D",     // Luxury solid block border accent
  border: "rgba(160, 82, 45, 0.12)",
  chartTrack: "rgba(160, 82, 45, 0.08)"
};

interface ActivityLast7DaysResponse {
  date: string;
  totalPercentage: number;
}

interface DayTrend {
  dayName: string;
  displayDay: string;
  score: number;
}

interface BannerData {
  bannerId: string;
  name: string;
  description: string;
}

interface ApiActivityItem {
  activityId: string;
  activityName: string;
  activityType: "DRAIN" | "RECOVERY";
  activityPercenage: number;
  status: boolean;
  createdAt: string;
}

interface RecentActivityLog {
  activityLogId: string;
  activityName: string;
  activityType: "RECOVERY" | "DRAIN";
  completedAt: string;
  scoreChange: number;
}

function ChartBarItem({ score, label }: { score: number; label: string }) {
  const barHeight = useSharedValue(0);

  useEffect(() => {
    const targetHeight = (score / 100) * 160;
    barHeight.value = withTiming(targetHeight, { duration: 600 });
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return (
    <View style={styles.chartSingleColumnFlexTrack}>
      <View style={styles.chartBarCapsuleTrackBg}>
        <AppAnimated.View
          style={[styles.chartBarCapsuleFilledValue, animatedStyle]}
        />
      </View>
      <Text style={styles.chartColumnLabelDayText}>{label}</Text>
    </View>
  );
}

export default function TrendsScreen() {
  const [weeklyTrends, setWeeklyTrends] = useState<DayTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [peakScore, setPeakScore] = useState(0);
  const [weeklyAvg, setWeeklyAvg] = useState(0);

  // Stats Counters State
  const [statsData, setStatsData] = useState({
    totalActivities: 0,
    drainActivities: 0,
    recoveryActivities: 0,
    recentLogsCount: 0,
  });

  // Dynamic Banner State
  const [banner, setBanner] = useState<BannerData | null>(null);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    fetchTrendAndStatsData();
  }, []);

  const fetchTrendAndStatsData = async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const trendResponse = await rootApi.get<ActivityLast7DaysResponse[]>(
        "/api/user/activities/last-7-days",
      );
      const apiData = trendResponse.data || [];

      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const fullDaysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      if (apiData.length > 0) {
        const scores = apiData.map((item) => item.totalPercentage);
        const max = Math.max(...scores);
        const avg = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length,
        );
        setPeakScore(max);
        setWeeklyAvg(avg);
      }

      const formattedTrends: DayTrend[] = apiData.map((item) => {
        const parsedDate = new Date(item.date + "T00:00:00");
        return {
          dayName: !isNaN(parsedDate.getTime())
            ? fullDaysOfWeek[parsedDate.getDay()]
            : item.date,
          displayDay: !isNaN(parsedDate.getTime())
            ? daysOfWeek[parsedDate.getDay()]
            : item.date,
          score: Math.min(Math.max(item.totalPercentage, 0), 100),
        };
      });
      setWeeklyTrends(formattedTrends);

      const [
        totalActRes,
        drainActRes,
        recoveryActRes,
        recentLogsRes,
        bannerRes,
      ] = await Promise.all([
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities"),
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities", {
          params: { activityType: "DRAIN" },
        }),
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities", {
          params: { activityType: "RECOVERY" },
        }),
        rootApi.get<RecentActivityLog[]>("/api/user/recent-activities"),
        rootApi.get<BannerData[]>("/api/banner/all"),
      ]);

      setStatsData({
        totalActivities: totalActRes.data?.length || 0,
        drainActivities: drainActRes.data?.length || 0,
        recoveryActivities: recoveryActRes.data?.length || 0,
        recentLogsCount: recentLogsRes.data?.length || 0,
      });

      if (bannerRes.data && bannerRes.data.length > 0) {
        setBanner(bannerRes.data[0]);
      }
    } catch (err) {
      console.error(
        "Network failure pulling trends metrics package details:",
        err,
      );
      setWeeklyTrends([]);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // --- Dynamic 3D Parallax Coordinate Anti-Direction Motion Configurations ---
  const dynamicBallStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [0, -200]) },
    ],
  }));

  const dynamicBallStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [140, -140]) },
    ],
  }));

  const dynamicBallStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [-80, -360]) },
    ],
  }));

  if (loading || statsLoading) {
    return (
      <View style={[styles.spinnerCenterContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.spinnerText, { color: COLORS.textDark }]}>Compiling Trend Matrix Logs...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* 3D BLURRED LAYER GLOW BALANCER TARGETS */}
      <AppAnimated.View style={[styles.blurredLiquidSphere1, dynamicBallStyle1]} />
      <AppAnimated.View style={[styles.blurredLiquidSphere2, dynamicBallStyle2]} />
      <AppAnimated.View style={[styles.blurredLiquidSphere3, dynamicBallStyle3]} />

      <AppAnimated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollLayoutContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveBentoConstraint}>
          <Text style={[styles.screenMainTitleHeading, { color: COLORS.textDark }]}>7-Day Trend</Text>
          <Text style={[styles.screenSubtitleDescriptionText, { color: COLORS.textLight }]}>
            Track how your activities shape psychological wellbeing over the
            week.
          </Text>

          {/* DYNAMIC STATCARDS ROW PANEL DESIGNED WITH REAL-TIME LENGTH COUNTS */}
          <View
            style={[
              styles.statsCardGridRowContainer,
              { flexDirection: isDesktop ? "row" : "column" },
            ]}
          >
            <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.primary }]}>
              <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(223, 83, 54, 0.08)" }]}>
                <Feather name="layers" size={16} color={COLORS.primary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.statMiniCardLabel}>Total Created</Text>
                <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                  {statsData.totalActivities}
                </Text>
              </View>
            </View>

            <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.darkSienna }]}>
              <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(160, 82, 45, 0.08)" }]}>
                <Feather name="trending-down" size={16} color={COLORS.darkSienna} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.statMiniCardLabel}>Drain Items</Text>
                <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                  {statsData.drainActivities}
                </Text>
              </View>
            </View>

            <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.secondary }]}>
              <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(244, 164, 96, 0.08)" }]}>
                <Feather name="trending-up" size={16} color={COLORS.secondary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.statMiniCardLabel}>Recovery Items</Text>
                <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                  {statsData.recoveryActivities}
                </Text>
              </View>
            </View>

            <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.textLight }]}>
              <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(140, 102, 92, 0.08)" }]}>
                <Feather name="clock" size={16} color={COLORS.textLight} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.statMiniCardLabel}>Recent History</Text>
                <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                  {statsData.recentLogsCount}
                </Text>
              </View>
            </View>
          </View>

          {/* ATTRACTIVE DYNAMIC PROMOTIONAL HERO BANNER BLOCK DISPLAY */}
          {banner && (
            <LinearGradient
              colors={["rgba(227, 83, 54, 0.09)", "rgba(244, 164, 96, 0.06)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.premiumBannerContainerCard, { borderColor: COLORS.border }]}
            >
              <View style={styles.bannerHeaderFlexRow}>
                <View style={[styles.bannerBadgeWrapper, { backgroundColor: "rgba(227, 83, 54, 0.12)" }]}>
                  <Feather name="sparkles" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.bannerBadgeInnerText, { color: COLORS.primary }]}>
                    System Spotlight
                  </Text>
                </View>
                <Text style={[styles.bannerIdBadgeLabel, { color: COLORS.textLight }]}>
                  {banner.bannerId}
                </Text>
              </View>
              <Text style={[styles.bannerHeadlineMainTitle, { color: COLORS.textDark }]}>
                {banner.name}
              </Text>
              <Text
                style={[styles.bannerParagraphBodyDescription, { color: COLORS.textLight }]}
                numberOfLines={isDesktop ? 3 : 5}
              >
                {banner.description}
              </Text>
            </LinearGradient>
          )}

          <View style={styles.analyticsHighlightsRow}>
            <View style={[styles.insightMiniCard, { borderLeftColor: COLORS.primary }]}>
              <Feather name="zap" size={16} color={COLORS.primary} />
              <Text style={[styles.insightMiniValue, { color: COLORS.textDark }]}>+{peakScore}%</Text>
              <Text style={[styles.insightMiniLabel, { color: COLORS.textLight }]}>
                Highest Recovery Surge
              </Text>
            </View>
            <View style={[styles.insightMiniCard, { borderLeftColor: COLORS.secondary }]}>
              <Feather name="activity" size={16} color={COLORS.secondary} />
              <Text style={[styles.insightMiniValue, { color: COLORS.textDark }]}>{weeklyAvg}%</Text>
              <Text style={[styles.insightMiniLabel, { color: COLORS.textLight }]}>
                Weekly Median Average
              </Text>
            </View>
          </View>

          {/* HISTOGRAM BAR CHART PANEL */}
          <View style={styles.chartGlassContainerCard}>
            <View style={styles.chartFlexRowGridAlignment}>
              {weeklyTrends.map((item, index) => (
                <ChartBarItem
                  key={index}
                  score={item.score}
                  label={item.displayDay}
                />
              ))}
            </View>
          </View>

          {/* TREND FEED LIST GRID COMPONENT */}
          <View style={styles.listGlassContainerCard}>
            {weeklyTrends.length === 0 ? (
              <Text style={[styles.emptyStateMessageText, { color: COLORS.textLight }]}>
                No activity trends recorded for the current buffer window.
              </Text>
            ) : (
              weeklyTrends.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.listRowTileFlexibleLayout,
                    index === weeklyTrends.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[styles.listRowDayLabelText, { color: COLORS.textDark }]}>
                    {item.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.listRowPercentageValueText,
                      { color: item.score > 0 ? COLORS.primary : COLORS.textLight },
                    ]}
                  >
                    {item.score}%
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </AppAnimated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  spinnerCenterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerText: {
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
  scrollLayoutContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 60,
  },
  responsiveBentoConstraint: {
    maxWidth: isDesktop ? 1200 : "100%",
    width: "100%",
    alignSelf: "center",
  },
  screenMainTitleHeading: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  screenSubtitleDescriptionText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  statsCardGridRowContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 24,
  },
  premiumStatCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statIconBadgeCircle: {
    width: 38,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statMiniCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statMiniCardValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  premiumBannerContainerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  bannerHeaderFlexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bannerBadgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  bannerBadgeInnerText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  bannerIdBadgeLabel: {
    fontSize: 11,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  bannerHeadlineMainTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  bannerParagraphBodyDescription: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  analyticsHighlightsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  insightMiniCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  insightMiniValue: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
  },
  insightMiniLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  chartGlassContainerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16 },
      android: { elevation: 3 },
    }),
    zIndex: 2,
  },
  chartFlexRowGridAlignment: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    height: 170,
    paddingHorizontal: 6,
  },
  chartSingleColumnFlexTrack: {
    alignItems: "center",
    flex: 1,
  },
  chartBarCapsuleTrackBg: {
    width: 26,
    height: 160,
    backgroundColor: COLORS.chartTrack,
    borderRadius: 14,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBarCapsuleFilledValue: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
  },
  chartColumnLabelDayText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "700",
    marginTop: 10,
  },
  listGlassContainerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
    zIndex: 3,
  },
  listRowTileFlexibleLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(160, 82, 45, 0.08)",
  },
  listRowDayLabelText: {
    fontSize: 15,
    fontWeight: "700",
  },
  listRowPercentageValueText: {
    fontSize: 16,
    fontWeight: "900",
  },
  emptyStateMessageText: {
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
});