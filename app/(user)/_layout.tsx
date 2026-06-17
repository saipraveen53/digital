// app/(user)/_layout.tsx
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import {
  SubscriptionProvider,
  useSubscription,
} from "../context/SubscriptionContext";

// Explicit Burnt Sienna multi-color design setup matrix matching image preferences
const COLORS = {
  primary: "#E35336",         // Vibrant Burnt Sienna brand focus
  secondary: "#F4A460",       // Sandy orange variant configuration
  darkSienna: "#A0522D",      // Deep clay block separator tint
  background: "#F5F5DC",      // Soft cream beige middle background tone
  border: "rgba(160, 82, 45, 0.12)",
  cardBg: "rgba(255, 255, 255, 0.85)",

  // Custom explicit Green colors for Active navigation states & numeric indicators
  excellentGreen: "#10B981",
  excellentBg: "rgba(16, 185, 129, 0.12)",

  textDark: "#4A231A",        // Strong dark clay sienna text header accent
  textLight: "#8C665C",       // Warm terracotta subtle subtitle label
  
  // Translucent dynamic glass backgrounds inheriting master sienna tones
  sidebarGlassBg: [
    "rgba(255, 255, 255, 0.92)",
    "rgba(245, 245, 220, 0.85)",
    "rgba(244, 164, 96, 0.15)",
  ],
  mobileTabGlassBg: ["rgba(255, 255, 255, 0.96)", "rgba(245, 245, 220, 0.92)"],
  logoutBorder: "rgba(227, 83, 54, 0.2)",
  logoutIconBg: "rgba(227, 83, 54, 0.1)",
  logoutText: "#E35336",
};

const NAVIGATION_ITEMS = [
  {
    name: "Home",
    path: "/home",
    icon: "home",
    bg: "rgba(244, 164, 96, 0.15)",
    iconColor: COLORS.textDark,
    gradient: ["#E35336", "#F4A460"],
  },
  {
    name: "Logs",
    path: "/logs",
    icon: "clipboard",
    bg: "rgba(16, 185, 129, 0.1)",
    iconColor: COLORS.excellentGreen,
    gradient: ["#10B981", "#059669"], // Kept green matching active logs criteria
  },
  {
    name: "Tips",
    path: "/tips",
    icon: "lightbulb",
    bg: "rgba(160, 82, 45, 0.1)",
    iconColor: COLORS.darkSienna,
    gradient: ["#A0522D", "#E35336"],
  },
  {
    name: "Trends",
    path: "/trends",
    icon: "trending-up",
    bg: "rgba(74, 35, 26, 0.08)",
    iconColor: COLORS.textLight,
    gradient: ["#8C665C", "#4A231A"],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "settings",
    bg: "rgba(227, 83, 54, 0.1)",
    iconColor: COLORS.primary,
    gradient: ["#E35336", "#A0522D"],
  },
] as const;

function DesktopSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { isSubscribed } = useSubscription();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigation = (item: (typeof NAVIGATION_ITEMS)[0]) => {
    if (!isSubscribed && item.path !== "/home") {
      Alert.alert(
        "Subscription Required",
        "Please activate your free trial to access this feature.",
      );
      return;
    }
    router.push(item.path);
  };

  const sidebarWidth = useRef(new Animated.Value(310)).current;

  useEffect(() => {
    Animated.timing(sidebarWidth, {
      toValue: isCollapsed ? 90 : 310,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [isCollapsed]);

  const filteredNavItems = NAVIGATION_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Animated.View
      style={{ width: sidebarWidth, overflow: "hidden", position: "relative", zIndex: 5 }}
    >
      <LinearGradient
        colors={COLORS.sidebarGlassBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
          borderRightWidth: 1,
          borderRightColor: COLORS.border,
        }}
      >
        <View style={{ width: "100%" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "space-between",
              paddingHorizontal: isCollapsed ? 0 : 20,
              marginBottom: 24,
              height: 48,
              width: "100%",
            }}
          >
            {!isCollapsed && (
              <LinearGradient
                colors={[COLORS.primary, COLORS.darkSienna]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 40,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: 6,
                    borderRadius: 30,
                  }}
                >
                  <Feather name="droplet" size={18} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "900",
                    color: "#FFFFFF",
                    letterSpacing: -0.5,
                  }}
                >
                  Wellbeing Gauge
                </Text>
              </LinearGradient>
            )}

            <Pressable
              onPress={() => setIsCollapsed(!isCollapsed)}
              style={({ pressed }) => ({
                padding: 8,
                borderRadius: 30,
                backgroundColor: pressed ? "rgba(227, 83, 54, 0.1)" : "#FFFFFF",
                borderWidth: 1,
                borderColor: COLORS.border,
                marginRight: isCollapsed ? 0 : 4,
              })}
            >
              <Feather
                name={isCollapsed ? "chevron-right" : "chevron-left"}
                size={18}
                color={COLORS.textDark}
              />
            </Pressable>
          </View>

          {!isCollapsed && (
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.75)",
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  shadowColor: COLORS.darkSienna,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.02,
                  shadowRadius: 6,
                }}
              >
                <Feather
                  name="search"
                  size={16}
                  color={COLORS.textLight}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Search components..."
                  placeholderTextColor="#A07A70"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: COLORS.textDark,
                    padding: 0,
                    fontWeight: "600",
                  }}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Feather name="x-circle" size={14} color="#CBD5E1" />
                  </Pressable>
                )}
              </View>
            </View>
          )}

          <View style={{ paddingHorizontal: 16, gap: 10, width: "100%" }}>
            {filteredNavItems.length === 0 ? (
              <Text
                style={{
                  textAlign: "center",
                  color: COLORS.textLight,
                  fontSize: 12,
                  marginTop: 10,
                  fontStyle: "italic",
                }}
              >
                No matches found
              </Text>
            ) : (
              filteredNavItems.map((item) => {
                const isActive = pathname === item.path;
                const isLocked = !isSubscribed && item.path !== "/home";
                return (
                  <Pressable
                    key={item.path}
                    onPress={() => handleNavigation(item)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      paddingHorizontal: isCollapsed ? 8 : 12,
                      paddingVertical: 6,
                      borderRadius: 18,
                      backgroundColor: isActive
                        ? "transparent"
                        : pressed
                          ? "rgba(0,0,0,0.03)"
                          : "transparent",
                      borderWidth: 0,
                      width: "100%",
                      opacity: isLocked ? 0.55 : 1,
                    })}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={item.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                          minWidth: 0,
                          paddingHorizontal: isCollapsed ? 0 : 14,
                          paddingVertical: 8,
                          borderRadius: 16,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: "#FFFFFF",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Feather
                            name={item.icon}
                            size={18}
                            color={item.name === "Logs" ? COLORS.excellentGreen : COLORS.primary}
                          />
                        </View>
                        {!isCollapsed && (
                          <>
                            <Text
                              numberOfLines={1}
                              style={{
                                marginLeft: 14,
                                fontSize: 15,
                                fontWeight: "800",
                                color: "#FFFFFF",
                                flex: 1,
                              }}
                            >
                              {item.name}
                            </Text>
                            {isLocked && (
                              <Feather
                                name="lock"
                                size={14}
                                color="#FFFFFF"
                                style={{ marginLeft: 8 }}
                              />
                            )}
                          </>
                        )}
                      </LinearGradient>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                          minWidth: 0,
                          paddingHorizontal: isCollapsed ? 0 : 14,
                          paddingVertical: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: item.bg,
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Feather
                            name={item.icon}
                            size={18}
                            color={item.iconColor}
                          />
                        </View>
                        {!isCollapsed && (
                          <>
                            <Text
                              numberOfLines={1}
                              style={{
                                marginLeft: 14,
                                fontSize: 15,
                                fontWeight: "600",
                                color: COLORS.textDark,
                                flex: 1,
                              }}
                            >
                              {item.name}
                            </Text>
                            {isLocked && (
                              <Feather
                                name="lock"
                                size={14}
                                color={COLORS.textLight}
                                style={{ marginLeft: 8 }}
                              />
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, width: "100%" }}>
          <Pressable
            onPress={logout}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingHorizontal: isCollapsed ? 8 : 16,
              paddingVertical: 8,
              borderRadius: 18,
              backgroundColor: pressed
                ? "rgba(227, 83, 54, 0.05)"
                : "rgba(255,255,255,0.6)",
              borderWidth: 1,
              borderColor: COLORS.logoutBorder,
              width: "100%",
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View
                style={{
                  width: 40,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: COLORS.logoutIconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Feather name="log-out" size={18} color={COLORS.logoutText} />
              </View>
              {!isCollapsed && (
                <Text
                  style={{
                    marginLeft: 14,
                    fontSize: 15,
                    fontWeight: "700",
                    color: COLORS.logoutText,
                    flex: 1,
                  }}
                >
                  Logout
                </Text>
              )}
            </View>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function MobileBottomTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSubscribed } = useSubscription();

  const handleNavigation = (item: (typeof NAVIGATION_ITEMS)[0]) => {
    if (!isSubscribed && item.path !== "/home") {
      Alert.alert(
        "Subscription Required",
        "Please activate your free trial to access this feature.",
      );
      return;
    }
    router.push(item.path);
  };

  const bottomPadding = insets.bottom > 0 ? insets.bottom : 14;

  return (
    <LinearGradient
      colors={COLORS.mobileTabGlassBg}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: bottomPadding,
        paddingTop: 12,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: COLORS.darkSienna,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 20,
        zIndex: 10,
      }}
    >
      {NAVIGATION_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        const isLocked = !isSubscribed && item.path !== "/home";
        
        const activeColor = item.name === "Logs" ? COLORS.excellentGreen : COLORS.primary;

        return (
          <Pressable
            key={item.path}
            onPress={() => handleNavigation(item)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 4,
              opacity: isLocked ? 0.45 : 1,
            }}
          >
            <View
              style={{
                width: 54,
                height: 32,
                borderRadius: 16,
                backgroundColor: isActive
                  ? "rgba(227, 83, 54, 0.12)"
                  : "transparent",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <Feather
                name={item.icon}
                size={18}
                color={isActive ? activeColor : COLORS.textLight}
              />
              {isLocked && (
                <Feather
                  name="lock"
                  size={10}
                  color={COLORS.textLight}
                  style={{ position: "absolute", bottom: -2, right: -6 }}
                />
              )}
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 11,
                fontWeight: isActive ? "800" : "600",
                color: isActive ? activeColor : COLORS.textLight,
              }}
            >
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}

function LayoutContent() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const insets = useSafeAreaInsets();
  
  const scrollYRef = useRef(new Animated.Value(0)).current;

  const backgroundBall1 = {
    transform: [
      {
        translateY: scrollYRef.interpolate({
          inputRange: [0, height || 800],
          outputRange: [0, -180],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const backgroundBall2 = {
    transform: [
      {
        translateY: scrollYRef.interpolate({
          inputRange: [0, height || 800],
          outputRange: [120, -120],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const backgroundBall3 = {
    transform: [
      {
        translateY: scrollYRef.interpolate({
          inputRange: [0, height || 800],
          outputRange: [-60, -360],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: COLORS.background }}>
        <Animated.View style={[styles.blurredLiquidSphere1, backgroundBall1]} />
        <Animated.View style={[styles.blurredLiquidSphere2, backgroundBall2]} />
        <Animated.View style={[styles.blurredLiquidSphere3, backgroundBall3]} />

        <DesktopSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <View style={{ flex: 1, backgroundColor: "transparent", zIndex: 3 }}>
          <Slot />
        </View>
      </View>
    );
  }

  return (
    // FIX: Added top edge inset configuration handling using safe structural wrapper inside mobile tracks
    <SafeAreaView 
      edges={["top", "left", "right"]} 
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <View style={{ flex: 1, flexDirection: "column", position: "relative" }}>
        {/* Mobile anti-directional backdrop orbs layer stack */}
        <Animated.View style={[styles.blurredLiquidSphere1, backgroundBall1]} />
        <Animated.View style={[styles.blurredLiquidSphere2, backgroundBall2]} />
        <Animated.View style={[styles.blurredLiquidSphere3, backgroundBall3]} />

        <View
          style={{
            flex: 1,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 65 : 85,
            zIndex: 3,
          }}
        >
          <Slot />
        </View>
        <MobileBottomTabs />
      </View>
    </SafeAreaView>
  );
}

export default function UserLayout() {
  const { user } = useAuth();

  if (!user || !user.isLoggedIn) {
    return <Redirect href="/login" />;
  }

  if (user.role !== "user") {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return (
    <SubscriptionProvider>
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      <LayoutContent />
    </SubscriptionProvider>
  );
}

const styles = StyleSheet.create({
  blurredLiquidSphere1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondary,
    opacity: 0.22,
    top: "14%",
    left: -60,
    ...Platform.select({
      web: { filter: "blur(75px)" },
    }),
    zIndex: 1,
  },
  blurredLiquidSphere2: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.primary,
    opacity: 0.14,
    bottom: "18%",
    right: -90,
    ...Platform.select({
      web: { filter: "blur(90px)" },
    }),
    zIndex: 1,
  },
  blurredLiquidSphere3: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORS.darkSienna,
    opacity: 0.18,
    top: "52%",
    left: "35%",
    ...Platform.select({
      web: { filter: "blur(70px)" },
    }),
    zIndex: 1,
  },
});