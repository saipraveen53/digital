// app/(user)/logs.tsx
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Animated as RNAnimated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { rootApi } from "../utils/axiosInstance";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isDesktop = screenWidth >= 1024;

const COLORS = {
  background: "#FAF9F5",       
  cardBg: "rgba(255, 255, 255, 0.90)",   
  textDark: "#11231D",        
  textLight: "#576860",       
  primary: "#336956",         
  secondary: "#E09643",       
  darkSienna: "#1B4235",      
  border: "rgba(51, 105, 86, 0.08)", 
  
  recoveryGreen: "#336956",   
  recoveryBg: "rgba(51, 105, 86, 0.08)", 
  drainColor: "#DC2626",       
};

interface ActivityItem {
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

export default function LogsScreen() {
  const [customActivities, setCustomActivities] = useState<ActivityItem[]>([]);
  const [drainActivities, setDrainActivities] = useState<ActivityItem[]>([]);
  const [recoveryActivities, setRecoveryActivities] = useState<ActivityItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentActivityLog[]>([]);

  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [toggleLoadingStates, setToggleLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [globalLoading, setGlobalLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Success Modal States
  const [completionSuccessVisible, setCompletionSuccessVisible] = useState(false);
  const [completedActivityName, setCompletedActivityName] = useState("");
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);

  const [newFormName, setNewFormName] = useState("");
  const [newFormType, setNewFormType] = useState<"DRAIN" | "RECOVERY">("DRAIN");
  const [newFormPerc, setNewFormPerc] = useState("");

  const panY = useRef(new RNAnimated.Value(0)).current;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          RNAnimated.timing(panY, {
            toValue: screenHeight,
            duration: 240,
            useNativeDriver: true,
          }).start(() => {
            setModalVisible(false);
            panY.setValue(0);
          });
        } else {
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setGlobalLoading(true);
    try {
      const resCustom = await rootApi.get<ActivityItem[]>("/api/user/getActivities");
      setCustomActivities(resCustom.data || []);

      const resDrain = await rootApi.get<ActivityItem[]>("/api/user/getActivities?activityType=DRAIN");
      setDrainActivities(resDrain.data || []);

      const resRecovery = await rootApi.get<ActivityItem[]>("/api/user/getActivities?activityType=RECOVERY");
      setRecoveryActivities(resRecovery.data || []);

      const resRecent = await rootApi.get<RecentActivityLog[]>("/api/user/recent-activities");
      setRecentLogs(resRecent.data || []);
    } catch (err) {
      console.error("Data parsing synchronization rejected:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleCompleteActivity = async (activityId: string, activityName: string) => {
    setLoadingStates((prev) => ({ ...prev, [activityId]: true }));
    try {
      await rootApi.post(`/api/user/completeActivity?activityId=${activityId}`);
      const resRecent = await rootApi.get<RecentActivityLog[]>("/api/user/recent-activities");
      setRecentLogs(resRecent.data || []);

      setCompletedActivityName(activityName);
      setCompletionSuccessVisible(true);
    } catch (err) {
      console.error("Failed processing completion key context:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [activityId]: false }));
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    setToggleLoadingStates((prev) => ({ ...prev, [activityId]: true }));
    try {
      await rootApi.put(`/api/user/delete/${activityId}`, null, {
        params: { status: false },
      });

      const filterUpdater = (prev: ActivityItem[]) =>
        prev.filter((item) => item.activityId !== activityId);

      setCustomActivities(filterUpdater);
      setDrainActivities(filterUpdater);
      setRecoveryActivities(filterUpdater);
      
      setDeleteSuccessVisible(true);
      fetchAllData();
    } catch (err) {
      console.error("Failed executing delete request matrix:", err);
    } finally {
      setToggleLoadingStates((prev) => ({ ...prev, [activityId]: false }));
    }
  };

  const handleCreateActivity = async () => {
    if (!newFormName.trim() || !newFormPerc) return;

    const payload = {
      activityName: newFormName.trim(),
      activityType: newFormType,
      contributionPercentage: parseInt(newFormPerc, 10) || 0,
    };

    try {
      await rootApi.post("/api/user/addActivity", payload);
      setModalVisible(false);
      setNewFormName("");
      setNewFormPerc("");
      fetchAllData();
    } catch (err) {
      console.error("Payload rejected by server context matrix:", err);
    }
  };

  const sphereStyleLeft = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [0, -220]) }],
  }));

  const sphereStyleRight = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [120, -130]) }],
  }));

  const sphereStyleCenter = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [-50, -380]) }],
  }));

  if (globalLoading) {
    return (
      <View style={[styles.loadingWrapperContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingContextText, { color: COLORS.textDark }]}>
          Synchronizing Bright Buffers...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Animated.View style={[styles.blurredLiquidSphere1, sphereStyleLeft]} />
      <Animated.View style={[styles.blurredLiquidSphere2, sphereStyleRight]} />
      <Animated.View style={[styles.blurredLiquidSphere3, sphereStyleCenter]} />

      <View style={styles.fixedBarHeaderLayout}>
        <View style={styles.headerLimitConstraintRow}>
          <View>
            <Text style={[styles.brandTitleText, { color: COLORS.textDark }]}>Manage Logs</Text>
            <Text style={[styles.brandSubtitleText, { color: COLORS.textLight }]}>
              Track, record, and configure metrics matrix
            </Text>
          </View>

          {isDesktop ? (
            <TouchableOpacity
              style={[styles.desktopTriggerCTAButton, { backgroundColor: COLORS.primary }]}
              activeOpacity={0.8}
              onPress={() => {
                panY.setValue(0);
                setModalVisible(true);
              }}
            >
              <Feather name="plus-circle" size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={styles.desktopTriggerCTAText}>Add Custom Activity</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.mobileRoundTriggerCTAButton, { backgroundColor: COLORS.primary }]}
              activeOpacity={0.8}
              onPress={() => {
                panY.setValue(0);
                setModalVisible(true);
              }}
            >
              <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainerViewLayout}
        showsVerticalScrollIndicator={false}
      >
        <View style={isDesktop ? styles.statsCardGridContainer : styles.statsCardMobileGridFlex}>
          <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.secondary }]}>
            <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(224, 150, 67, 0.08)" }]}>
              <Feather name="layers" size={16} color={COLORS.secondary} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.statMiniCardLabel, { color: COLORS.textLight }]}>Total Created</Text>
              <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                {customActivities.length}
              </Text>
            </View>
          </View>

          <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.drainColor }]}>
            <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(220, 38, 38, 0.08)" }]}>
              <Feather name="trending-down" size={16} color={COLORS.drainColor} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.statMiniCardLabel, { color: COLORS.textLight }]}>Drain Types</Text>
              <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                {drainActivities.length}
              </Text>
            </View>
          </View>

          <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.recoveryGreen }]}>
            <View style={[styles.statIconBadgeCircle, { backgroundColor: COLORS.recoveryBg }]}>
              <Feather name="trending-up" size={16} color={COLORS.recoveryGreen} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.statMiniCardLabel, { color: COLORS.textLight }]}>Recovery Types</Text>
              <Text style={[styles.statMiniCardValue, { color: COLORS.recoveryGreen }]}>
                {recoveryActivities.length}
              </Text>
            </View>
          </View>

          <View style={[styles.premiumStatCard, { borderLeftColor: COLORS.darkSienna }]}>
            <View style={[styles.statIconBadgeCircle, { backgroundColor: "rgba(27, 66, 53, 0.08)" }]}>
              <Feather name="clock" size={16} color={COLORS.darkSienna} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.statMiniCardLabel, { color: COLORS.textLight }]}>Recent History</Text>
              <Text style={[styles.statMiniCardValue, { color: COLORS.textDark }]}>
                {recentLogs.length}
              </Text>
            </View>
          </View>
        </View>

        <View style={isDesktop ? styles.desktopBentoContainerGrid : styles.mobileVerticalStackedLayout}>
          
          {/* LEFT COLUMN: Recovery Activities */}
          <View style={isDesktop ? styles.desktopGridFlexibleColumn : styles.fullWidthPanelStack}>
            <View style={styles.glassDashboardCardItem}>
              <View style={styles.headerTitleContainerRowLayout}>
                <Feather name="trending-up" size={18} color={COLORS.recoveryGreen} style={{ marginRight: 8 }} />
                <Text style={[styles.cardSectionMainTitleText, { color: COLORS.recoveryGreen }]}>
                  Recovery Activities
                </Text>
              </View>
              
              <ScrollView style={styles.innerScrollLayoutList} nestedScrollEnabled={true}>
                {recoveryActivities.map((item) => (
                  <View key={item.activityId} style={[styles.activityHorizontalTileRowLayout, !item.status && { opacity: 0.55 }]}>
                    <View style={{ flex: 1, paddingRight: 4 }}>
                      <Text style={[styles.activityItemNameMainText, { color: COLORS.textDark }]} numberOfLines={2}>
                        {item.activityName}
                      </Text>
                    </View>
                    <View style={styles.actionControlInteractiveRowGroup}>
                      <Text style={[styles.percentageMetricDisplayValueText, { color: COLORS.recoveryGreen }]}>
                        +{item.activityPercenage}%
                      </Text>

                      {loadingStates[item.activityId] ? (
                        <View style={styles.plusTileIconActionButton}>
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.plusTileIconActionButton} onPress={() => handleCompleteActivity(item.activityId, item.activityName)}>
                          <Feather name="plus" size={14} color={COLORS.primary} />
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity 
                        style={{ marginLeft: 8, padding: 6 }} 
                        onPress={() => handleDeleteActivity(item.activityId)}
                        disabled={toggleLoadingStates[item.activityId]}
                      >
                        {toggleLoadingStates[item.activityId] ? (
                          <ActivityIndicator size="small" color={COLORS.drainColor} />
                        ) : (
                          <Feather name="trash-2" size={16} color={COLORS.drainColor} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* RIGHT COLUMN: Draining Activities */}
          <View style={isDesktop ? styles.desktopGridFlexibleColumn : styles.fullWidthPanelStack}>
            <View style={styles.glassDashboardCardItem}>
              <View style={styles.headerTitleContainerRowLayout}>
                <Feather name="trending-down" size={18} color={COLORS.drainColor} style={{ marginRight: 8 }} />
                <Text style={[styles.cardSectionMainTitleText, { color: COLORS.drainColor }]}>
                  Draining Activities
                </Text>
              </View>
              
              <ScrollView style={styles.innerScrollLayoutList} nestedScrollEnabled={true}>
                {drainActivities.map((item) => (
                  <View key={item.activityId} style={[styles.activityHorizontalTileRowLayout, !item.status && { opacity: 0.55 }]}>
                    <View style={{ flex: 1, paddingRight: 4 }}>
                      <Text style={[styles.activityItemNameMainText, { color: COLORS.textDark }]} numberOfLines={2}>
                        {item.activityName}
                      </Text>
                    </View>
                    <View style={styles.actionControlInteractiveRowGroup}>
                      <Text style={[styles.percentageMetricDisplayValueText, { color: COLORS.drainColor }]}>
                        -{item.activityPercenage}%
                      </Text>

                      {loadingStates[item.activityId] ? (
                        <View style={styles.plusTileIconActionButton}>
                          <ActivityIndicator size="small" color={COLORS.drainColor} />
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.plusTileIconActionButton} onPress={() => handleCompleteActivity(item.activityId, item.activityName)}>
                          <Feather name="plus" size={14} color={COLORS.primary} />
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity 
                        style={{ marginLeft: 8, padding: 6 }}
                        onPress={() => handleDeleteActivity(item.activityId)}
                        disabled={toggleLoadingStates[item.activityId]}
                      >
                        {toggleLoadingStates[item.activityId] ? (
                          <ActivityIndicator size="small" color={COLORS.drainColor} />
                        ) : (
                          <Feather name="trash-2" size={16} color={COLORS.drainColor} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

        </View>
      </Animated.ScrollView>

      {/* COMPLETION ALERTS MODAL POPUP */}
      <Modal animationType="fade" transparent={true} visible={completionSuccessVisible} onRequestClose={() => setCompletionSuccessVisible(false)}>
        <View style={styles.completionOverlayCenteredDimmer}>
          <View style={styles.completionSuccessCardAlert}>
            <LinearGradient colors={["#336956", "#458A72"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.completionGraphicBadgeWrapper}>
              <Feather name="check-circle" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.completionSuccessHeadingTitle, { color: COLORS.textDark }]}>Activity Completed!</Text>
            <Text style={[styles.completionSuccessParagraphBody, { color: COLORS.textLight }]}>
              "<Text style={{ fontWeight: "700", color: COLORS.textDark }}>{completedActivityName}</Text>" inside your wellness tracking matrices matrix has been captured successfully.
            </Text>
            <TouchableOpacity style={[styles.completionDismissMainAnchorCTA, { backgroundColor: COLORS.primary }]} activeOpacity={0.8} onPress={() => setCompletionSuccessVisible(false)}>
              <Text style={[styles.completionDismissAnchorText, { color: '#FFFFFF' }]}>Dismiss Console</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NEW: DELETE SUCCESS MODAL POPUP */}
      <Modal animationType="fade" transparent={true} visible={deleteSuccessVisible} onRequestClose={() => setDeleteSuccessVisible(false)}>
        <View style={styles.completionOverlayCenteredDimmer}>
          <View style={styles.completionSuccessCardAlert}>
            <LinearGradient colors={["#DC2626", "#EF4444"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.completionGraphicBadgeWrapper}>
              <Feather name="trash-2" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.completionSuccessHeadingTitle, { color: COLORS.textDark }]}>Activity Deleted Successfully</Text>
            <Text style={[styles.completionSuccessParagraphBody, { color: COLORS.textLight }]}>
              The activity has been completely removed from your active layout structure.
            </Text>
            <TouchableOpacity style={[styles.completionDismissMainAnchorCTA, { backgroundColor: COLORS.drainColor }]} activeOpacity={0.8} onPress={() => setDeleteSuccessVisible(false)}>
              <Text style={[styles.completionDismissAnchorText, { color: '#FFFFFF' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD CUSTOM ACTIVITY FORM SHEET */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBlurOverlayDimmer}>
          <RNAnimated.View style={[styles.modalInteractiveSheetContainer, { transform: [{ translateY: panY }] }]}>
            <View style={styles.modalTopIndicatorHandle} {...panResponder.panHandlers} />
            <View style={styles.modalHeaderRowLayout} {...panResponder.panHandlers}>
              <Text style={[styles.modalSheetMainTitle, { color: COLORS.textDark }]}>Add Custom Activity</Text>
              <TouchableOpacity style={styles.modalCloseCircleButton} onPress={() => setModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Activity Identifier Title</Text>
            <TextInput style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]} placeholder="e.g., Late night doom scroll" placeholderTextColor={COLORS.textLight} value={newFormName} onChangeText={setNewFormName} />

            <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Classification Type Mapping</Text>
            <View style={[styles.modalInlineSelectorPillRow, { borderColor: COLORS.border }]}>
              {(["DRAIN", "RECOVERY"] as const).map((t) => (
                <TouchableOpacity key={t} style={[styles.modalSelectorPillBtn, newFormType === t && styles.modalSelectorPillBtnActive]} onPress={() => setNewFormType(t)}>
                  <Text style={[styles.modalSelectorPillText, { color: COLORS.textLight }, newFormType === t && { color: COLORS.primary }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Contribution Percentage Value</Text>
            <TextInput style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]} placeholder="Value between 1 - 60" placeholderTextColor={COLORS.textLight} keyboardType="number-pad" value={newFormPerc} onChangeText={setNewFormPerc} />

            <TouchableOpacity style={[styles.modalSubmitButtonCTA, { backgroundColor: COLORS.primary }]} onPress={handleCreateActivity}>
              <Text style={styles.modalSubmitButtonCTAText}>Construct Action Point</Text>
            </TouchableOpacity>
          </RNAnimated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrapperContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContextText: {
    marginTop: 14,
    fontWeight: "600",
    fontSize: 14,
  },
  blurredLiquidSphere1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondary,
    opacity: 0.15,
    top: "15%",
    left: -70,
    ...Platform.select({ web: { filter: "blur(75px)" } }),
    zIndex: 0,
  },
  blurredLiquidSphere2: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
    bottom: "20%",
    right: -100,
    ...Platform.select({ web: { filter: "blur(90px)" } }),
    zIndex: 0,
  },
  blurredLiquidSphere3: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORS.darkSienna,
    opacity: 0.14,
    top: "50%",
    left: "32%",
    ...Platform.select({ web: { filter: "blur(70px)" } }),
    zIndex: 0,
  },
  fixedBarHeaderLayout: {
    backgroundColor: "rgba(255, 255, 255, 0.90)",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  headerLimitConstraintRow: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandTitleText: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  brandSubtitleText: {
    fontSize: 13,
    marginTop: 2,
  },
  desktopTriggerCTAButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  desktopTriggerCTAText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  mobileRoundTriggerCTAButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainerViewLayout: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },
  statsCardGridContainer: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    gap: 14,
    marginBottom: 24,
  },
  statsCardMobileGridFlex: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  premiumStatCard: {
    flex: isDesktop ? 1 : 0,
    width: isDesktop ? "auto" : "48%", 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statIconBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statMiniCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statMiniCardValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  desktopBentoContainerGrid: {
    flexDirection: "row",
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    justifyContent: "space-between",
  },
  mobileVerticalStackedLayout: {
    flexDirection: "column",
    width: "100%",
  },
  desktopGridFlexibleColumn: {
    width: "49%",
  },
  fullWidthPanelStack: {
    width: "100%",
  },
  glassDashboardCardItem: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.02, shadowRadius: 16 },
      android: { elevation: 2 },
    }),
    zIndex: 3,
  },
  cardSectionMainTitleText: {
    fontSize: 18,
    fontWeight: "800",
  },
  headerTitleContainerRowLayout: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  innerScrollLayoutList: {
    maxHeight: 280, 
    paddingRight: 4,
  },
  activityHorizontalTileRowLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 105, 86, 0.06)",
  },
  activityItemNameMainText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  actionControlInteractiveRowGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 130, 
  },
  percentageMetricDisplayValueText: {
    fontSize: 15,
    fontWeight: "900",
    marginRight: 8,
  },
  plusTileIconActionButton: {
    backgroundColor: "#F1F5F9",
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  modalBlurOverlayDimmer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17, 35, 29, 0.3)",
  },
  modalInteractiveSheetContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
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
    marginBottom: 20,
  },
  modalCloseCircleButton: {
    padding: 4,
  },
  modalSheetMainTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalLabelTitleField: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalTextInputBoxComponent: {
    backgroundColor: "#FAF9F5",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  modalInlineSelectorPillRow: {
    flexDirection: "row",
    backgroundColor: "#FAF9F5",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalSelectorPillBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  modalSelectorPillBtnActive: {
    backgroundColor: "white",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  modalSelectorPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  completionOverlayCenteredDimmer: {
    flex: 1,
    backgroundColor: "rgba(17, 35, 29, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  completionSuccessCardAlert: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 28,
    maxWidth: 380,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.04, shadowRadius: 24 },
      android: { elevation: 5 },
    }),
  },
  completionGraphicBadgeWrapper: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  completionSuccessHeadingTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  completionSuccessParagraphBody: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  completionDismissMainAnchorCTA: {
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  completionDismissAnchorText: {
    fontWeight: "700",
    fontSize: 14,
  },
  modalSubmitButtonCTA: {
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalSubmitButtonCTAText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#FFFFFF",
  },
});