// app/(user)/trends.tsx
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

const COLORS = {
  background: "#FAF9F5",      
  cardBg: "rgba(255, 255, 255, 0.90)",  
  textDark: "#11231D",       
  textLight: "#576860",      
  primary: "#336956",        
  secondary: "#E09643",      
  darkSienna: "#1B4235",     
  border: "rgba(51, 105, 86, 0.08)",
  chartTrack: "rgba(51, 105, 86, 0.06)"
};

interface ActivityLast7DaysResponse {
  date: string;
  totalPercentage: number;
}

interface DayTrend {
  dayName: string;
  displayDay: string;
  displayDate: string; // Added to capture date underneath day label
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

interface MostRecentActivityResponse {
  mostUsedDrain: string;
  mostUsedRecovery: string;
}

function ChartBarItem({ score, label, date }: { score: number; label: string; date: string }) {
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
      {/* ✅ FIXED: Progress bar data layout matches requested date text element addition */}
      <Text style={styles.chartColumnLabelDateText}>{date}</Text>
    </View>
  );
}

export default function TrendsScreen() {
  const [weeklyTrends, setWeeklyTrends] = useState<DayTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [peakScore, setPeakScore] = useState(0);
  const [weeklyAvg, setWeeklyAvg] = useState(0);
  const [bannerExpanded, setBannerExpanded] = useState(false);

  // ✅ FIXED: New state management setup for handling most recent activities payload mapping
  const [mostRecentActivity, setMostRecentActivity] = useState<MostRecentActivityResponse>({
    mostUsedDrain: "",
    mostUsedRecovery: ""
  });

  const [statsData, setStatsData] = useState({
    totalActivities: 0,
    drainActivities: 0,
    recoveryActivities: 0,
    recentLogsCount: 0,
  });

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
        
        let subDateLabel = "";
        if (!isNaN(parsedDate.getTime())) {
          const year = parsedDate.getFullYear();
          const month = parsedDate.getMonth() + 1;
          const day = parsedDate.getDate();
          subDateLabel = `${day}/${month}`;
        }

        return {
          dayName: !isNaN(parsedDate.getTime())
            ? fullDaysOfWeek[parsedDate.getDay()]
            : item.date,
          displayDay: !isNaN(parsedDate.getTime())
            ? daysOfWeek[parsedDate.getDay()]
            : item.date,
          displayDate: subDateLabel,
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
        mostRecentRes, // Fetching from the specified layout endpoint matrix safely
      ] = await Promise.all([
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities"),
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities", {
          params: { activityType: "DRAIN" },
        }),
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities", {
          params: { activityType: "RECOVERY" },
        }),
        rootApi.get<RecentActivityLog[]>("/api/user/recent-activities"),
        rootApi.get<BannerData[]>("/api/banner/getByStatus?status=true"),
        rootApi.get<MostRecentActivityResponse>("/api/user/mostRecentActivity"),
      ]);

      setStatsData({
        totalActivities: totalActRes.data?.length || 0,
        drainActivities: drainActRes.data?.length || 0,
        recoveryActivities: recoveryActRes.data?.length || 0,
        recentLogsCount: recentLogsRes.data?.length || 0,
      });

      // ✅ FIXED: Sets variables tracking mapped objects directly
      if (mostRecentRes.data) {
        setMostRecentActivity(mostRecentRes.data);
      }

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
            Track how your activities shape psychological wellbeing over the week.
          </Text>

          <View style={styles.statsCardGridRowContainer}>
            <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.primary }]}>
              <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(51, 105, 86, 0.08)" }]}>
                <Feather name="layers" size={16} color={COLORS.primary} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.statMiniCardLabel}>Total Created</Text>
                <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                  {statsData.totalActivities}
                </Text>
              </View>
            </View>

            <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.darkSienna }]}>
              <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(27, 66, 53, 0.08)" }]}>
                <Feather name="trending-down" size={16} color={COLORS.darkSienna} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.statMiniCardLabel}>Drain Items</Text>
                <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                  {statsData.drainActivities}
                </Text>
              </View>
            </View>

            <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.secondary }]}>
              <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(224, 150, 67, 0.08)" }]}>
                <Feather name="trending-up" size={16} color={COLORS.secondary} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.statMiniCardLabel}>Recovery Items</Text>
                <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                  {statsData.recoveryActivities}
                </Text>
              </View>
            </View>

            <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.textLight }]}>
              <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(87, 104, 96, 0.08)" }]}>
                <Feather name="clock" size={16} color={COLORS.textLight} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.statMiniCardLabel}>Recent History</Text>
                <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                  {statsData.recentLogsCount}
                </Text>
              </View>
            </View>
          </View>

                  {/* Banner */}
                 {/* Banner */}
        {banner && (
          <View style={styles.newspaperBannerCard}>
            <View style={styles.newspaperInnerPadding}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={styles.newspaperBadgeContainer}>
                  <Text style={styles.newspaperBadgeText}>THE DAILY INSIGHT</Text>
                </View>
              </View>
              <Text style={styles.newspaperHeadlineTitle}>{banner.name}</Text>
              <View style={styles.newspaperDividerLine} />
              
              {/* Read More క్లిక్ చేసినప్పుడు కంప్లీట్ డిస్క్రిప్షన్ కనిపిస్తుంది */}
              <Text 
                style={styles.newspaperParagraphBody} 
                numberOfLines={bannerExpanded ? undefined : (isDesktop ? 3 : 5)}
              >
                {banner.description}
              </Text>
        
              {/* Buttons Cluster */}
              <View style={styles.bannerActionRow}>
                <TouchableOpacity 
                  style={styles.bannerReadMoreBtn} 
                  onPress={() => setBannerExpanded(!bannerExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bannerReadMoreBtnText}>
                    {bannerExpanded ? "Show Less" : "Read More"}
                  </Text>
                </TouchableOpacity>
        
                <TouchableOpacity 
                  style={styles.bannerPurchaseBtn} 
                  onPress={() => Linking.openURL("https://shinrayhealth.com/product/a-l-l/")} // A.L.L – ShinrayHealth (sleepFirstAid) పేజీకి రూట్ అవుతుంది
                  activeOpacity={0.8}
                >
                  <Feather name="shopping-bag" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.bannerPurchaseBtnText}>Purchase</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

          {/* ✅ FIXED: Layout handles custom indicator colors matching design structure guidelines explicitly */}
          <View style={styles.analyticsHighlightsRow}>
            {/* Left Box: Most Used Drain Card Frame */}
            <View style={[styles.insightMiniCard, { borderLeftColor: "#DC2626" }]}>
              <Feather name="trending-down" size={18} color="#DC2626" />
              <Text style={[styles.insightMiniValue, { color: COLORS.textDark }]}>
                {mostRecentActivity.mostUsedDrain || "None"}
              </Text>
              <Text style={[styles.insightMiniLabel, { color: COLORS.textLight }]}>
                Most Used Drain
              </Text>
            </View>

            {/* Right Box: Most Used Recovery Card Frame */}
            <View style={[styles.insightMiniCard, { borderLeftColor: COLORS.secondary }]}>
              <Feather name="trending-up" size={18} color={COLORS.secondary} />
              <Text style={[styles.insightMiniValue, { color: COLORS.textDark }]}>
                {mostRecentActivity.mostUsedRecovery || "None"}
              </Text>
              <Text style={[styles.insightMiniLabel, { color: COLORS.textLight }]}>
                Most Used Recovery
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
                  date={item.displayDate} // Passes downstream to append text underneath
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
  blurredLiquidSphere1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondary,
    opacity: 0.15,
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
    opacity: 0.12,
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
    opacity: 0.14,
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  premiumStatCard: {
    width: isDesktop ? "48.5%" : "48%", 
    minWidth: 140,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8 },
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
 newspaperBannerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(51, 105, 86, 0.08)",
    marginVertical: 12,
    marginBottom: 28,
    borderRadius: 28,
    shadowColor: "#1B2A24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  newspaperInnerPadding: {
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  newspaperBadgeContainer: {
    backgroundColor: "#336956",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  newspaperBadgeText: {
    color: "#FAF9F5",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  newspaperIdLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#576860",
    letterSpacing: 0.5,
  },
  newspaperHeadlineTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B2A24",
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  newspaperDividerLine: {
    height: 1,
    backgroundColor: "rgba(51, 105, 86, 0.08)",
    marginVertical: 10,
  },
  newspaperParagraphBody: {
    fontSize: 13,
    color: "#576860",
    lineHeight: 20,
    textAlign: "left",
  },
  bannerActionRow: {  flexDirection: 'row',  alignItems: 'center',  justifyContent: 'flex-end',  gap: 12,  marginTop: 14,},
  bannerReadMoreBtn: {  paddingVertical: 8,  paddingHorizontal: 14,  borderRadius: 20,  backgroundColor: 'rgba(51, 105, 86, 0.06)',  borderWidth: 1,  borderColor: 'rgba(51, 105, 86, 0.12)',},
  bannerReadMoreBtnText: {  color: '#336956',  fontSize: 12,  fontWeight: '700',},
  bannerPurchaseBtn: {  flexDirection: 'row',  alignItems: 'center',  paddingVertical: 8,  paddingHorizontal: 16,  borderRadius: 20,  backgroundColor: '#E09643',  shadowColor: '#E09643',  shadowOffset: { width: 0, height: 3 },  shadowOpacity: 0.15,  shadowRadius: 5,  elevation: 2,},
  bannerPurchaseBtnText: {  color: '#FFFFFF',  fontSize: 12,  fontWeight: '700',},
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
    fontSize: 18,
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
    height: 140,
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
    color: COLORS.textDark,
    fontWeight: "700",
    marginTop: 10,
  },
  // ✅ FIXED: Subtitle style properties configuration added for rendering the date below day labels safely
  chartColumnLabelDateText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "500",
    marginTop: 2,
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
    borderBottomColor: "rgba(51, 105, 86, 0.06)",
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