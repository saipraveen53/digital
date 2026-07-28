// app/(user)/_layout.tsx
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import {
  SubscriptionProvider,
  useSubscription,
} from "../context/SubscriptionContext";

const COLORS = {
  primary: "#336956",         
  secondary: "#E09643",       
  darkSienna: "#1B4235",      
  background: "#FAF9F5",      
  border: "rgba(51, 105, 86, 0.08)",
  cardBg: "rgba(255, 255, 255, 0.90)",
  excellentGreen: "#336956",
  excellentBg: "rgba(51, 105, 86, 0.08)",
  textDark: "#11231D",        
  textLight: "#576860",       
  sidebarGlassBg: [
    "rgba(255, 255, 255, 0.95)",
    "rgba(250, 249, 245, 0.90)",
    "rgba(51, 105, 86, 0.04)",
  ],
  mobileTabGlassBg: ["rgba(255, 255, 255, 0.98)", "rgba(250, 249, 245, 0.94)"],
  logoutBorder: "rgba(220, 38, 38, 0.15)",
  logoutIconBg: "rgba(220, 38, 38, 0.06)",
  logoutText: "#DC2626",      
};

const NAVIGATION_ITEMS = [
  { name: "Home", path: "/home", icon: "home", bg: "rgba(51, 105, 86, 0.08)", iconColor: COLORS.primary, gradient: ["#336956", "#1B4235"] },
  { name: "Logs", path: "/logs", icon: "clipboard", bg: "rgba(51, 105, 86, 0.08)", iconColor: COLORS.excellentGreen, gradient: ["#336956", "#458A72"] },
  { name: "Tips", path: "/tips", icon: "lightbulb", bg: "rgba(224, 150, 67, 0.08)", iconColor: COLORS.secondary, gradient: ["#E09643", "#F2B46D"] },
  { name: "Trends", path: "/trends", icon: "trending-up", bg: "rgba(87, 104, 96, 0.08)", iconColor: COLORS.textLight, gradient: ["#576860", "#11231D"] },
  { name: "View Profile", path: "/settings", icon: "settings", bg: "rgba(51, 105, 86, 0.08)", iconColor: COLORS.primary, gradient: ["#336956", "#1B4235"] },
] as const;

function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { isSubscribed, daysRemaining, activePlanName } = useSubscription();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigation = (item: (typeof NAVIGATION_ITEMS)[0]) => {
    if (!isSubscribed && item.path !== "/home") {
      Alert.alert("Subscription Required", "Please activate your free trial to access this feature.");
      return;
    }
    router.push(item.path);
  };

  const sidebarWidth = useRef(new Animated.Value(310)).current;
  useEffect(() => {
    Animated.timing(sidebarWidth, { toValue: isCollapsed ? 90 : 310, duration: 220, useNativeDriver: false }).start();
  }, [isCollapsed]);

  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Animated.View style={{ width: sidebarWidth, overflow: "hidden", position: "relative", zIndex: 5 }}>
      <LinearGradient colors={COLORS.sidebarGlassBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 24), borderRightWidth: 1, borderRightColor: COLORS.border }}>
        
        {/* Header Fixed Area (Logo and Collapse Button) */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", paddingHorizontal: isCollapsed ? 0 : 20, marginBottom: 24, height: 48, width: "100%" }}>
          {!isCollapsed && (
            <LinearGradient colors={[COLORS.primary, COLORS.darkSienna]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 40 }}>
              <View style={{ backgroundColor: "rgba(255, 255, 255, 0.92)", padding: 1, borderRadius: 30 }}> 
                <Image source={require("../../assets/images/logo2.png")} style={styles.floatingMoonImage} resizeMode="contain" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.5 }}>Wellbeing Gauge</Text>
            </LinearGradient>
          )}
          <Pressable onPress={() => setIsCollapsed(!isCollapsed)} style={({ pressed }) => ({ padding: 8, borderRadius: 30, backgroundColor: pressed ? "rgba(227, 83, 54, 0.1)" : "#FFFFFF", borderWidth: 1, borderColor: COLORS.border, marginRight: isCollapsed ? 0 : 4 })}>
            <Feather name={isCollapsed ? "chevron-right" : "chevron-left"} size={18} color={COLORS.textDark} />
          </Pressable>
        </View>

        {/* Subscription Info and Search Fixed Area */}
        {!isCollapsed && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <LinearGradient colors={isSubscribed ? ["rgba(51, 105, 86, 0.1)", "rgba(51, 105, 86, 0.03)"] : ["rgba(224, 150, 67, 0.1)", "rgba(224, 150, 67, 0.03)"]} style={{ padding: 12, borderRadius: 16, borderWidth: 1, borderColor: isSubscribed ? "rgba(51, 105, 86, 0.2)" : "rgba(224, 150, 67, 0.2)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Feather name={isSubscribed ? "check-circle" : "lock"} size={14} color={isSubscribed ? COLORS.primary : COLORS.secondary} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textDark }}>{isSubscribed ? (activePlanName || "Premium Active") : "Free Account"}</Text>
              </View>
              {isSubscribed && daysRemaining !== null && (
                <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4, fontWeight: "600" }}>Remaining: <Text style={{ color: COLORS.secondary, fontWeight: "700" }}>{daysRemaining} Days</Text></Text>
              )}
            </LinearGradient>
          </View>
        )}

        {!isCollapsed && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.75)", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 6 }}>
              <Feather name="search" size={16} color={COLORS.textLight} style={{ marginRight: 8 }} />
              <TextInput placeholder="Search components..." placeholderTextColor="#A07A70" value={searchQuery} onChangeText={setSearchQuery} style={{ flex: 1, fontSize: 14, color: COLORS.textDark, padding: 0, fontWeight: "600" }} />
              {searchQuery.length > 0 && <Pressable onPress={() => setSearchQuery("")}><Feather name="x-circle" size={14} color="#CBD5E1" /></Pressable>}
            </View>
          </View>
        )}
        
        {/* ✅ FIXED: ScrollView enclosing both Nav Items and Logout Button together */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 16, alignItems: isCollapsed ? "center" : "stretch" }}
          showsVerticalScrollIndicator={false}
        >
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.path;
            const isLocked = !isSubscribed && item.path !== "/home";
            return (
              <Pressable 
                key={item.path} 
                onPress={() => handleNavigation(item)} 
                style={({ pressed }) => ({ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  justifyContent: isCollapsed ? "center" : "flex-start", 
                  paddingVertical: 6, 
                  borderRadius: 18, 
                  backgroundColor: isActive ? "transparent" : pressed ? "rgba(0,0,0,0.03)" : "transparent", 
                  width: isCollapsed ? 56 : "100%", 
                  opacity: isLocked ? 0.6 : 1 
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
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      flex: 1, 
                      minWidth: 0, 
                      paddingHorizontal: isCollapsed ? 0 : 14, 
                      paddingVertical: 8, 
                      borderRadius: 16,
                      height: 56
                    }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Feather name={item.icon} size={18} color={item.name === "Logs" ? COLORS.excellentGreen : COLORS.primary} /></View>
                    {!isCollapsed && <Text numberOfLines={1} style={{ marginLeft: 14, fontSize: 15, fontWeight: "800", color: "#FFFFFF", flex: 1 }}>{item.name}</Text>}
                    {!isCollapsed && isLocked && <Feather name="lock" size={14} color="#FFFFFF" style={{ marginRight: 4, opacity: 0.8 }} />}
                  </LinearGradient>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start", flex: 1, minWidth: 0, paddingHorizontal: isCollapsed ? 0 : 14, paddingVertical: 8, height: 56 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: item.bg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Feather name={item.icon} size={18} color={item.iconColor} /></View>
                    {!isCollapsed && <Text numberOfLines={1} style={{ marginLeft: 14, fontSize: 15, fontWeight: "600", color: COLORS.textDark, flex: 1 }}>{item.name}</Text>}
                    {!isCollapsed && isLocked && <Feather name="lock" size={14} color={COLORS.secondary} style={{ marginRight: 4, opacity: 0.7 }} />}
                  </View>
                )}
              </Pressable>
            );
          })}

          {/* Spacer to push logout dynamic content flow cleanly if space permits */}
          <View style={{ height: 10 }} />

          {/* ✅ Logout Button inside ScrollView Area */}
          <Pressable 
            onPress={logout} 
            style={({ pressed }) => ({ 
              flexDirection: "row", 
              alignItems: "center", 
              justifyContent: isCollapsed ? "center" : "flex-start", 
              paddingHorizontal: isCollapsed ? 0 : 16, 
              paddingVertical: isCollapsed ? 0 : 8, 
              borderRadius: isCollapsed ? 28 : 18, 
              backgroundColor: pressed ? "rgba(227, 83, 54, 0.05)" : "rgba(255,255,255,0.6)", 
              borderWidth: 1, 
              borderColor: COLORS.logoutBorder, 
              width: isCollapsed ? 56 : "100%",
              height: isCollapsed ? 56 : 52
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start", flex: 1 }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 12, 
                backgroundColor: COLORS.logoutIconBg, 
                alignItems: "center", 
                justifyContent: "center", 
                flexShrink: 0 
              }}>
                <Feather name="log-out" size={18} color={COLORS.logoutText} />
              </View>
              {!isCollapsed && <Text style={{ marginLeft: 14, fontSize: 15, fontWeight: "700", color: COLORS.logoutText, flex: 1 }}>Logout</Text>}
            </View>
          </Pressable>
        </ScrollView>

      </LinearGradient>
    </Animated.View>
  );
}

// MobileBottomTabs, LayoutContent, and UserLayout logic remain untouched...
function MobileBottomTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSubscribed } = useSubscription();

  const handleNavigation = (item: (typeof NAVIGATION_ITEMS)[0]) => {
    if (!isSubscribed && item.path !== "/home") {
      Alert.alert("Subscription Required", "Please activate your free trial to access this feature.");
      return;
    }
    router.push(item.path);
  };

  return (
    <LinearGradient colors={COLORS.mobileTabGlassBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: insets.bottom > 0 ? insets.bottom : 14, paddingTop: 12, position: "absolute", bottom: 0, left: 0, right: 0, shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 20, zIndex: 10 }}>
      {NAVIGATION_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        const isLocked = !isSubscribed && item.path !== "/home";
        const activeColor = item.name === "Logs" ? COLORS.excellentGreen : COLORS.primary;
        
        return (
          <Pressable key={item.path} onPress={() => handleNavigation(item)} style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4, opacity: isLocked ? 0.5 : 1 }}>
            <View style={{ width: 54, height: 32, borderRadius: 16, backgroundColor: isActive ? "rgba(227, 83, 54, 0.12)" : "transparent", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
              <Feather name={item.icon} size={18} color={isActive ? activeColor : COLORS.textLight} />
              {isLocked && (
                <Feather 
                  name="lock" 
                  size={10} 
                  color="#336956" 
                  style={{ position: "absolute", bottom: -2, right: -6, backgroundColor: '#FFFFFF', borderRadius: 4, padding: 1, overflow: 'hidden' }} 
                />
              )}
            </View>
            <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: isActive ? "800" : "600", color: isActive ? activeColor : COLORS.textLight }}>{item.name}</Text>
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}

function LayoutContent() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollYRef = useRef(new Animated.Value(0)).current;

  const backgroundBall1 = { transform: [{ translateY: scrollYRef.interpolate({ inputRange: [0, height || 800], outputRange: [0, -180], extrapolate: "clamp" }) }] };
  const backgroundBall2 = { transform: [{ translateY: scrollYRef.interpolate({ inputRange: [0, height || 800], outputRange: [120, -120], extrapolate: "clamp" }) }] };
  const backgroundBall3 = { transform: [{ translateY: scrollYRef.interpolate({ inputRange: [0, height || 800], outputRange: [-60, -360], extrapolate: "clamp" }) }] };

  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: COLORS.background }}>
        <Animated.View style={[styles.blurredLiquidSphere1, backgroundBall1]} />
        <Animated.View style={[styles.blurredLiquidSphere2, backgroundBall2]} />
        <Animated.View style={[styles.blurredLiquidSphere3, backgroundBall3]} />
        <DesktopSidebar />
        <View style={{ flex: 1, backgroundColor: "transparent", zIndex: 3, position: "relative" }}>
          <Slot />
          <TouchableOpacity style={styles.floatingMoonButton} activeOpacity={0.85} onPress={() => router.push("/sleepFirstAid")}>
            <Feather name="moon" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, flexDirection: "column", position: "relative" }}>
        <Animated.View style={[styles.blurredLiquidSphere1, backgroundBall1]} />
        <Animated.View style={[styles.blurredLiquidSphere2, backgroundBall2]} />
        <Animated.View style={[styles.blurredLiquidSphere3, backgroundBall3]} />
        <View style={{ flex: 1, paddingBottom: insets.bottom > 0 ? insets.bottom + 65 : 85, zIndex: 3 }}>
          <Slot />
        </View>
        
        <TouchableOpacity
          style={[styles.floatingMoonButton, { bottom: insets.bottom > 0 ? insets.bottom + 75 : 95 }]}
          activeOpacity={0.85}
          onPress={() => router.push("/sleepFirstAid")}
        >
          <Image source={require("../../assets/images/cloude1.png")} style={styles.floatingMoonImage} resizeMode="contain" />
        </TouchableOpacity>

        <MobileBottomTabs />
      </View>
    </SafeAreaView>
  );
}

export default function UserLayout() {
  const { user } = useAuth();
  if (!user || !user.isLoggedIn) return <Redirect href="/login" />;
  if (user.role !== "user") return <Redirect href="/(admin)/dashboard" />;

  return (
    <SubscriptionProvider>
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      <LayoutContent />
    </SubscriptionProvider>
  );
}

const styles = StyleSheet.create({
  blurredLiquidSphere1: { position: "absolute", width: 250, height: 250, borderRadius: 125, backgroundColor: COLORS.secondary, opacity: 0.22, top: "14%", left: -60, ...Platform.select({ web: { filter: "blur(75px)" } }), zIndex: 1 },
  blurredLiquidSphere2: { position: "absolute", width: 320, height: 320, borderRadius: 160, backgroundColor: COLORS.primary, opacity: 0.14, bottom: "18%", right: -90, ...Platform.select({ web: { filter: "blur(90px)" } }), zIndex: 1 },
  blurredLiquidSphere3: { position: "absolute", width: 190, height: 190, borderRadius: 95, backgroundColor: COLORS.darkSienna, opacity: 0.18, top: "52%", left: "35%", ...Platform.select({ web: { filter: "blur(70px)" } }), zIndex: 1 },
  floatingMoonButton: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3b20e9", alignItems: "center", justifyContent: "center", zIndex: 99, overflow: "hidden", ...Platform.select({ ios: { shadowColor: "#5B46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 }, android: { elevation: 6 }, web: { boxShadow: "0px 4px 15px rgba(91, 70, 229, 0.4)", bottom: 30 } }) },
  floatingMoonImage: { width: 52, height: 52 }
});