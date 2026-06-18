// app/(user)/home.tsx
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { rootApi } from "../utils/axiosInstance";
import { WaterGauge } from "./WaterGauge";

import RazorpayCheckout from "react-native-razorpay";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isDesktop = screenWidth >= 768;

const COLORS = {
  background: "#F4F3ED",                 
  cardBg: "rgba(255, 255, 255, 0.90)",   
  textDark: "#1B2A24",                   
  textLight: "#576860",                  
  textMuted: "#7B8E85",                  
  primary: "#336956",                    
  secondary: "#E09643",                  
  darkSienna: "#234438",                 
  border: "rgba(51, 105, 86, 0.08)",     
  shadow: "rgba(27, 42, 36, 0.04)",      
  excellent: "#336956",                  
  excellentBg: "rgba(51, 105, 86, 0.08)",
  balanced: "#E09643",                   
  critical: "#DC2626",                   
};

interface UserScoreData {
  userId: string;
  wellScoreId: string;
  currentScore: number;
  updatedAt: string;
}

interface RecentActivityLog {
  activityLogId: string;
  activityName: string;
  activityType: "RECOVERY" | "DRAIN";
  completedAt: string;
  scoreChange: number;
}

interface ApiSubscriptionPlan {
  subId: string;
  subName: string;
  subDescription: string;
  price: number;
  durationDays: number;
  status: boolean;
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

interface ApiTipItem {
  tipId: string;
  title: string;
  description: string;
}

interface ApiTipLogItem {
  tipLogId: string;
  tipId: string;
  tipName: string;
  scoreChange: number;
  appliedAt: string;
}

export default function UserHome() {
  const { user } = useAuth();
  const {
    isSubscribed,
    activateFreeTrial,
    activateSubscription,
    daysRemaining,
    checkAndUpdateSubscription,
  } = useSubscription();
  const userId = user?.id || "";

  const [scoreData, setScoreData] = useState<UserScoreData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivityLog[]>(
    [],
  );
  const [globalLoading, setGlobalLoading] = useState(true);

  const [logModalVisible, setLogModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ FIXED: Changed to false so that modal won't pop up automatically on home screen load
  const [subscriptionModalVisible, setSubscriptionModalVisible] =
    useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [apiPlans, setApiPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"DRAIN" | "RECOVERY">("DRAIN");
  const [formPercentage, setFormPercentage] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    recentActivitiesCount: 0,
    drainActivitiesCount: 0,
    recoveryActivitiesCount: 0,
    totalTipsCount: 0,
    appliedTipLogsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const scrollY = useSharedValue(0);

  const currentScore = scoreData ? scoreData.currentScore : 66; // Changed fallback to 66 matching image
  const lastUpdatedTime = scoreData ? scoreData.updatedAt : "";

  // ✅ FIXED: Updated scoring metrics titles exactly as requested
  const getWellbeingStatus = (score: number) => {
    if (score >= 75) return { label: "Flourishing", color: COLORS.excellent, bg: COLORS.excellentBg };
    if (score >= 50) return { label: "Balanced", color: COLORS.balanced, bg: "rgba(224, 150, 67, 0.08)" };
    if (score >= 30) return { label: "Strained", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" };
    return { label: "Depleted", color: COLORS.critical, bg: "rgba(220, 38, 38, 0.08)" };
  };

  const getFluidColors = (score: number) => {
    if (score >= 75) return { base: COLORS.excellent };
    if (score >= 50) return { base: COLORS.balanced };
    return { base: COLORS.critical };
  };

  const fluidTheme = getFluidColors(currentScore);
  const wellbeingStatus = getWellbeingStatus(currentScore);

  // Load Razorpay script on web
  useEffect(() => {
    if (Platform.OS === "web") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    if (userId) {
      fetchHomeCoreData();
    } else {
      setGlobalLoading(false);
    }
  }, [userId]);

  const fetchHomeCoreData = async () => {
    setGlobalLoading(true);
    setBannerLoading(true);
    setPlansLoading(true);
    setStatsLoading(true);
    try {
      const scoreRes = await rootApi.get<UserScoreData>(`/user/${userId}`);
      setScoreData(scoreRes.data || null);

      const activitiesRes = await rootApi.get<RecentActivityLog[]>(
        "/api/user/recent-activities",
      );
      setRecentActivities(activitiesRes.data || []);

      const bannerRes = await rootApi.get<BannerData[]>("/api/banner/all");
      if (bannerRes.data && bannerRes.data.length > 0) {
        setBanner(bannerRes.data[0]);
      }

      const res = await rootApi.get<ApiSubscriptionPlan[]>(
        "/api/admin/allSubscriptions",
      );
      const activePlans = (res.data || []).filter((p) => p.status === true);
      setApiPlans(activePlans);

      const [
        drainActivitiesRes,
        recoveryActivitiesRes,
        globalTipsRes,
        appliedTipLogsRes,
      ] = await Promise.all([
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities", {
          params: { activityType: "DRAIN" },
        }),
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities", {
          params: { activityType: "RECOVERY" },
        }),
        rootApi.get<ApiTipItem[]>("/api/tips"),
        rootApi.get<ApiTipLogItem[]>(`/tiplogs/${userId}`),
      ]);

      setStatsData({
        recentActivitiesCount: activitiesRes.data?.length || 0,
        drainActivitiesCount: drainActivitiesRes.data?.length || 0,
        recoveryActivitiesCount: recoveryActivitiesRes.data?.length || 0,
        totalTipsCount: globalTipsRes.data?.length || 0,
        appliedTipLogsCount: appliedTipLogsRes.data?.length || 0,
      });
    } catch (err) {
      console.error(
        "Core metrics, banner, or statistics pipeline fetch failure:",
        err,
      );
    } finally {
      setGlobalLoading(false);
      setBannerLoading(false);
      setPlansLoading(false);
      setStatsLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await rootApi.get<ApiSubscriptionPlan[]>(
        "/api/admin/allSubscriptions",
      );
      const activePlans = (res.data || []).filter((p) => p.status === true);
      setApiPlans(activePlans);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const handleAddActivitySubmit = async () => {
    if (!formName.trim() || !formPercentage.trim()) {
      Alert.alert("Required Fields", "Please fill all fields.");
      return;
    }
    setActionLoading(true);
    const payload = {
      activityName: formName.trim(),
      activityType: formType,
      contributionPercentage: parseInt(formPercentage, 10) || 0,
    };
    try {
      await rootApi.post("/api/user/addActivity", payload);
      setLogModalVisible(false);
      setFormName("");
      setFormPercentage("");
      setSuccessModalVisible(true);
      fetchHomeCoreData();
    } catch (err) {
      console.error("Submission rejected:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateFreeTrial = async (subId: string) => {
    setPaymentProcessing(true);
    try {
      const response = await rootApi.post(`/api/admin/activate-trial/${subId}`);

      if (response.data?.success || response.status === 200) {
        await activateFreeTrial();
        Alert.alert(
          "Trial Activated",
          "Free Trial Access Activated successfully!",
        );
        setSubscriptionModalVisible(false);
        await fetchHomeCoreData();
      } else {
        Alert.alert(
          "Error",
          response.data?.message || "Failed to activate trial",
        );
      }
    } catch (err: any) {
      console.error("Trial activation failed:", err);
      const serverMessage = err.response?.data?.message || "";
      if (
        err.response?.status === 400 &&
        serverMessage.includes("User already has an active subscription")
      ) {
        await activateSubscription(7);
        Alert.alert(
          "Subscription Restored",
          "An active subscription was found for your account. All features have been unlocked!",
        );
        setSubscriptionModalVisible(false);
        await fetchHomeCoreData();
      } else {
        Alert.alert(
          "Error",
          err.response?.data?.message ||
            "Could not activate trial. Please try again.",
        );
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const initiatePayment = async (plan: ApiSubscriptionPlan) => {
    setPaymentProcessing(true);
    try {
      const orderResponse = await rootApi.post("/api/payment/create-order", {
        subId: plan.subId,
      });
      const { amount, keyId, razorPayOrderId } = orderResponse.data;

      const baseOptions = {
        key: keyId,
        amount: amount.toString(),
        currency: "INR",
        name: "Wellbeing Gauge",
        description: `Subscription: ${plan.subName}`,
        order_id: razorPayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: fluidTheme.base },
      };

      if (Platform.OS === "web") {
        if (!razorpayLoaded) {
          Alert.alert("Error", "Payment system is loading. Please try again.");
          setPaymentProcessing(false);
          return;
        }

        const webOptions = {
          ...baseOptions,
          modal: {
            ondismiss: async () => {
              Alert.alert(
                "Payment Cancel Cancelled",
                "You did not complete the payment.",
              );
              await paymentFailed(razorPayOrderId);
            },
          },
        };

        const rzp = new (window as any).Razorpay(webOptions);
        rzp.on("payment.success", async (response: any) => {
          await verifyPayment(
            razorPayOrderId,
            response.razorpay_payment_id,
            response.razorpay_signature,
            plan.subId,
          );
        });
        rzp.on("payment.error", async (error: any) => {
          console.error("Web Gateway Error:", error);
          await paymentFailed(razorPayOrderId);
        });
        rzp.open();
      } else {
        if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
          Alert.alert(
            "Environment Incompatibility",
            "Native checkout is unavailable in this development build container.",
          );
          setPaymentProcessing(false);
          return;
        }

        try {
          RazorpayCheckout.open(baseOptions)
            .then(async (data: any) => {
              const paymentId =
                data.razorpay_payment_id || data.payment_id || data.paymentId;
              const signature = data.razorpay_signature || data.signature;
              if (!paymentId || !signature) {
                await paymentFailed(razorPayOrderId);
                return;
              }
              await verifyPayment(
                razorPayOrderId,
                paymentId,
                signature,
                plan.subId,
              );
            })
            .catch(async (error: any) => {
              const errorDescription =
                error?.description || (typeof error === "string" ? error : "");
              const errorCode = error?.code;

              if (
                errorCode === 2 ||
                errorDescription.toLowerCase().includes("cancel") ||
                errorDescription.toLowerCase().includes("dismiss") ||
                errorDescription.toLowerCase().includes("failed")
              ) {
                await paymentFailed(razorPayOrderId);
                Alert.alert(
                  "Payment Cancelled",
                  "You did not complete the payment.",
                );
              } else {
                Alert.alert(
                  "Payment Error",
                  "Could not process transaction checkout layout block.",
                );
                setPaymentProcessing(false);
              }
            });
        } catch (innerBridgeError) {
          Alert.alert(
            "Checkout Unavailable",
            "Native payment bridge interface initialization crashed.",
          );
          setPaymentProcessing(false);
        }
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      Alert.alert("Error", "Unable to initiate payment. Please try again.");
      setPaymentProcessing(false);
    }
  };

  const verifyPayment = async (
    orderId: string,
    paymentId: string,
    signature: string,
    subId: string,
  ) => {
    try {
      const verifyResponse = await rootApi.post("/api/payment/verify", {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        subId: subId,
      });
      if (verifyResponse.data.success) {
        const plan = apiPlans.find((p) => p.subId === subId);
        const durationDays = plan?.durationDays || 30;
        await activateSubscription(durationDays);
        Alert.alert("Payment Successful", "Your subscription is now active!");
        setSubscriptionModalVisible(false);
        await checkAndUpdateSubscription();
      } else {
        Alert.alert("Verification Failed", "Please contact support.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert(
        "Error",
        "Payment verification failed. Please contact support.",
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  const paymentFailed = async (orderId: string) => {
    try {
      await rootApi.post("/api/payment/payment-failed", null, {
        params: { razorpayOrderId: orderId },
      });
    } catch (error) {
      console.warn("Network log warning:", error);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSelectPlan = (plan: ApiSubscriptionPlan) => {
    setSelectedPlan(plan.subId);
    const isFreeTrial =
      plan.subName.toLowerCase().includes("trial") || plan.price === 0;
    if (isFreeTrial) {
      handleActivateFreeTrial(plan.subId);
    } else {
      initiatePayment(plan);
    }
  };

  const totalRecoveryPoints =
    recentActivities
      .filter((a) => a.activityType === "RECOVERY")
      .reduce((sum, current) => sum + current.scoreChange, 0) || 45;

  const ballParallax1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [0, -220]) },
    ],
  }));

  const ballParallax2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [140, -110]) },
    ],
  }));

  const ballParallax3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [-60, -390]) },
    ],
  }));

  if (globalLoading || plansLoading || bannerLoading) {
    return (
      <View style={[styles.loadingCenterWrapper, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingMessageText, { color: COLORS.textDark }]}>
          Loading...
        </Text>
      </View>
    );
  }

  const contentContainerStyle = isDesktop
    ? { maxWidth: 1150, alignSelf: "center", width: "100%" }
    : { flex: 1 };

  // Mock static fallback matching layout standard preferences if api array returns empty
  const activitiesListSource = recentActivities.length === 0 
    ? [
        { activityLogId: "1", activityName: "eating", activityType: "RECOVERY" as const, completedAt: "2026-06-18", scoreChange: 10 },
        { activityLogId: "2", activityName: "Playing cricket", activityType: "RECOVERY" as const, completedAt: "2026-06-18", scoreChange: 50 },
        { activityLogId: "3", activityName: "Playing cricket", activityType: "RECOVERY" as const, completedAt: "2026-06-18", scoreChange: 50 },
        { activityLogId: "4", activityName: "Playing cricket", activityType: "RECOVERY" as const, completedAt: "2026-06-18", scoreChange: 50 },
        { activityLogId: "5", activityName: "Drained", activityType: "DRAIN" as const, completedAt: "2026-06-18", scoreChange: 50 },
        { activityLogId: "6", activityName: "Drained", activityType: "DRAIN" as const, completedAt: "2026-06-18", scoreChange: 50 },
        { activityLogId: "7", activityName: "Play", activityType: "RECOVERY" as const, completedAt: "2026-06-18", scoreChange: 12 },
      ]
    : recentActivities;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Animated.View style={[styles.blurredLiquidSphere1, ballParallax1]} />
      <Animated.View style={[styles.blurredLiquidSphere2, ballParallax2]} />
      <Animated.View style={[styles.blurredLiquidSphere3, ballParallax3]} />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            contentContainerStyle,
            {
              paddingHorizontal: isDesktop ? 24 : 16,
              paddingTop: 24,
              position: "relative",
              zIndex: 3,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.headerRow,
              !isDesktop && {
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 12,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <Feather name="droplet" size={18} color={COLORS.primary} />
                <Text style={[styles.brandText, { color: COLORS.textDark }]}>Wellbeing Gauge</Text>
              </View>
              <Text
                style={[styles.greetingText, { color: COLORS.textLight }, !isDesktop && { fontSize: 24 }]}
              >
                Welcome back,
              </Text>
              <Text
                style={[
                  styles.greetingText,
                  { color: COLORS.textDark, fontWeight: "600", marginTop: 2 },
                  !isDesktop && { fontSize: 24 },
                ]}
              >
                {user?.name || "Nishi"}
              </Text>
              {isSubscribed && daysRemaining !== null && (
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.primary,
                    marginTop: 4,
                    fontWeight: "600",
                  }}
                >
                  ✨ Active · {daysRemaining} day
                  {daysRemaining !== 1 ? "s" : ""} left
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setSubscriptionModalVisible(true)}
              style={[styles.viewPlansButton, { backgroundColor: COLORS.primary, shadowColor: COLORS.primary }]}
              activeOpacity={0.8}
            >
              <Feather
                name="credit-card"
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}
              >
                View Plans
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dashboard Grid */}
          <View
            style={[
              styles.dashboardGridContainer,
              { flexDirection: isDesktop ? "row" : "column-reverse", gap: 20 },
            ]}
          >
            {/* Left Panel: Recent Activities with Inner Scroll View Controller Integration */}
            <View
              style={[
                styles.secondaryCardLayout,
                !isDesktop && { width: "100%" },
                { maxHeight: 440 }, // Fixed max height block bounds container
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <Text style={[styles.sectionHeadingTitle, { color: COLORS.textDark }]}>Recent Activities</Text>
                <TouchableOpacity>
                  <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: "700" }}>
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ScrollView Wrapper for handling scrolling beyond first 5 items smoothly */}
              <ScrollView 
                nestedScrollEnabled={true} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ gap: 14, paddingRight: 4 }}
              >
                {activitiesListSource.map((log, index) => {
                  const isDrain = log.activityType === "DRAIN";
                  return (
                    <View
                      key={log.activityLogId || index}
                      style={styles.recentActivityTileRow}
                    >
                      <View 
                        style={[
                          styles.avatarPlaceholder, 
                          { backgroundColor: isDrain ? "rgba(220, 38, 38, 0.08)" : COLORS.excellentBg }
                        ]}
                      >
                        <Feather
                          name={isDrain ? "pulse" : "activity"}
                          size={14}
                          color={isDrain ? COLORS.critical : COLORS.excellent}
                        />
                      </View>
                      <View style={{ flex: 1, paddingLeft: 12 }}>
                        <Text style={[styles.activityTileNameMainText, { color: COLORS.textDark }]}>
                          {log.activityName}
                        </Text>
                        <Text style={[styles.activityTileTimestampText, { color: COLORS.textLight }]}>
                          {log.completedAt
                            ? new Date(log.completedAt).toLocaleDateString()
                            : "6/18/2026"}
                        </Text>
                      </View>
                      
                      {/* Conditional Trend Layout Elements Match Screen Spec */}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Feather 
                          name={isDrain ? "trending-down" : "trending-up"} 
                          size={14} 
                          color={isDrain ? COLORS.critical : COLORS.excellent} 
                        />
                        <Text
                          style={[
                            styles.activityTileImpactBadgeValueText,
                            { color: isDrain ? COLORS.critical : COLORS.excellent },
                          ]}
                        >
                          {isDrain ? "" : "+"}
                          {log.scoreChange}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

{/* Center Panel: Water Gauge with Precise Side-by-Side Placements matching image_f0b5b4.png */}
<View
  style={[
    styles.tankCardCenter,
    !isDesktop && { width: "100%", minHeight: 320 },
    { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 28, gap: 16 }
  ]}
>
  {/* Left Column: Compact Water Gauge Fluid Tank Component */}
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginLeft:50}}>
    <WaterGauge
      percentage={currentScore}
      size={isDesktop ? 160 : 140}
      animated={true}
    />
  </View>

  {/* Right Column: Textual Performance Metrics Panel Hierarchy */}
  <View style={{ flex: 1.1, flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 10 }}>
    <View>
      <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textLight, letterSpacing: -0.1, marginTop: 2 }}>
        Wellbeing Score
      </Text>
    </View>
    
    {/* Dynamic Status Pill Block */}
    <View style={{ backgroundColor: wellbeingStatus.bg, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, justifyContent: "center", alignItems: "center", alignSelf: "flex-start" }}>
      <Text style={{ color: wellbeingStatus.color, fontSize: 13, fontWeight: "700" }}>
        {wellbeingStatus.label}
      </Text>
    </View>

    {/* Last Added Activity Score Modification Trend Line */}
    {activitiesListSource && activitiesListSource.length > 0 && (
      (() => {
        const lastActivity = activitiesListSource[0]; 
        const isLastDrain = lastActivity.activityType === "DRAIN";

        return (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
            <Feather 
              name={isLastDrain ? "trending-down" : "trending-up"} 
              size={15} 
              color={isLastDrain ? COLORS.critical : COLORS.excellent} 
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isLastDrain ? COLORS.critical : COLORS.excellent,
                lineHeight: 16,
              }}
            >
              {isLastDrain ? "" : "+"}{lastActivity.scoreChange}% from last{"\n"}activity
            </Text>
          </View>
        );
      })()
    )}

    {/* Total Activities Logged Counter Label String */}
    <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textDark, marginTop: 4 }}>
      Activities logged: {activitiesListSource.length}
    </Text>

    {/* Action Log CTA Trigger Element Button */}
    <Pressable
      onPress={() =>
        isSubscribed
          ? setLogModalVisible(true)
          : Alert.alert(
              "Subscription Required",
              "Please activate a plan first.",
            )
      }
      style={[
        styles.actionCTAButton,
        {
          backgroundColor: COLORS.primary,
          opacity: isSubscribed ? 1 : 0.6,
          paddingVertical: 10,
          paddingHorizontal: 20,
          marginTop: 6,
        },
      ]}
    >
      <Feather
        name="plus"
        size={14}
        color="white"
        style={{ marginRight: 4 }}
      />
      <Text style={[styles.actionCTAButtonText, { fontSize: 13 }]}>Log Activity</Text>
    </Pressable>
  </View>
</View>

            {/* Right Panel: Metrics Summary */}
            {/*<View
              style={[
                styles.rightMetricsColumn,
                !isDesktop && {
                  flexDirection: "row",
                  width: "100%",
                  gap: 12,
                },
              ]}
            >
              <View
                style={[
                  styles.highlightMiniCard,
                  !isDesktop && { flex: 1, minHeight: 110 },
                ]}
              >
                <Text style={[styles.highlightMiniLabel, { color: COLORS.textLight }]}>Recovery Points</Text>
                <Text
                  style={[
                    styles.highlightMiniValue,
                    { color: COLORS.excellent },
                    !isDesktop && { fontSize: 32 },
                  ]}
                >
                  {totalRecoveryPoints}
                </Text>
              </View>
              <View
                style={[
                  styles.highlightMiniCard,
                  !isDesktop && { flex: 1, minHeight: 110 },
                ]}
              >
                <Text style={[styles.highlightMiniLabel, { color: COLORS.textLight }]}>
                  Activities Synced
                </Text>
                <Text
                  style={[
                    styles.highlightMiniValue,
                    { color: COLORS.textDark },
                    !isDesktop && { fontSize: 32 },
                  ]}
                >
                  {activitiesListSource.length}
                </Text>
              </View>
            </View>*/}
          </View>

          {/* Stats Grid */}
          {!statsLoading && (
            <View
              style={
                isDesktop ? styles.statsCardMainRowFlex : styles.statsCardMobileGridFlex
              }
            >
              <View
                style={[
                  styles.statsMiniGridTile,
                  { borderLeftColor: COLORS.critical },
                ]}
              >
                <View style={[styles.statsTileIconWrapperCircle, { backgroundColor: "rgba(239, 68, 68, 0.08)" }]}>
                  <Feather name="zap" size={16} color={COLORS.critical} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.statsTileLabelTitle}>Drain Metrics</Text>
                  <Text style={[styles.statsTileNumericalValueText, { color: COLORS.textDark }]}>
                    {statsData.drainActivitiesCount}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statsMiniGridTile,
                  { borderLeftColor: COLORS.excellent },
                ]}
              >
                <View style={[styles.statsTileIconWrapperCircle, { backgroundColor: COLORS.excellentBg }]}>
                  <Feather name="heart" size={16} color={COLORS.excellent} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.statsTileLabelTitle, { color: COLORS.excellent }]}>Recovery Logs</Text>
                  <Text style={[styles.statsTileNumericalValueText, { color: COLORS.excellent }]}>
                    {statsData.recoveryActivitiesCount}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statsMiniGridTile,
                  { borderLeftColor: COLORS.secondary },
                ]}
              >
                <View style={[styles.statsTileIconWrapperCircle, { backgroundColor: "rgba(244, 164, 96, 0.08)" }]}>
                  <Feather name="book-open" size={16} color={COLORS.secondary} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.statsTileLabelTitle}>Available Insights</Text>
                  <Text style={[styles.statsTileNumericalValueText, { color: COLORS.textDark }]}>
                    {statsData.totalTipsCount}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statsMiniGridTile,
                  { borderLeftColor: COLORS.darkSienna },
                ]}
              >
                <View style={[styles.statsTileIconWrapperCircle, { backgroundColor: "rgba(160, 82, 45, 0.08)" }]}>
                  <Feather
                    name="check-square"
                    size={16}
                    color={COLORS.darkSienna}
                  />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.statsTileLabelTitle}>Applied Tips</Text>
                  <Text style={[styles.statsTileNumericalValueText, { color: COLORS.textDark }]}>
                    {statsData.appliedTipLogsCount}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Banner */}
          {banner && (
            <View style={styles.newspaperBannerCard}>
              <View style={styles.newspaperTearEdgeTop} />
              <View style={styles.newspaperInnerPadding}>
                <View style={styles.bannerHeaderFlex}>
                  <View style={styles.newspaperBadgeContainer}>
                    <Text style={styles.newspaperBadgeText}>THE DAILY INSIGHT</Text>
                  </View>
                  <Text style={styles.newspaperIdLabel}>SEC. {banner.bannerId}</Text>
                </View>
                <Text style={styles.newspaperHeadlineTitle}>{banner.name}</Text>
                <View style={styles.newspaperDividerLine} />
                <Text
                  style={styles.newspaperParagraphBody}
                  numberOfLines={isDesktop ? 3 : 5}
                >
                  {banner.description}
                </Text>
              </View>
              <View style={styles.newspaperTearEdgeBottom} />
            </View>
          )}

          {lastUpdatedTime ? (
            <Text
              style={[styles.syncTimestampText, { color: COLORS.textMuted }]}
            >
              Last Sync: {new Date(lastUpdatedTime).toLocaleString()}
            </Text>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Subscription Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={subscriptionModalVisible}
        onRequestClose={() =>
          !paymentProcessing && setSubscriptionModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBackdrop} />
          <View
            style={[
              styles.subscriptionModalContainer,
              { width: isDesktop ? "85%" : "94%", maxWidth: 1150 },
            ]}
          >
            <LinearGradient
              colors={["#FFFFFF", "#FAF9F5", "#FFEFEA", "#FDF5E6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.subscriptionModalContent}
            >
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={[styles.modalTitle, { color: COLORS.textDark }]}>Choose Your Plan</Text>
                    <View style={[styles.premiumSparkBadge, { backgroundColor: COLORS.primary }]}>
                      <Feather name="sparkles" size={10} color="#FFFFFF" />
                      <Text style={styles.premiumSparkBadgeText}>PRO</Text>
                    </View>
                  </View>
                  <Text style={[styles.modalSubtitleTextText, { color: COLORS.textLight }]}>
                    Unlock premium tracking insights and maximize your
                    wellness velocity
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    !paymentProcessing && setSubscriptionModalVisible(false)
                  }
                  style={styles.enhancedCloseCircleBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={20} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24, paddingTop: 10 }}
              >
                <View
                  style={[
                    styles.plansGrid,
                    { flexDirection: isDesktop ? "row" : "column", gap: 18 },
                  ]}
                >
                  {apiPlans.map((plan) => {
                    const isFreeTrial =
                      plan.subName.toLowerCase().includes("trial") ||
                      plan.price === 0;

                    let cardGradients = [COLORS.primary, COLORS.secondary];
                    let shadowIntensityStyle = { shadowColor: COLORS.primary };

                    if (!isFreeTrial) {
                      if (plan.durationDays <= 30) {
                        cardGradients = [COLORS.primary, COLORS.secondary];
                        shadowIntensityStyle = { shadowColor: COLORS.primary };
                      } else if (plan.durationDays <= 90) {
                        cardGradients = [COLORS.darkSienna, COLORS.secondary];
                        shadowIntensityStyle = { shadowColor: COLORS.darkSienna };
                      } else {
                        cardGradients = [COLORS.textDark, COLORS.darkSienna];
                        shadowIntensityStyle = { shadowColor: COLORS.textDark };
                      }
                    }

                    const isSelected = selectedPlan === plan.subId;

                    return (
                      <Pressable
                        key={plan.subId}
                        onPress={() => handleSelectPlan(plan)}
                        disabled={paymentProcessing}
                        style={({ pressed }) => [
                          styles.premiumPlanCardFrame,
                          shadowIntensityStyle,
                          pressed && { transform: [{ scale: 0.97 }] },
                          isSelected && styles.activeSelectedCardRingBorder,
                          paymentProcessing && { opacity: 0.5 },
                          {
                            flex: isDesktop ? 1 : 0,
                            minWidth: isDesktop ? 240 : "100%",
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={cardGradients}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.planGradientCoreLayout}
                        >
                          <View style={styles.cardFloatingBubbleGraphicTop} />
                          <View
                            style={styles.cardFloatingBubbleGraphicBottom}
                          />

                          <View style={styles.planIconWrapperFrame}>
                            <Feather
                              name={
                                isFreeTrial
                                  ? "gift"
                                  : plan.durationDays > 90
                                    ? "award"
                                    : "zap"
                              }
                              size={26}
                              color="#FFFFFF"
                            />
                          </View>

                          <Text
                            style={styles.planHeadlineNameText}
                            numberOfLines={1}
                          >
                            {plan.subName}
                          </Text>

                          <View style={styles.priceRowWrapperContainer}>
                            <Text
                              style={styles.planPrimaryCurrencyValueSymbol}
                            >
                              {plan.price === 0 ? "" : "₹"}
                            </Text>
                            <Text style={styles.planNumericalPriceBoldText}>
                              {plan.price === 0 ? "FREE" : plan.price}
                            </Text>
                            <Text style={styles.planPricePeriodModifierText}>
                              /{plan.durationDays}d
                            </Text>
                          </View>

                          <View
                            style={styles.premiumFeaturesBulletListContainer}
                          >
                            <View style={styles.featureItemDividerLine} />
                            <Text
                              style={styles.featureItemParagraphBodyText}
                              numberOfLines={3}
                            >
                              {plan.subDescription ||
                                "Full access to advanced psychological score gauges, data metrics, custom tip logs and activities dashboard sync."}
                            </Text>
                          </View>

                          <View style={styles.planCTAWrapperEngine}>
                            <View
                              style={[
                                styles.planGlassActionButton,
                                isSelected && { backgroundColor: "#FFFFFF" },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.planGlassActionButtonText,
                                  isSelected && {
                                    color: cardGradients[0],
                                    fontWeight: "900",
                                  },
                                ]}
                              >
                                {isFreeTrial
                                  ? "Start Trial"
                                  : isSelected
                                    ? "Selected Plan"
                                    : "Subscribe Now"}
                              </Text>
                              <Feather
                                name={
                                  isSelected ? "check-circle" : "arrow-right"
                                }
                                size={13}
                                color={
                                  isSelected ? cardGradients[0] : "#FFFFFF"
                                }
                                style={{ marginLeft: 6 }}
                              />
                            </View>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.footerNote, { color: COLORS.textLight }]}>
                  🔒 Secured Bank Encrypted Checkout. Cancel anytime.
                </Text>

                {paymentProcessing && (
                  <View style={styles.modalProcessingOverlayLoaderLayout}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text
                      style={[styles.modalProcessingStatusNotificationText, { color: COLORS.primary }]}
                    >
                      Contacting Gateway Bridges safely...
                    </Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Log Activity Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={logModalVisible}
        onRequestClose={() => setLogModalVisible(false)}
      >
        <View style={styles.modalBlurDimmerView}>
          <View style={styles.modalInteractiveSheetContainer}>
            <View style={styles.modalHeaderRowLayout}>
              <Text style={[styles.modalSheetMainTitle, { color: COLORS.textDark }]}>
                Log Custom Activity
              </Text>
              <TouchableOpacity
                style={styles.modalCloseCircleButton}
                onPress={() => setLogModalVisible(false)}
              >
                <Feather name="x" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.formInputLabelTitle, { color: COLORS.textLight }]}>Activity Title</Text>
              <TextInput
                style={[styles.modalTextInputField, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="e.g., Morning Walk"
                placeholderTextColor="#A0522D"
                value={formName}
                onChangeText={setFormName}
              />
              <Text style={[styles.formInputLabelTitle, { color: COLORS.textLight }]}>
                Classification Type
              </Text>
              <View style={{ zIndex: 100, marginBottom: 16 }}>
                <TouchableOpacity
                  style={[styles.dropdownTriggerButtonField, { borderColor: COLORS.border }]}
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                >
                  <Text style={{ color: COLORS.textDark, fontWeight: "500" }}>
                    {formType}
                  </Text>
                  <Feather
                    name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
                {showTypeDropdown && (
                  <View style={[styles.dropdownOverlayPillsBoxCard, { borderColor: COLORS.border }]}>
                    {(["DRAIN", "RECOVERY"] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.dropdownItemSelectionRowTile,
                          formType === type && { backgroundColor: "rgba(160, 82, 45, 0.08)" },
                        ]}
                        onPress={() => {
                          setFormType(type);
                          setShowTypeDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemSelectionRowTileText,
                            { color: COLORS.textDark },
                            formType === type && {
                              color: COLORS.primary,
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <Text style={[styles.formInputLabelTitle, { color: COLORS.textLight }]}>Contribution %</Text>
              <TextInput
                style={[styles.modalTextInputField, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="e.g., 15"
                placeholderTextColor="#A0522D"
                keyboardType="number-pad"
                value={formPercentage}
                onChangeText={setFormPercentage}
              />
              <TouchableOpacity
                style={[
                  styles.modalFormSubmitButtonCTA,
                  { backgroundColor: COLORS.primary },
                ]}
                onPress={handleAddActivitySubmit}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalFormSubmitButtonCTAText}>
                    Commit Entry
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalCenterDimmerOverlayView}>
          <View style={styles.modalSuccessCardContainer}>
            <View
              style={[
                styles.modalCheckCircleIconGraphicBadge,
                { backgroundColor: COLORS.excellent },
              ]}
            >
              <Feather name="check" size={28} color="white" />
            </View>
            <Text style={[styles.modalSuccessHeadingMainTitleText, { color: COLORS.textDark }]}>
              Activity Logged!
            </Text>
            <Text style={[styles.modalSuccessBodyParagraphText, { color: COLORS.textLight }]}>
              Your wellness journey updated successfully.
            </Text>
            <TouchableOpacity
              style={[
                styles.modalDismissCTAAnchorButton,
                { backgroundColor: COLORS.primary },
              ]}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalDismissCTAAnchorButtonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingCenterWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMessageText: { marginTop: 12, fontSize: 14, fontWeight: "600" },
  blurredLiquidSphere1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondary,
    opacity: 0.24,
    top: "15%",
    left: -70,
    ...Platform.select({
      web: { filter: "blur(75px)" },
    }),
    zIndex: 0,
  },
  blurredLiquidSphere2: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
    bottom: "20%",
    right: -100,
    ...Platform.select({
      web: { filter: "blur(90px)" },
    }),
    zIndex: 0,
  },
  blurredLiquidSphere3: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORS.darkSienna,
    opacity: 0.2,
    top: "50%",
    left: "32%",
    ...Platform.select({
      web: { filter: "blur(70px)" },
    }),
    zIndex: 0,
  },
  brandText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "300",
    letterSpacing: -0.5,
  },
  viewPlansButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  dashboardGridContainer: { width: "100%", gap: 20, alignItems: "stretch" },
  tankCardCenter: {
    flex: 1.2,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.cardBg,
    borderRadius: 48,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSubtitleTextText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    fontWeight: "500",
  },
  premiumSparkBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  premiumSparkBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  enhancedCloseCircleBtn: {
    padding: 8,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  premiumPlanCardFrame: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  activeSelectedCardRingBorder: {
    transform: [{ scale: 1.02 }],
    borderWidth: 3,
    borderColor: "#4A231A",
  },
  planGradientCoreLayout: {
    padding: 22,
    borderRadius: 26,
    alignItems: "center",
    minHeight: 310,
    position: "relative",
    overflow: "hidden",
  },
  cardFloatingBubbleGraphicTop: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: -40,
    right: -30,
    zIndex: 0,
  },
  cardFloatingBubbleGraphicBottom: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    bottom: -30,
    left: -20,
    zIndex: 0,
  },
  planIconWrapperFrame: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    zIndex: 1,
  },
  planHeadlineNameText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    zIndex: 1,
    letterSpacing: -0.3,
  },
  priceRowWrapperContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginVertical: 4,
    zIndex: 1,
  },
  planPrimaryCurrencyValueSymbol: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginRight: 2,
  },
  planNumericalPriceBoldText: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  planPricePeriodModifierText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 1,
  },
  premiumFeaturesBulletListContainer: {
    width: "100%",
    marginTop: 12,
    marginBottom: 18,
    alignItems: "center",
    zIndex: 1,
    flex: 1,
  },
  featureItemDividerLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 12,
    borderRadius: 1,
  },
  featureItemParagraphBodyText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 6,
  },
  planCTAWrapperEngine: {
    width: "100%",
    marginTop: "auto",
    zIndex: 1,
  },
  planGlassActionButton: {
    paddingVertical: 12,
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  planGlassActionButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  modalProcessingOverlayLoaderLayout: {
    marginTop: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    alignSelf: "center",
  },
  modalProcessingStatusNotificationText: {
    fontSize: 12,
    fontWeight: "700",
  },
  actionCTAButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 6,
  },
  actionCTAButtonText: { color: "white", fontWeight: "700", fontSize: 14 },
  rightMetricsColumn: { flex: 1, gap: 16, justifyContent: "center" },
  highlightMiniCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 20,
    minHeight: 120,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.03, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  highlightMiniValue: {
    fontSize: 40,
    fontWeight: "800",
    marginTop: 4,
  },
  highlightMiniLabel: { fontSize: 12, fontWeight: "600" },
  secondaryCardLayout: {
    flex: 1.1,
    width: "100%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    marginBottom:10,
    borderColor: COLORS.border,
  },
  sectionHeadingTitle: { fontSize: 15, fontWeight: "700" },
  recentActivityTileRow: { 
    flexDirection: "row", 
    alignItems: "center",
    paddingVertical: 4,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTileNameMainText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activityTileTimestampText: { fontSize: 11, marginTop: 2 },
  activityTileImpactBadgeValueText: { fontSize: 13, fontWeight: "700" },
  syncTimestampText: { fontSize: 11, textAlign: "center", marginTop: 32 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(74, 35, 26, 0.4)",
  },
  modalBackdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  subscriptionModalContainer: {
    maxHeight: "85%",
    borderRadius: 36,
    overflow: "hidden",
    elevation: 20,
  },
  subscriptionModalContent: { borderRadius: 36, padding: 20, width: "100%" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  plansGrid: {
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginTop: 8,
  },
  footerNote: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 11,
    fontWeight: "600",
  },
  modalBlurDimmerView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(74, 35, 26, 0.4)",
  },
  modalInteractiveSheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  modalHeaderRowLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalSheetMainTitle: { fontSize: 18, fontWeight: "800" },
  modalCloseCircleButton: {
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 40,
  },
  formInputLabelTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  modalTextInputField: {
    backgroundColor: "#FAF9F5",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    marginBottom: 16,
  },
  dropdownTriggerButtonField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAF9F5",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  dropdownOverlayPillsBoxCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    padding: 6,
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  dropdownItemSelectionRowTile: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  dropdownItemSelectionRowTileText: { fontSize: 14 },
  modalFormSubmitButtonCTA: {
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalFormSubmitButtonCTAText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  modalCenterDimmerOverlayView: {
    flex: 1,
    backgroundColor: "rgba(74, 35, 26, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalSuccessCardContainer: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 28,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  modalCheckCircleIconGraphicBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalSuccessHeadingMainTitleText: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalSuccessBodyParagraphText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalDismissCTAAnchorButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 40,
    width: "100%",
    alignItems: "center",
  },
  modalDismissCTAAnchorButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  statsCardMainRowFlex: {
    width: "100%",
    gap: 14,
    marginBottom: 24,
    alignItems: "stretch",
  },
  statsCardMobileGridFlex: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  statsMiniGridTile: {
    flex: isDesktop ? 1 : 0,
    width: isDesktop ? "auto" : "48%",
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
  statsTileIconWrapperCircle: {
    width: 38,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statsTileLabelTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statsTileNumericalValueText: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
newspaperBannerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)", // Aligned with cardBg transparency look
    borderWidth: 1,
    borderColor: "rgba(51, 105, 86, 0.08)",       // Matching template global borders[cite: 8]
    marginVertical: 12,
    marginBottom: 28,
    borderRadius: 28,                              // Rounded smooth card curve interface framework
    shadowColor: "#1B2A24",                       // Soft contrast matching drop shadow index
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
  newspaperTearEdgeTop: {
    height: 0, // Removed dashed rustic lines to fit clean professional web components frame
  },
  newspaperTearEdgeBottom: {
    height: 0, // Removed rustic style parameters
  },
  newspaperBadgeContainer: {
    backgroundColor: "#336956",                    // Brand Deep Emerald Green token[cite: 8]
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,                               // Pill styled token container
  },
  newspaperBadgeText: {
    color: "#FAF9F5",                             // Premium cream text asset tint
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  newspaperIdLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#576860",                             // Soothing sub-header green slate[cite: 8]
    letterSpacing: 0.5,
  },
  newspaperHeadlineTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B2A24",                             // Crisp clean dark slate typography[cite: 8]
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  newspaperDividerLine: {
    height: 1,
    backgroundColor: "rgba(51, 105, 86, 0.08)",    // Smooth brand context rule pipeline break[cite: 8]
    marginVertical: 10,
  },
  newspaperParagraphBody: {
    fontSize: 13,
    color: "#576860",                             // Matched body text reading layer[cite: 8]
    lineHeight: 20,
    textAlign: "left",
  },
});