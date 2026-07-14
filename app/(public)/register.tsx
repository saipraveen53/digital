// app/(public)/register.tsx
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { rootApi } from "../utils/axiosInstance";

const { width: screenWidth } = Dimensions.get("window");
const isDesktop = screenWidth >= 768;

const COLORS = {
  primary: "#0d9488", 
  primaryDark: "#0f766e",
  accent: "#E68C6C", 
  background: "#F8F9FA",
  cardBg: "#FFFFFF",
  textDark: "#1E293B",
  textLight: "#64748B",
  border: "#E2E8F0",
};

const ROLES_LIST = [
  { label: "Student", value: "STUDENT" },
  { label: "Working Professional", value: "WORKING_PROFESSIONAL" },
  { label: "Parents", value: "PARENTS" },
  { label: "Caregiver", value: "CAREGIVER" },
  { label: "Entrepreneur", value: "ENTREPRENEUR" },
  { label: "Other", value: "OTHER" },
];

type RegisterStep = "EMAIL" | "OTP_AND_DETAILS" | "SUCCESS";

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("EMAIL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Fields State
  const [email, setEmail] = useState("");
  const [otpArray, setOtpArray] = useState<string[]>(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("MALE");
  const [role, setRole] = useState("STUDENT");
  const [wakeUpTime, setWakeUpTime] = useState("06:00");
  const [others, setOthers] = useState("");
  
  // New State variables requested
  const [phoneNo, setPhoneNo] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhoneNo, setGuardianPhoneNo] = useState("");

  // UI States
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);

  const otpRefs = useRef<Array<TextInput | null>>([]);

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      await rootApi.post(
        `/api/auth/send-otp?email=${encodeURIComponent(email.trim())}`,
      );
      setStep("OTP_AND_DETAILS");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("");
        setStep("OTP_AND_DETAILS");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to send verification code. Try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, "");
    if (!cleanedText) {
      const newOtp = [...otpArray];
      newOtp[index] = "";
      setOtpArray(newOtp);
      return;
    }

    if (cleanedText.length > 1) {
      const pastedDigits = cleanedText.slice(0, 6).split("");
      const newOtp = [...otpArray];
      pastedDigits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtpArray(newOtp);
      const targetIndex = Math.min(pastedDigits.length - 1, 5);
      otpRefs.current[targetIndex]?.focus();
      return;
    }

    const newOtp = [...otpArray];
    newOtp[index] = cleanedText;
    setOtpArray(newOtp);

    if (index < 5 && cleanedText) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpArray[index] && index > 0) {
      const newOtp = [...otpArray];
      newOtp[index - 1] = "";
      setOtpArray(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleCheckClipboardPaste = async () => {
    const content = await Clipboard.getStringAsync();
    const cleaned = content.replace(/[^0-9]/g, "").slice(0, 6);
    if (cleaned.length === 6) {
      setOtpArray(cleaned.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // Input Field Validation Rules Engine
  const validateFormPayload = () => {
    if (!name.trim() || !password.trim() || !age.trim() || !wakeUpTime.trim() || !phoneNo.trim() || !guardianName.trim() || !guardianPhoneNo.trim()) {
      return "Please fill in all required fields";
    }

    // Password regex validation: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters long, containing 1 uppercase letter, 1 lowercase letter, and 1 digit.";
    }

    // Phone standard number validation (10 digits check)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo.trim())) {
      return "Please input a valid 10-digit personal phone number.";
    }
    if (!phoneRegex.test(guardianPhoneNo.trim())) {
      return "Please input a valid 10-digit guardian phone number.";
    }

    return null;
  };

const handleSubmitWithOtp = async () => {
  const fullOtp = otpArray.join("");

  if (fullOtp.length < 6) {
    setError("Please provide complete 6-digit confirmation key code");
    return;
  }

  const validationErrorMsg = validateFormPayload();
  if (validationErrorMsg) {
    setError(validationErrorMsg);
    return;
  }

  setError("");
  setIsLoading(true);

  // Send time as HH:MM:SS format instead of ISO datetime
  const finalWakeUpTime = `${wakeUpTime}:00`;

  const payload = {
    name: name.trim(),
    email: email.trim(),
    password: password,
    age: parseInt(age, 10),
    gender: gender,
    role: role,
    wakeUpTime: finalWakeUpTime,  // Send as "HH:MM:SS"
    phoneNo: phoneNo.trim(),
    guardianName: guardianName.trim(),
    guardianPhoneNo: guardianPhoneNo.trim(),
    others: others.trim() || "Mobile Client User",
  };

  try {
    await rootApi.post(`/api/auth/register?otp=${fullOtp}`, payload);
    setStep("SUCCESS");
  } catch (err: any) {
    setError(
      err.response?.data?.message || "Registration failed. Please try again.",
    );
  } finally {
    setIsLoading(false);
  }
};

  const handleSelectRole = (value: string) => {
    setRole(value);
    setShowRoleModal(false);
    setShowDesktopDropdown(false);
  };

  const currentRoleLabel =
    ROLES_LIST.find((r) => r.value === role)?.label || role;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: COLORS.background }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.outerCenterContainer}>
          <View style={styles.responsiveBentoCard}>
            {step !== "SUCCESS" && (
              <TouchableOpacity
                onPress={() =>
                  step === "EMAIL" ? router.replace("/login") : setStep("EMAIL")
                }
                style={styles.backNavigationAction}
              >
                <Feather name="arrow-left" size={18} color={COLORS.textLight} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {error ? (
              <Animated.View entering={FadeInUp} style={styles.errorAlertWrapper}>
                <Feather name="alert-triangle" size={16} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.errorAlertText}>{error}</Text>
              </Animated.View>
            ) : null}

            {step === "EMAIL" && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <View style={styles.iconGraphicHeaderCircle}>
                  <Feather name="user-plus" size={28} color="white" />
                </View>
                <Text style={styles.mainTitleText}>Create Account</Text>
                <Text style={styles.subtitleGuideText}>
                  Enter your email address below to receive a verification code
                </Text>

                <View style={styles.inputContainerStack}>
                  <Text style={styles.labelTitleField}>Email Address</Text>
                  <View style={styles.inputFieldIconWrapper}>
                    <Feather name="mail" size={18} color={COLORS.textLight} style={styles.inputPositionIcon} />
                    <TextInput
                      style={styles.textInputBoxComponent}
                      placeholder="Enter your email"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        setError("");
                      }}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.ctaActionButton} onPress={handleSendOtp} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.ctaTextButton}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            {step === "OTP_AND_DETAILS" && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <View style={styles.iconGraphicHeaderCircle}>
                  <Feather name="shield" size={28} color="white" />
                </View>
                <Text style={styles.mainTitleText}>Complete Registration</Text>
                <Text style={styles.subtitleGuideText}>
                  Enter the verification code sent to {email} and complete your profile
                </Text>

               {/* --- OTP Input Section --- */}
                <Text style={styles.labelTitleField}>Verification Code</Text>
                <View style={styles.otpGridRowFlex}>
                  {otpArray.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (otpRefs.current[index] = ref)}
                      style={[
                        styles.otpSingleInputBox,
                        digit ? { borderColor: COLORS.primary, borderWidth: 2 } : null
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      textAlign="center"
                      placeholderTextColor="#94A3B8"
                      placeholder="•"
                      editable={!isLoading}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <TouchableOpacity onPress={handleCheckClipboardPaste} style={styles.clipboardShortcutAction}>
                  <Feather name="clipboard" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.clipboardShortcutText}>Paste code from clipboard</Text>
                </TouchableOpacity>

                <View style={styles.inputContainerStack}>
                  <Text style={styles.labelTitleField}>Full Name</Text>
                  <TextInput
                    style={styles.textInputBoxComponentPlain}
                    placeholder="Your name"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Secure Password Input Fields Matrix with Toggle Switch */}
                <View style={styles.inputContainerStack}>
                  <Text style={styles.labelTitleField}>Secure Password</Text>
                  <View style={styles.inputFieldIconWrapper}>
                    <TextInput
                      style={styles.textInputBoxComponentPlainPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity 
                      style={styles.passwordVisibilityIconToggle} 
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather name={showPassword ? "eye" : "eye-off"} size={18} color={COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* User Phone Number Field Block */}
                <View style={styles.inputContainerStack}>
                  <Text style={styles.labelTitleField}>Phone Number</Text>
                  <TextInput
                    style={styles.textInputBoxComponentPlain}
                    placeholder="Enter 10 digit number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phoneNo}
                    onChangeText={setPhoneNo}
                  />
                </View>

                <View style={styles.formSplitInlineFlexRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.labelTitleField}>Age</Text>
                    <TextInput
                      style={styles.textInputBoxComponentPlain}
                      placeholder="22"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      value={age}
                      onChangeText={setAge}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelTitleField}>Gender</Text>
                    <View style={styles.inlineOptionSelectorRow}>
                      {["MALE", "FEMALE"].map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[styles.selectorPillBtn, gender === g && styles.selectorPillBtnActive]}
                          onPress={() => setGender(g)}
                        >
                          <Text style={[styles.selectorPillText, gender === g && styles.selectorPillTextActive]}>
                            {g}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainerStack}>
                  <Text style={styles.labelTitleField}>Account Role</Text>
                  {isDesktop ? (
                    <View style={{ zIndex: 100 }}>
                      <TouchableOpacity
                        style={styles.dropdownSelectorTrigger}
                        activeOpacity={0.9}
                        onPress={() => setShowDesktopDropdown(!showDesktopDropdown)}
                      >
                        <Text style={styles.dropdownSelectorTriggerText}>{currentRoleLabel}</Text>
                        <Feather name={showDesktopDropdown ? "chevron-up" : "chevron-down"} size={18} color={COLORS.textLight} />
                      </TouchableOpacity>
                      {showDesktopDropdown && (
                        <View style={styles.desktopDropdownOverlayContainer}>
                          {ROLES_LIST.map((r) => (
                            <TouchableOpacity
                              key={r.value}
                              style={[styles.desktopDropdownItemBtn, role === r.value && { backgroundColor: COLORS.background }]}
                              onPress={() => handleSelectRole(r.value)}
                            >
                              <Text style={[styles.desktopDropdownItemText, role === r.value && { color: COLORS.primary, fontWeight: "700" }]}>
                                {r.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.dropdownSelectorTrigger}
                      activeOpacity={0.8}
                      onPress={() => setShowRoleModal(true)}
                    >
                      <Text style={styles.dropdownSelectorTriggerText}>{currentRoleLabel}</Text>
                      <Feather name="chevron-down" size={18} color={COLORS.textLight} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Guardian Details Row Sub Section */}
                <View style={styles.formSplitInlineFlexRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.labelTitleField}>Guardian Name</Text>
                    <TextInput
                      style={styles.textInputBoxComponentPlain}
                      placeholder="Name"
                      placeholderTextColor="#94a3b8"
                      value={guardianName}
                      onChangeText={setGuardianName}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelTitleField}>Guardian Phone</Text>
                    <TextInput
                      style={styles.textInputBoxComponentPlain}
                      placeholder="10 digit number"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={guardianPhoneNo}
                      onChangeText={setGuardianPhoneNo}
                    />
                  </View>
                </View>

                <View style={styles.inputContainerStack}>
                  <Text style={styles.labelTitleField}>Wake Up Time</Text>
                  <View style={styles.inputFieldIconWrapper}>
                    <Feather name="clock" size={18} color={COLORS.textLight} style={styles.inputPositionIcon} />
                    <TextInput
                      style={styles.textInputBoxComponent}
                      placeholder="06:00"
                      placeholderTextColor="#94a3b8"
                      value={wakeUpTime}
                      onChangeText={setWakeUpTime}
                    />
                  </View>
                </View>

                <View style={styles.inputContainerStack}>
                  <Text style={styles.labelTitleField}>Others / Custom Notes</Text>
                  <TextInput
                    style={styles.textInputBoxComponentPlain}
                    placeholder="E.g., tracking preferences or goals"
                    placeholderTextColor="#94a3b8"
                    value={others}
                    onChangeText={setOthers}
                  />
                </View>

                <TouchableOpacity style={styles.ctaActionButton} onPress={handleSubmitWithOtp} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.ctaTextButton}>Complete Registration</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            {step === "SUCCESS" && (
              <Animated.View entering={ZoomIn.duration(500)} style={{ alignItems: "center", paddingVertical: 20 }}>
                <View style={styles.sparkSuccessOuterWrapper}>
                  <View style={[styles.ribbonGraphicItem, { backgroundColor: "#FFD700", transform: [{ rotate: "15deg" }], top: -10, left: -20 }]} />
                  <View style={[styles.ribbonGraphicItem, { backgroundColor: "#FF6B6B", transform: [{ rotate: "-35deg" }], bottom: -10, right: -15 }]} />
                  <View style={[styles.ribbonGraphicItem, { backgroundColor: "#4DABF7", transform: [{ rotate: "45deg" }], top: 40, right: -30 }]} />
                  <View style={styles.sparkSuccessInnerCircle}>
                    <Feather name="check-circle" size={48} color="white" />
                  </View>
                </View>

                <Text style={styles.congratsHeadingTitle}>Awesome, {name || "User"}!</Text>
                <Text style={styles.congratsBodyStatement}>You registered successfully! Your account is active.</Text>

                <Pressable onPress={() => router.replace("/login")} style={({ pressed }) => [styles.backToLoginCTA, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
                  <Feather name="log-in" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.backToLoginCTAText}>Back to Login</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showRoleModal} transparent animationType="slide" onRequestClose={() => setShowRoleModal(false)}>
        <Pressable style={styles.modalBlurOverlayDimmer} onPress={() => setShowRoleModal(false)}>
          <View style={styles.modalInteractiveSheetContainer}>
            <View style={styles.modalHeaderIndicatorBar} />
            <Text style={styles.modalMainTitleHeading}>Select Your Account Role</Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {ROLES_LIST.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.7}
                  style={[styles.modalItemTileButton, role === item.value && { backgroundColor: COLORS.background }]}
                  onPress={() => handleSelectRole(item.value)}
                >
                  <Text style={[styles.modalItemTileText, role === item.value && { color: COLORS.primary, fontWeight: "700" }]}>
                    {item.label}
                  </Text>
                  {role === item.value && <Feather name="check" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerCenterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  responsiveBentoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 32,
    padding: 32,
    width: "100%",
    maxWidth: 460,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24 },
      android: { elevation: 6 },
    }),
  },
  backNavigationAction: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  backButtonText: {
    marginLeft: 6,
    color: COLORS.textLight,
    fontWeight: "600",
    fontSize: 14,
  },
  iconGraphicHeaderCircle: {
    backgroundColor: COLORS.primary,
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  mainTitleText: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  subtitleGuideText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainerStack: {
    marginBottom: 20,
    position: "relative",
  },
  labelTitleField: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputFieldIconWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  inputPositionIcon: {
    position: "absolute",
    left: 16,
    zIndex: 2,
  },
  textInputBoxComponent: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 46,
    paddingRight: 16,
    color: COLORS.textDark,
    fontSize: 15,
    width: "100%",
  },
  textInputBoxComponentPlain: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: COLORS.textDark,
    fontSize: 15,
    width: "100%",
  },
  textInputBoxComponentPlainPassword: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 48,
    color: COLORS.textDark,
    fontSize: 15,
    width: "100%",
  },
  passwordVisibilityIconToggle: {
    position: "absolute",
    right: 16,
    padding: 4,
    zIndex: 5,
  },
  dropdownSelectorTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownSelectorTriggerText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  desktopDropdownOverlayContainer: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 6,
    zIndex: 999,
  },
  desktopDropdownItemBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  desktopDropdownItemText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  ctaActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  ctaTextButton: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  errorAlertWrapper: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  errorAlertText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  otpGridRowFlex: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 14,
    width: "100%",
  },
  otpSingleInputBox: {
    width: "14%",
    height: 50, // Fixed physical vertical box grid boundary logic
    backgroundColor: "#F8FAFC", 
    borderWidth: 1.5,
    borderColor: "#CBD5E1", 
    borderRadius: 16, 
    fontSize: 24, 
    fontWeight: "700",
    color: "#1E293B",
    padding: 0, // Eliminates automatic system vertical shifting layout anomalies
    textAlign: "center",
    includeFontPadding: false, // Disables native font layout bugs inside Android devices
    textAlignVertical: "center",
  },
  clipboardShortcutAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  clipboardShortcutText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  formSplitInlineFlexRow: {
    flexDirection: "column",
    marginBottom: 20,
  },
  inlineOptionSelectorRow: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
  },
  selectorPillBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  selectorPillBtnActive: {
    backgroundColor: "white",
  },
  selectorPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textLight,
  },
  selectorPillTextActive: {
    color: COLORS.primary,
  },
  sparkSuccessOuterWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  sparkSuccessInnerCircle: {
    backgroundColor: "#22C55E",
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  ribbonGraphicItem: {
    position: "absolute",
    width: 14,
    height: 28,
    borderRadius: 6,
    opacity: 0.8,
    zIndex: 1,
  },
  congratsHeadingTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textDark,
    textAlign: "center",
  },
  congratsBodyStatement: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  backToLoginCTA: {
    backgroundColor: COLORS.textDark,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  backToLoginCTAText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  modalBlurOverlayDimmer: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalInteractiveSheetContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeaderIndicatorBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalMainTitleHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 16,
  },
  modalItemTileButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  modalItemTileText: {
    fontSize: 15,
    color: COLORS.textDark,
  },
});