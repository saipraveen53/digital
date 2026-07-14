import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // ✅ FIXED: Missing import added
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ApiSubscriptionPlan {
  subId: string;
  subName: string;
  subDescription: string;
  price: number;
  durationDays: number;
  status: boolean;
  // additional fields from API response (not used in UI)
  discountAmount?: number;
  finalPrice?: number;
}

interface ChoosePlanModalProps {
  visible: boolean;
  paymentProcessing: boolean;
  isDesktop: boolean;
  isSubscribed: boolean;
  apiPlans: ApiSubscriptionPlan[];
  selectedPlan: string | null;
  COLORS: any;
  onClose: () => void;
  onSelectPlan: (plan: ApiSubscriptionPlan) => void;
}

export function ChoosePlanModal({
  visible,
  paymentProcessing,
  isDesktop,
  isSubscribed,
  apiPlans,
  selectedPlan,
  COLORS,
  onClose,
  onSelectPlan,
}: ChoosePlanModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={() => !paymentProcessing && onClose()}
    >
      <View style={styles.modalOverlay}>
        {/* Screen hang అవ్వకుండా బ్యాక్‌డ్రాప్ ప్రెస్ చేస్తే క్లోజ్ అయ్యే ఆప్షన్ (పేమెంట్ ప్రాసెస్ లో లేనప్పుడు) */}
        <Pressable 
          style={styles.modalBackdrop} 
          onPress={() => !paymentProcessing && onClose()} 
        />
        
        <View
          style={[
            styles.subscriptionModalContainer,
            { width: isDesktop ? "85%" : "94%", maxWidth: 1000 },
          ]}
        >
          <LinearGradient
            colors={["#FFFFFF", "#FAF9F5", "#FFEFEA", "#FDF5E6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subscriptionModalContent}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.modalTitle, { color: COLORS.textDark }]}>
                    Choose Your Plan
                  </Text>
                  <View style={[styles.premiumSparkBadge, { backgroundColor: COLORS.primary }]}>
                    <Feather name="sparkles" size={10} color="#FFFFFF" />
                    <Text style={styles.premiumSparkBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={[styles.modalSubtitleTextText, { color: COLORS.textLight }]}>
                  Unlock premium tracking insights and maximize your wellness velocity
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={onClose}
                disabled={paymentProcessing}
                style={[styles.enhancedCloseCircleBtn, paymentProcessing && { opacity: 0.5 }]}
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Plans List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24, paddingTop: 10 }}
            >
              <View style={[styles.plansGrid, { flexDirection: isDesktop ? "row" : "column", gap: 18 }]}>
                {apiPlans.map((plan) => {
                  const isFreeTrial =
                    plan.subName.toLowerCase().includes("trial") || plan.price === 0;

                  if (isFreeTrial && isSubscribed) {
                    return null;
                  }

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
                      onPress={() => !paymentProcessing && onSelectPlan(plan)}
                      disabled={paymentProcessing}
                      style={({ pressed }) => [
                        styles.premiumPlanCardFrame,
                        shadowIntensityStyle,
                        pressed && !paymentProcessing && { transform: [{ scale: 0.97 }] },
                        isSelected && styles.activeSelectedCardRingBorder,
                        paymentProcessing && { opacity: 0.6 },
                        {
                          flex: isDesktop ? 1 : 0,
                          minWidth: isDesktop ? 260 : "100%",
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
                        <View style={styles.cardFloatingBubbleGraphicBottom} />

                        <View style={styles.planIconWrapperFrame}>
                          <Feather
                            name={isFreeTrial ? "gift" : plan.durationDays > 90 ? "award" : "zap"}
                            size={26}
                            color="#FFFFFF"
                          />
                        </View>

                        <Text style={styles.planHeadlineNameText} numberOfLines={1}>
                          {plan.subName}
                        </Text>

                        <View style={styles.priceRowWrapperContainer}>
                          <Text style={styles.planPrimaryCurrencyValueSymbol}>
                            {plan.price === 0 ? "" : "₹"}
                            {plan.finalPrice?.toFixed(2) || plan.price.toFixed(2)}
                          </Text>
                          <Text style={styles.planNumericalPriceBoldText}>
                            {plan.price === 0 ? "FREE" : plan.price}
                          </Text>
                          <Text style={styles.planPricePeriodModifierText}>
                            /{plan.durationDays}d
                          </Text>
                        </View>

                        <View style={styles.premiumFeaturesBulletListContainer}>
                          <View style={styles.featureItemDividerLine} />
                          <Text style={styles.featureItemParagraphBodyText} numberOfLines={3}>
                            {plan.subDescription ||
                              "Full access to advanced psychological score gauges, data metrics, custom tip logs and activities dashboard sync."}
                          </Text>
                        </View>

                        <View style={styles.planCTAWrapperEngine}>
                          <View style={[styles.planGlassActionButton, isSelected && { backgroundColor: "#FFFFFF" }]}>
                            <Text
                              style={[
                                styles.planGlassActionButtonText,
                                isSelected && { color: cardGradients[0], fontWeight: "900" },
                              ]}
                            >
                              {isFreeTrial ? "Start Trial" : isSelected ? "Selected Plan" : "Subscribe Now"}
                            </Text>
                            <Feather
                              name={isSelected ? "check-circle" : "arrow-right"}
                              size={13}
                              color={isSelected ? cardGradients[0] : "#FFFFFF"}
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
                  <Text style={[styles.modalProcessingStatusNotificationText, { color: COLORS.primary }]}>
                    Contacting Gateway Bridges safely...
                  </Text>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: "90%",
    borderRadius: 36,
    overflow: "hidden",
    elevation: 20,
    backgroundColor: "white",
  },
  subscriptionModalContent: { borderRadius: 36, padding: 20, width: "100%" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  premiumSparkBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  premiumSparkBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  modalSubtitleTextText: { fontSize: 12, marginTop: 4, lineHeight: 16, fontWeight: "500" },
  enhancedCloseCircleBtn: { padding: 8, borderRadius: 40, backgroundColor: "rgba(0, 0, 0, 0.04)" },
  plansGrid: { justifyContent: "center", gap: 14, marginTop: 8 },
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
  activeSelectedCardRingBorder: { transform: [{ scale: 1.02 }], borderWidth: 3, borderColor: "#4A231A" },
  planGradientCoreLayout: { padding: 22, borderRadius: 26, alignItems: "center", minHeight: 310, position: "relative", overflow: "hidden" },
  cardFloatingBubbleGraphicTop: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255, 255, 255, 0.08)", top: -40, right: -30, zIndex: 0 },
  cardFloatingBubbleGraphicBottom: { position: "absolute", width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(0, 0, 0, 0.05)", bottom: -30, left: -20, zIndex: 0 },
  planIconWrapperFrame: { width: 52, height: 52, borderRadius: 18, backgroundColor: "rgba(255, 255, 255, 0.22)", alignItems: "center", justifyContent: "center", marginBottom: 14, zIndex: 1 },
  planHeadlineNameText: { fontSize: 19, fontWeight: "800", color: "#FFFFFF", marginBottom: 6, zIndex: 1, letterSpacing: -0.3 },
  priceRowWrapperContainer: { flexDirection: "row", alignItems: "baseline", marginVertical: 4, zIndex: 1 },
  planPrimaryCurrencyValueSymbol: { fontSize: 18, fontWeight: "800", color: "#FFFFFF", marginRight: 2 },
  planNumericalPriceBoldText: { fontSize: 34, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.5 },
  planPricePeriodModifierText: { fontSize: 13, fontWeight: "600", color: "rgba(255, 255, 255, 0.8)", marginLeft: 1 },
  premiumFeaturesBulletListContainer: { width: "100%", marginTop: 12, marginBottom: 18, alignItems: "center", zIndex: 1, flex: 1 },
  featureItemDividerLine: { width: 40, height: 2, backgroundColor: "rgba(255, 255, 255, 0.3)", marginBottom: 12, borderRadius: 1 },
  featureItemParagraphBodyText: { fontSize: 12, color: "#FFFFFF", fontWeight: "500", textAlign: "center", lineHeight: 17, paddingHorizontal: 6 },
  planCTAWrapperEngine: { width: "100%", marginTop: "auto", zIndex: 1 },
  planGlassActionButton: { paddingVertical: 12, borderRadius: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.4)", backgroundColor: "rgba(255, 255, 255, 0.15)" },
  planGlassActionButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.3 },
  footerNote: { textAlign: "center", marginTop: 16, fontSize: 11, fontWeight: "600" },
  modalProcessingOverlayLoaderLayout: { marginTop: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, padding: 10, borderRadius: 12, alignSelf: "center" },
  modalProcessingStatusNotificationText: { fontSize: 12, fontWeight: "700" },
});