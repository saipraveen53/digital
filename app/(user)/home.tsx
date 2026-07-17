import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
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
import { ChoosePlanModal } from "./ChoosePlanModal";
import { WaterGauge } from "./WaterGauge";

import { Image } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { LinearGradient } from "expo-linear-gradient";

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
  activityId: string;
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
  categoryId: number;
  categoryTipName: string;
}

interface ApiTipLogItem {
  tipLogId: string;
  tipId: string;
  tipName: string;
  scoreChange: number;
  appliedAt: string;
}

export default function UserHome() {
  const { user,logout } = useAuth();
  const {
    isSubscribed,
    activateFreeTrial,
    activateSubscription,
    daysRemaining,
    checkAndUpdateSubscription,
  } = useSubscription();
  const userId = user?.id || "";

  const [scoreData, setScoreData] = useState<UserScoreData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivityLog[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);

  const [logModalVisible, setLogModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [apiPlans, setApiPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [trialSuccessModalVisible, setTrialSuccessModalVisible] = useState(false);
  const [trialProcessing, setTrialProcessing] = useState(false); // separate from payment processing

  const [paymentSuccessModalVisible, setPaymentSuccessModalVisible] = useState(false);
  const [paymentFailureModalVisible, setPaymentFailureModalVisible] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState("");

  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [completedActivityName, setCompletedActivityName] = useState("");
  const [completionSuccessVisible, setCompletionSuccessVisible] = useState(false);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"DRAIN" | "RECOVERY">("DRAIN");
  const [formPercentage, setFormPercentage] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [bannerExpanded, setBannerExpanded] = useState(false);

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

  const currentScore = scoreData ? scoreData.currentScore : 0;

  const getWellbeingStatus = (score: number) => {
    if (score > 100) return { label: "Overloaded", color: "#6366F1", bg: "rgba(99, 102, 241, 0.08)" };
    if (score >= 75) return { label: "Flourishing", color: COLORS.excellent, bg: COLORS.excellentBg };
    if (score >= 50) return { label: "Balanced", color: COLORS.balanced, bg: "rgba(224, 150, 67, 0.08)" };
    if (score >= 30) return { label: "Strained", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" };
    return { label: "Depleted", color: COLORS.critical, bg: "rgba(220, 38, 38, 0.08)" };
  };

  const getFluidColors = (score: number) => {
    if (score > 100) return { base: "#6366F1" };
    if (score >= 75) return { base: COLORS.excellent };
    if (score >= 50) return { base: COLORS.balanced };
    return { base: COLORS.critical };
  };

  const fluidTheme = getFluidColors(currentScore);
  const wellbeingStatus = getWellbeingStatus(currentScore);

  useEffect(() => {
    if (Platform.OS === "web") {
      if ((window as any).Razorpay) {
        setRazorpayLoaded(true);
        return;
      }
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

  useEffect(() => {
    if (userId && !globalLoading) {
      if (!isSubscribed) {
        setSubscriptionModalVisible(true);
      }
    }
  }, [userId, isSubscribed, globalLoading]);

  const fetchHomeCoreData = async () => {
    setGlobalLoading(true);
    setBannerLoading(true);
    setPlansLoading(true);
    setStatsLoading(true);
    try {
      const scoreRes = await rootApi.get<UserScoreData>(`/user/${userId}`);
      setScoreData(scoreRes.data || null);

      const activitiesRes = await rootApi.get<RecentActivityLog[]>("/api/user/recent-activities");
      // ✅ Safe validation array mapping logic to prevent undefined map krashes
      const rawActivities = Array.isArray(activitiesRes.data) ? activitiesRes.data : [];
      setRecentActivities(rawActivities);

      const bannerRes = await rootApi.get<BannerData[]>("/api/banner/getByStatus?status=true");
      if (bannerRes.data && Array.isArray(bannerRes.data) && bannerRes.data.length > 0) {
        setBanner(bannerRes.data[0]);
      }

      const res = await rootApi.get<ApiSubscriptionPlan[]>("/api/admin/getByStatus?status=true");
      // ✅ Safe verification step array map mapping filters definition
      const rawPlans = Array.isArray(res.data) ? res.data : [];
      const activePlans = rawPlans.filter((p) => p.status === true);
      setApiPlans(activePlans);

      const [
        drainActivitiesRes,
        recoveryActivitiesRes,
        globalTipsRes,
        appliedTipLogsRes,
      ] = await Promise.all([
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities", { params: { activityType: "DRAIN" } }),
        rootApi.get<ApiActivityItem[]>("/api/user/getActivities", { params: { activityType: "RECOVERY" } }),
        rootApi.get<ApiTipItem[]>("/api/tipCategory/getByStatus"),
        rootApi.get<ApiTipLogItem[]>(`/tiplogs`),
      ]);

      const dCount = Array.isArray(drainActivitiesRes.data) ? drainActivitiesRes.data.length : 0;
      const rCount = Array.isArray(recoveryActivitiesRes.data) ? recoveryActivitiesRes.data.length : 0;
      const tCount = Array.isArray(globalTipsRes.data) ? globalTipsRes.data.length : 0;
      const aCount = Array.isArray(appliedTipLogsRes.data) ? appliedTipLogsRes.data.length : 0;

      setStatsData({
        recentActivitiesCount: rawActivities.length,
        drainActivitiesCount: dCount,
        recoveryActivitiesCount: rCount,
        totalTipsCount: tCount,
        appliedTipLogsCount: aCount,
      });
    } catch (err) {
      console.error("Core metrics failure:", err);
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
      const res = await rootApi.get<ApiSubscriptionPlan[]>("/api/admin/getByStatus?status=true");
      // ✅ Safe fallback stream resolution check array mapping pipeline
      const rawPlans = Array.isArray(res.data) ? res.data : [];
      const activePlans = rawPlans.filter((p) => p.status === true);
      setApiPlans(activePlans);
    } catch (err) {
      console.error("Failed to fetch subscription plans context:", err);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    if (subscriptionModalVisible) {
      fetchSubscriptionPlans();
    }
  }, [subscriptionModalVisible]);

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
    } bits: {
      setActionLoading(false);
    }
  };
  const handleCompleteActivity = async (activityId: string, activityName: string) => {
    setLoadingStates((prev) => ({ ...prev, [activityId]: true }));
    try {
      await rootApi.post(`/api/user/completeActivity?activityId=${activityId}`);
      const resRecent = await rootApi.get<RecentActivityLog[]>("/api/user/recent-activities");
      setRecentActivities(resRecent.data || []);
  
      setCompletedActivityName(activityName);
      setCompletionSuccessVisible(true);
    } catch (err) {
      console.error("Failed processing completion key context:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [activityId]: false }));
    }
  };
const handleActivateFreeTrial = async (subId: string) => {
  const selectedPlanDetails = apiPlans.find(p => p.subId === subId);
  const isActualFreeTrial = selectedPlanDetails?.subName.toLowerCase().includes("trial") || selectedPlanDetails?.price === 0;

  if (!isActualFreeTrial) {
    Alert.alert("Invalid Request", "This action path is strictly limited to trial validations.");
    return;
  }

  setTrialProcessing(true); 
  try {
    const response = await rootApi.post(`/api/admin/activate-trial/${subId}`);
    
    // Success scenario
    await activateFreeTrial(); 
    setSubscriptionModalVisible(false);
    setTrialSuccessModalVisible(true); 
    await fetchHomeCoreData();

  } catch (err: any) {
    // 🔥 FIXED: If backend returns 400 (already active), treat it as success locally
    if (err.response?.status === 400) {
      console.log("Subscription already active on backend, syncing locally...");
      await activateFreeTrial(); // Locally locks unlock avthayi
      setSubscriptionModalVisible(false);
      await fetchHomeCoreData();
    } else {
      console.error("Trial activation failed:", err);
      setPaymentErrorMessage("Could not process free trial activation.");
      setPaymentFailureModalVisible(true);
    }
  } finally {
    setTrialProcessing(false);
  }
};

  const initiatePayment = async (plan: ApiSubscriptionPlan) => {
    setPaymentProcessing(true);
    try {
      const orderResponse = await rootApi.post("/api/payment/create-order", { subId: plan.subId });
      const { amount, keyId, key_id, razorPayOrderId, id } = orderResponse.data;
      const finalKey = keyId || key_id;
      const finalOrderId = razorPayOrderId || id;

      if (!finalOrderId) throw new Error("Order ID Generation Failed");

      const baseOptions = {
        key: finalKey,
        amount: amount.toString(),
        currency: "INR",
        name: "Wellbeing Gauge",
        description: `Subscription: ${plan.subName}`,
        order_id: finalOrderId,
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: fluidTheme.base },
      };

      if (Platform.OS === "web") {
        if (!razorpayLoaded || !(window as any).Razorpay) {
          Alert.alert("Error", "Payment system is loading. Please try again.");
          setPaymentProcessing(false);
          return;
        }
        const webOptions = {
          ...baseOptions,
          handler: async function (response: any) {
            await verifyPayment(finalOrderId, response.razorpay_payment_id, response.razorpay_signature, plan.subId);
          },
          modal: {
            ondismiss: async () => {
              await paymentFailed(finalOrderId);
              setPaymentErrorMessage("Payment cancelled by user session.");
              setPaymentFailureModalVisible(true);
            },
          },
        };
        const rzp = new (window as any).Razorpay(webOptions);
        rzp.open();
      } else {
        if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
          Alert.alert("Environment Incompatibility", "Native checkout build error.");
          setPaymentProcessing(false);
          return;
        }
        RazorpayCheckout.open(baseOptions)
          .then(async (data: any) => {
            const paymentId = data.razorpay_payment_id || data.payment_id || data.paymentId;
            const signature = data.razorpay_signature || data.signature;
            if (!paymentId || !signature) {
              await paymentFailed(finalOrderId);
              setPaymentErrorMessage("Missing verified validation parameters.");
              setPaymentFailureModalVisible(true);
              return;
            }
            await verifyPayment(finalOrderId, paymentId, signature, plan.subId);
          })
          .catch(async (error: any) => {
            await paymentFailed(finalOrderId);
            setPaymentErrorMessage(error?.description || "Transaction rejected by bank.");
            setPaymentFailureModalVisible(true);
            setPaymentProcessing(false);
          });
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      setPaymentProcessing(false);
      setPaymentErrorMessage("Order creation failed.");
      setPaymentFailureModalVisible(true);
    }
  };

  const verifyPayment = async (orderId: string, paymentId: string, signature: string, subId: string) => {
    try {
      const response = await rootApi.post("/api/payment/verify", {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        subId: subId,
      });
      if (response.data.success || response.status === 200) {
        const plan = apiPlans.find((p) => p.subId === subId);
        const durationDays = plan?.durationDays || 30;
        await activateSubscription(durationDays);
        setSubscriptionModalVisible(false);
        setPaymentSuccessModalVisible(true);
        await checkAndUpdateSubscription();
      } else {
        setPaymentErrorMessage("Verification logs unmatched.");
        setPaymentFailureModalVisible(true);
      }
    } catch (error: any) {
      setPaymentErrorMessage(error.response?.data?.message || "Server verification pipeline crash.");
      setPaymentFailureModalVisible(true);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const paymentFailed = async (orderId: string) => {
    try {
      await rootApi.post("/api/payment/payment-failed", null, { params: { razorpayOrderId: orderId } });
    } catch (error) {
      console.warn("Network log warning:", error);
    }
  };

const handleSelectPlan = (plan: ApiSubscriptionPlan) => {
  setSelectedPlan(plan.subId);
  const isFreeTrial = plan.subName.toLowerCase().includes("trial") || plan.price === 0;
  if (isFreeTrial) {
    handleActivateFreeTrial(plan.subId); 
  } else {
    initiatePayment(plan); 
  }
};

  const ballParallax1 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [0, -220]) }] }));
  const ballParallax2 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [140, -110]) }] }));
  const ballParallax3 = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [-60, -390]) }] }));

  if (globalLoading || plansLoading || bannerLoading) {
    return (
      <View style={[styles.loadingCenterWrapper, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingMessageText, { color: COLORS.textDark }]}>Loading...</Text>
      </View>
    );
  }

  const contentContainerStyle = isDesktop ? { maxWidth: 1150, alignSelf: "center", width: "100%" } : { flex: 1 };
  const activitiesListSource = recentActivities;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Animated.View style={[styles.blurredLiquidSphere1, ballParallax1]} />
      <Animated.View style={[styles.blurredLiquidSphere2, ballParallax2]} />
      <Animated.View style={[styles.blurredLiquidSphere3, ballParallax3]} />

      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[contentContainerStyle, { paddingHorizontal: isDesktop ? 24 : 16, paddingTop: 24, position: "relative", zIndex: 3 }]}>
          
          {/* Header */}
        <View style={[styles.headerRow, !isDesktop && { flexDirection: "column", alignItems: "flex-start", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.brandTitleContainer}>
              <Image source={require("../../assets/images/logo2.png")} style={styles.brandLogoImage} resizeMode="cover" />
              <Text style={[styles.brandText, { color: COLORS.textDark }]}>Wellbeing Gauge</Text>
              
              {/* ✅ Active Days Remaining Header Badge */}
              <View style={{ backgroundColor: isSubscribed ? "rgba(51, 105, 86, 0.1)" : "rgba(220, 38, 38, 0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: isSubscribed ? COLORS.primary : COLORS.critical }}>
                  {isSubscribed ? `${daysRemaining} Days Left` : "Expired / Locked"}
                </Text>
              </View>
            </View>
            <Text style={[styles.greetingText, { color: COLORS.textLight }, !isDesktop && { fontSize: 24 }]}>Welcome back,</Text>
            <Text style={[styles.greetingText, { color: COLORS.textDark, fontWeight: "600", marginTop: 2 }, !isDesktop && { fontSize: 24 }]}>{user?.name || "Nishi"}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
  <TouchableOpacity 
    onPress={() => setSubscriptionModalVisible(true)} 
    style={[styles.viewPlansButton, { backgroundColor: COLORS.primary }]} 
    activeOpacity={0.8}
  >
    <Feather name="credit-card" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
    <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>View Plans</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    onPress={logout}
    style={[styles.logoutButton, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}
    activeOpacity={0.8}
  >
    <Feather name="log-out" size={14} color={COLORS.critical} />
  </TouchableOpacity>
</View>
        </View>

          {/* Dashboard Grid */}
          <View style={[styles.dashboardGridContainer, { flexDirection: isDesktop ? "row" : "column-reverse", gap: 20 }]}>
            
            {/* Left Panel */}
           <View style={[styles.secondaryCardLayout, !isDesktop && { width: "100%" }, { maxHeight: 440, position: "relative", overflow: "hidden" }]}>
             <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
               <Text style={[styles.sectionHeadingTitle, { color: COLORS.textDark }]}>Recent Activities</Text>
               <Feather name={isSubscribed ? "unlock" : "lock"} size={16} color={isSubscribed ? COLORS.primary : COLORS.critical} />
             </View>
         
             {/* ✅ Locked Overlay Context Layer Design */}
             {!isSubscribed && (
               <View style={{ position: "absolute", top: 50, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(250, 249, 245, 0.85)", zIndex: 10, justifyContent: "center", alignItems: "center", padding: 16 }}>
                 <View style={{ backgroundColor: "#FFFFFF", padding: 16, borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}>
                   <Feather name="lock" size={24} color={COLORS.secondary} style={{ marginBottom: 8 }} />
                   <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.textDark, textAlign: "center" }}>Activity Logs Locked</Text>
                   <Text style={{ fontSize: 11, color: COLORS.textLight, textAlign: "center", marginTop: 4, paddingHorizontal: 10 }}>Please unlock a subscription plan to review metrics history.</Text>
                 </View>
               </View>
             )}
         
             <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true} contentContainerStyle={{ gap: 14, paddingRight: 4, opacity: isSubscribed ? 1 : 0.2 }}>
               {recentActivities.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>No recent activities yet</Text>
                  </View>
                ) : (
                  recentActivities.map((log, index) => {
                    const isDrain = log.activityType === "DRAIN";
                    return (
                      <View key={log.activityLogId || index} style={styles.recentActivityTileRow}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: isDrain ? "rgba(220, 38, 38, 0.08)" : COLORS.excellentBg }]}>
                          <Feather name={isDrain ? "pulse" : "activity"} size={14} color={isDrain ? COLORS.critical : COLORS.excellent} />
                        </View>
                        <View style={{ flex: 1, paddingLeft: 12 }}>
                          <Text style={[styles.activityTileNameMainText, { color: COLORS.textDark }]}>{log.activityName}</Text>
                          <Text style={[styles.activityTileTimestampText, { color: COLORS.textLight }]}>{log.completedAt ? new Date(log.completedAt).toLocaleDateString() : "6/18/2026"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Feather name={isDrain ? "trending-down" : "trending-up"} size={14} color={isDrain ? COLORS.critical : COLORS.excellent} />
                          <Text style={[styles.activityTileImpactBadgeValueText, { color: isDrain ? COLORS.critical : COLORS.excellent }]}>
                            {isDrain ? "" : "+"}{log.scoreChange}%
                          </Text>
                        </View>
                        {loadingStates[log.activityId] ? (
                          <View style={styles.plusTileIconActionButton}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.plusTileIconActionButton} 
                            onPress={() => handleCompleteActivity(log.activityId, log.activityName)}
                          >
                            <Feather name="plus" size={14} color={COLORS.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                )}
             </ScrollView>
           </View>

            {/* Center Panel */}
           <View style={[styles.tankCardCenter, !isDesktop && { width: "100%", minHeight: 320 }, { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 28, gap: 16 }]}>
    {/* WaterGauge section code stays the same... */}
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginLeft: 50 }}>
      <WaterGauge percentage={Math.min(currentScore, 100)} size={isDesktop ? 160 : 140} animated={true} />
    </View>

    <View style={{ flex: 1.1, flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 10 }}>
      <View>
        <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textLight, letterSpacing: -0.1, marginTop: 2 }}>Wellbeing Score</Text>
        <Text style={{ fontSize: 44, fontWeight: "800", color: COLORS.textDark, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>{`${currentScore}%`}</Text>
      </View>

      <View style={{ backgroundColor: wellbeingStatus.bg, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, justifyContent: "center", alignItems: "center", alignSelf: "flex-start" }}>
        <Text style={{ color: wellbeingStatus.color, fontSize: 13, fontWeight: "700" }}>{wellbeingStatus.label}</Text>
      </View>
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

                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textDark, marginTop: 4 }}>
                  Activities logged: {activitiesListSource.length}
                </Text>

      <Pressable
        onPress={() => isSubscribed ? setLogModalVisible(true) : Alert.alert("Subscription Required", "Please activate a plan first.")}
        style={[styles.actionCTAButton, { backgroundColor: isSubscribed ? COLORS.primary : "#A0A8A4", opacity: isSubscribed ? 1 : 0.7, paddingVertical: 10, paddingHorizontal: 20, marginTop: 6 }]}
      >
        {/* ✅ Dynamic Lock icon design inside Button CTA */}
        <Feather name={isSubscribed ? "plus" : "lock"} size={14} color="white" style={{ marginRight: 6 }} />
        <Text style={[styles.actionCTAButtonText, { fontSize: 13 }]}>{isSubscribed ? "Log Activity" : "Locked"}</Text>
      </Pressable>
    </View>
  </View>
          </View>

          {/* Stats Grid */}
          {!statsLoading && (
            <View style={isDesktop ? styles.statsCardMainRowFlex : styles.statsCardMobileGridFlex}>
              <View style={[styles.statsMiniGridTile, { borderLeftColor: COLORS.critical }]}>
                <View style={styles.statsTileIconWrapperCircle}><Feather name="zap" size={16} color={COLORS.critical} /></View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.statsTileLabelTitle}>Drain Metrics</Text>
                  <Text style={styles.statsTileNumericalValueText}>{statsData.drainActivitiesCount}</Text>
                </View>
              </View>
              
              <View style={[styles.statsMiniGridTile, { borderLeftColor: COLORS.excellent }]}>
                <View style={styles.statsTileIconWrapperCircle}><Feather name="heart" size={16} color={COLORS.excellent} /></View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.statsTileLabelTitle}>Recovery Logs</Text>
                  <Text style={styles.statsTileNumericalValueText}>{statsData.recoveryActivitiesCount}</Text>
                </View>
              </View>

              <View style={[styles.statsMiniGridTile, { borderLeftColor: COLORS.secondary }]}>
                <View style={styles.statsTileIconWrapperCircle}><Feather name="book-open" size={16} color={COLORS.secondary} /></View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.statsTileLabelTitle}>Insights</Text>
                  <Text style={styles.statsTileNumericalValueText}>{statsData.totalTipsCount}</Text>
                </View>
              </View>

              <View style={[styles.statsMiniGridTile, { borderLeftColor: COLORS.darkSienna }]}>
                <View style={styles.statsTileIconWrapperCircle}><Feather name="check-square" size={16} color={COLORS.darkSienna} /></View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.statsTileLabelTitle}>Applied</Text>
                  <Text style={styles.statsTileNumericalValueText}>{statsData.appliedTipLogsCount}</Text>
                </View>
              </View>
            </View>
          )}

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
                
                <Text style={styles.newspaperParagraphBody} numberOfLines={bannerExpanded ? undefined : (isDesktop ? 3 : 5)}>
                  {banner.description}
                </Text>

                <View style={styles.bannerActionRow}>
                  <TouchableOpacity style={styles.bannerReadMoreBtn} onPress={() => setBannerExpanded(!bannerExpanded)} activeOpacity={0.7}>
                    <Text style={styles.bannerReadMoreBtnText}>{bannerExpanded ? "Show Less" : "Read More"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.bannerPurchaseBtn} onPress={() => Linking.openURL("https://shinrayhealth.com/product/a-l-l/")} activeOpacity={0.8}>
                    <Feather name="shopping-bag" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.bannerPurchaseBtnText}>Purchase</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Log Activity Modal */}
      <Modal animationType="slide" transparent visible={logModalVisible} onRequestClose={() => setLogModalVisible(false)}>
        <View style={styles.modalBlurDimmerView}>
          <View style={styles.modalInteractiveSheetContainer}>
            <View style={styles.modalHeaderRowLayout}>
              <Text style={[styles.modalSheetMainTitle, { color: COLORS.textDark }]}>Log Custom Activity</Text>
              <TouchableOpacity style={styles.modalCloseCircleButton} onPress={() => setLogModalVisible(false)}><Feather name="x" size={18} color={COLORS.textLight} /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
              <Text style={[styles.formInputLabelTitle, { color: COLORS.textLight }]}>Activity Title</Text>
              <TextInput style={[styles.modalTextInputField, { color: COLORS.textDark, borderColor: COLORS.border }]} placeholder="e.g., Morning Walk" placeholderTextColor="#A0522D" value={formName} onChangeText={setFormName} />
              <Text style={[styles.formInputLabelTitle, { color: COLORS.textLight }]}>Classification Type</Text>
              <View style={{ zIndex: 100, marginBottom: 16 }}>
                <TouchableOpacity style={[styles.dropdownTriggerButtonField, { borderColor: COLORS.border }]} onPress={() => setShowTypeDropdown(!showTypeDropdown)}>
                  <Text style={{ color: COLORS.textDark, fontWeight: "500" }}>{formType}</Text>
                  <Feather name={showTypeDropdown ? "chevron-up" : "chevron-down"} size={16} color={COLORS.textLight} />
                </TouchableOpacity>
                {showTypeDropdown && (
                  <View style={[styles.dropdownOverlayPillsBoxCard, { borderColor: COLORS.border }]}>
                    {(["DRAIN", "RECOVERY"] as const).map((type) => (
                      <TouchableOpacity key={type} style={[styles.dropdownItemSelectionRowTile, formType === type && { backgroundColor: "rgba(160, 82, 45, 0.08)" }]} onPress={() => { setFormType(type); setShowTypeDropdown(false); }}>
                        <Text style={[styles.dropdownItemSelectionRowTileText, { color: COLORS.textDark }, formType === type && { color: COLORS.primary, fontWeight: "700" }]}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <Text style={[styles.formInputLabelTitle, { color: COLORS.textLight }]}>Contribution %</Text>
              <TextInput style={[styles.modalTextInputField, { color: COLORS.textDark, borderColor: COLORS.border }]} placeholder="e.g., 15" placeholderTextColor="#A0522D" keyboardType="number-pad" value={formPercentage} onChangeText={setFormPercentage} />
              <TouchableOpacity style={[styles.modalFormSubmitButtonCTA, { backgroundColor: COLORS.primary }]} onPress={handleAddActivitySubmit} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.modalFormSubmitButtonCTAText}>Commit Entry</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal animationType="fade" transparent visible={successModalVisible} onRequestClose={() => setSuccessModalVisible(false)}>
        <View style={styles.modalCenterDimmerOverlayView}>
          <View style={styles.modalSuccessCardContainer}>
            <View style={[styles.modalCheckCircleIconGraphicBadge, { backgroundColor: COLORS.excellent }]}><Feather name="check" size={28} color="white" /></View>
            <Text style={[styles.modalSuccessHeadingMainTitleText, { color: COLORS.textDark }]}>Activity Logged!</Text>
            <Text style={[styles.modalSuccessBodyParagraphText, { color: COLORS.textLight }]}>Your wellness journey updated successfully.</Text>
            <TouchableOpacity style={[styles.modalDismissCTAAnchorButton, { backgroundColor: COLORS.primary }]} onPress={() => setSuccessModalVisible(false)}><Text style={styles.modalDismissCTAAnchorButtonText}>Continue</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ Free Trial Success Modal */}
       <Modal animationType="fade" transparent visible={trialSuccessModalVisible} onRequestClose={() => setTrialSuccessModalVisible(false)}>
         <View style={styles.modalCenterDimmerOverlayView}>
           <View style={styles.modalSuccessCardContainer}>
             <View style={[styles.modalCheckCircleIconGraphicBadge, { backgroundColor: COLORS.primary }]}>
               <Feather name="gift" size={28} color="white" />
             </View>
             <Text style={[styles.modalSuccessHeadingMainTitleText, { color: COLORS.textDark, textAlign: 'center' }]}>
               Free Trial Activated!
             </Text>
             <Text style={[styles.modalSuccessBodyParagraphText, { color: COLORS.textLight, marginTop: 8 }]}>
               Your complimentary trial has been successfully set up. Now you need to logout to Activate start Free Trail.
             </Text>
             <TouchableOpacity 
               style={[styles.modalDismissCTAAnchorButton, { backgroundColor: COLORS.primary, marginTop: 16 }]} 
               onPress={logout}
             >
               <Text style={styles.modalDismissCTAAnchorButtonText}>Explore Features</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
         <Modal animationType="fade" transparent visible={paymentSuccessModalVisible} onRequestClose={() =>  setPaymentSuccessModalVisible(false)}>
         <View style={styles.modalCenterDimmerOverlayView}>
           <View style={styles.modalSuccessCardContainer}>
             <View style={[styles.modalCheckCircleIconGraphicBadge, { backgroundColor: COLORS.primary }]}>
               <Feather name="gift" size={28} color="white" />
             </View>
             <Text style={[styles.modalSuccessHeadingMainTitleText, { color: COLORS.textDark, textAlign: 'center' }]}>
               Your Plan was  Activated!
             </Text>
             <Text style={[styles.modalSuccessBodyParagraphText, { color: COLORS.textLight, marginTop: 8 }]}>
               Your plan has been successfully set up. Now you need to logout to Activate your plan.
             </Text>
             <TouchableOpacity 
               style={[styles.modalDismissCTAAnchorButton, { backgroundColor: COLORS.primary, marginTop: 16 }]} 
               onPress={logout}
             >
               <Text style={styles.modalDismissCTAAnchorButtonText}>Explore Features</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>

       <Modal animationType="fade" transparent={true} visible={paymentFailureModalVisible} onRequestClose={() => setPaymentFailureModalVisible(false)}>
               <View style={styles.completionOverlayCenteredDimmer}>
                 <View style={styles.completionSuccessCardAlert}>
                   <LinearGradient colors={["#DC2626", "#EF4444"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.completionGraphicBadgeWrapper}>
                     <Feather name="trash-2" size={32} color="#FFFFFF" />
                   </LinearGradient>
                   <Text style={[styles.completionSuccessHeadingTitle, { color: COLORS.textDark }]}>Your Payment Failed</Text>
                   <Text style={[styles.completionSuccessParagraphBody, { color: COLORS.textLight }]}>
                     The activity has been completely removed from your active layout structure.
                   </Text>
                   <TouchableOpacity style={[styles.completionDismissMainAnchorCTA, { backgroundColor: COLORS.primary }]} activeOpacity={0.8} onPress={() => setPaymentFailureModalVisible(false)}>
                     <Text style={[styles.completionDismissAnchorText, { color: '#FFFFFF' }]}>Close</Text>
                   </TouchableOpacity>
                 </View>
               </View>
             </Modal>

      {/* Choose Plan Modal */}
      <ChoosePlanModal
        visible={subscriptionModalVisible}
        paymentProcessing={paymentProcessing}
        isDesktop={isDesktop}
        isSubscribed={isSubscribed}
        apiPlans={apiPlans}
        selectedPlan={selectedPlan}
        COLORS={COLORS}
        onClose={() => setSubscriptionModalVisible(false)}
        onSelectPlan={handleSelectPlan}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingCenterWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingMessageText: { marginTop: 12, fontSize: 14, fontWeight: "600" },
  blurredLiquidSphere1: { position: "absolute", width: 250, height: 250, borderRadius: 125, backgroundColor: COLORS.secondary, opacity: 0.24, top: "15%", left: -70, ...Platform.select({ web: { filter: "blur(75px)" } }), zIndex: 0 },
  blurredLiquidSphere2: { position: "absolute", width: 320, height: 320, borderRadius: 160, backgroundColor: COLORS.primary, opacity: 0.15, bottom: "20%", right: -100, ...Platform.select({ web: { filter: "blur(90px)" } }), zIndex: 0 },
  blurredLiquidSphere3: { position: "absolute", width: 190, height: 190, borderRadius: 95, backgroundColor: COLORS.darkSienna, opacity: 0.2, top: "50%", left: "32%", ...Platform.select({ web: { filter: "blur(70px)" } }), zIndex: 0 },
  brandText: { fontSize: 20, fontWeight: "700", letterSpacing: 0.2 },
  headerRow: { width: "100%" },
  logoutButton: { padding: 10, borderRadius: 40, alignItems: 'center',justifyContent: 'center'},
  brandTitleContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandLogoImage: { width: 44, height: 44, borderRadius: 10 },
  greetingText: { fontSize: 28, fontWeight: "300", letterSpacing: -0.5 },
  viewPlansButton: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 40, elevation: 3 },
  dashboardGridContainer: { width: "100%", gap: 20, alignItems: "stretch" },
  tankCardCenter: { flex: 1.2, width: "100%", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.cardBg, borderRadius: 48, paddingVertical: 24, paddingHorizontal: 32, borderWidth: 1, borderColor: COLORS.border },
  actionCTAButton: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 40, flexDirection: "row", alignItems: "center", elevation: 4, marginTop: 6 },
  actionCTAButtonText: { color: "white", fontWeight: "700", fontSize: 14 },
  secondaryCardLayout: { flex: 1.1, width: "100%", backgroundColor: COLORS.cardBg, borderRadius: 28, padding: 22, borderWidth: 1, marginBottom:10, borderColor: COLORS.border },
  sectionHeadingTitle: { fontSize: 15, fontWeight: "700" },
  recentActivityTileRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  activityTileNameMainText: { fontSize: 14, fontWeight: "600" },
  activityTileTimestampText: { fontSize: 11, marginTop: 2 },
  activityTileImpactBadgeValueText: { fontSize: 13, fontWeight: "700" },
  emptyStateContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyStateText: { fontSize: 14, color: "#7B8E85" },
  modalBlurDimmerView: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(74, 35, 26, 0.4)" },
  modalInteractiveSheetContainer: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxWidth: 500, width: "100%", alignSelf: "center" },
  modalHeaderRowLayout: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalSheetMainTitle: { fontSize: 18, fontWeight: "800" },
  modalCloseCircleButton: { backgroundColor: "#F1F5F9", padding: 8, borderRadius: 40 },
  formInputLabelTitle: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 6 },
  modalTextInputField: { backgroundColor: "#FAF9F5", borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 14, marginBottom: 16 },
  dropdownTriggerButtonField: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAF9F5", borderWidth: 1, borderRadius: 16, padding: 14 },
  dropdownOverlayPillsBoxCard: { backgroundColor: "white", borderRadius: 16, borderWidth: 1, marginTop: 4, padding: 6, position: "absolute", top: 52, left: 0, right: 0, zIndex: 999 },
  dropdownItemSelectionRowTile: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  dropdownItemSelectionRowTileText: { fontSize: 14 },
  modalFormSubmitButtonCTA: { paddingVertical: 16, borderRadius: 40, alignItems: "center", justifyContent: "center", marginTop: 8 },
  modalFormSubmitButtonCTAText: { color: "white", fontSize: 14, fontWeight: "700" },
  modalCenterDimmerOverlayView: { flex: 1, backgroundColor: "rgba(74, 35, 26, 0.4)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalSuccessCardContainer: {backgroundColor: "white",borderRadius: 32,padding: 28,width: "100%", maxWidth: 350,alignItems: "center",elevation: 10,shadowColor: "#000",shadowOffset: { width: 0, height: 4 },shadowOpacity: 0.25,},
  modalCheckCircleIconGraphicBadge: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  modalSuccessHeadingMainTitleText: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  modalSuccessBodyParagraphText: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  modalDismissCTAAnchorButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 40, width: "100%", alignItems: "center" },
  modalDismissCTAAnchorButtonText: { color: "white", fontWeight: "700", fontSize: 14 },
  statsCardMainRowFlex: { width: "100%", flexDirection: "row", gap: 14, marginTop: 20, justifyContent: "space-between" },
  statsCardMobileGridFlex: { width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 20, justifyContent: "space-between" },
  styles: { flex: 1 },
  completionOverlayCenteredDimmer: {flex: 1,backgroundColor: "rgba(17, 35, 29, 0.4)",justifyContent: "center",alignItems: "center",padding: 24,},
  completionSuccessCardAlert: {backgroundColor: "#FFFFFF",borderRadius: 32,padding: 28,maxWidth: 380,width: "100%",alignItems: "center",borderWidth: 1,borderColor: COLORS.border,...Platform.select({  ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.04, shadowRadius: 24 },  android: { elevation: 5 },}),},
  completionGraphicBadgeWrapper: {width: 64,height: 64,borderRadius: 22,alignItems: "center",justifyContent: "center",marginBottom: 20,},
  completionSuccessHeadingTitle: {fontSize: 20,fontWeight: "800",marginBottom: 8,textAlign: "center",},
  completionSuccessParagraphBody: {fontSize: 14,textAlign: "center",lineHeight: 21,marginBottom: 24,paddingHorizontal: 8,},
  completionDismissMainAnchorCTA: {paddingVertical: 14,borderRadius: 16,width: "100%",alignItems: "center",justifyContent: "center",},
  completionDismissAnchorText: {fontWeight: "700",fontSize: 14,},
  plusTileIconActionButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(51, 105, 86, 0.08)", alignItems: "center", justifyContent: "center" },
  statsMiniGridTile: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 5, width: isDesktop ? "23%" : "48%", minHeight: 65 },
  statsTileIconWrapperCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.03)", alignItems: "center", justifyContent: "center" },
  statsTileLabelTitle: { fontSize: 11, fontWeight: "700", color: COLORS.textLight, textTransform: "uppercase" },
  statsTileNumericalValueText: { fontSize: 18, fontWeight: "800", color: COLORS.textDark, marginTop: 2 },
  newspaperBannerCard: { backgroundColor: "rgba(255, 255, 255, 0.85)", borderWidth: 1, borderColor: "rgba(51, 105, 86, 0.08)", marginVertical: 12, marginBottom: 28, borderRadius: 28, shadowColor: "#1B2A24", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2, position: "relative", overflow: "hidden" },
  newspaperInnerPadding: { paddingHorizontal: 22, paddingVertical: 20 },
  newspaperBadgeContainer: { backgroundColor: "#336956", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8 },
  newspaperBadgeText: { color: "#FAF9F5", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  newspaperHeadlineTitle: { fontSize: 22, fontWeight: "800", color: "#1B2A24", marginTop: 10, marginBottom: 6, letterSpacing: -0.3, lineHeight: 26 },
  newspaperDividerLine: { height: 1, backgroundColor: "rgba(51, 105, 86, 0.08)", marginVertical: 10 },
  newspaperParagraphBody: { fontSize: 13, color: "#576860", lineHeight: 20, textAlign: "left" },
  bannerActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 14 },
  bannerReadMoreBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(51, 105, 86, 0.06)', borderWidth: 1, borderColor: 'rgba(51, 105, 86, 0.12)' },
  bannerReadMoreBtnText: { color: '#336956', fontSize: 12, fontWeight: '700' },
  bannerPurchaseBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#E09643', shadowColor: '#E09643', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 2 },
  bannerPurchaseBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});