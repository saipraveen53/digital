import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useAuth } from "../context/AuthContext";
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
  border: "rgba(51, 105, 86, 0.08)",
  excellentBg: "rgba(51, 105, 86, 0.08)",
  critical: "#DC2626",
  razorpayTheme: "#101B42", 
};

const DIFFICULTY_OPTIONS = [
  { label: "Difficulty Falling Asleep", value: "DIFFICULTY_FALLING_ASLEEP" },
  { label: "Woke Up During the Night", value: "WOKE_UP_DURING_THE_NIGHT" },
  { label: "Mind Won't Stop Thinking", value: "MIND_WONT_STOP_THINKING" },
  { label: "Feeling Anxious Before Sleep", value: "FEELING_ANXIOUS_BEFORE_SLEEP" },
  { label: "Stress Related", value: "STRESS_RELATED" },
  { label: "Emotional Distress", value: "EMOTIONAL_DISTRESS" },
  { label: "Other Reasons", value: "OTHER" },
];

const DURATION_OPTIONS = [
  { label: "Tonight Only", value: "TONIGHT_ONLY" },
  { label: "A Few Days", value: "A_FEW_DAYS" },
  { label: "A Few Weeks", value: "A__FEW_WEEKS" },
  { label: "More Than a Month", value: "MORE_THAN_A_MONTH" },
];

export default function ConsultationScreen() {
  const { user } = useAuth();
  const scrollY = useSharedValue(0);

  // Form Fields State
  const [fullName, setFormName] = useState("");           // ✅ Name field hook mapping state setup
  const [occupation, setOccupation] = useState("");
  const [city, setCity] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [age, setAge] = useState("");                     
  const [gender, setGender] = useState("MALE"); 
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState("TONIGHT_ONLY");

  // Loading & Modal Controls
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay web script if user runs on desktop browser
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

  // Checkbox state handler
  const toggleDifficulty = (value: string) => {
    if (selectedDifficulties.includes(value)) {
      setSelectedDifficulties(selectedDifficulties.filter((d) => d !== value));
    } else {
      setSelectedDifficulties([...selectedDifficulties, value]);
    }
  };

  // Main submission endpoint trigger
  const handleBookNow = async () => {
    if (!fullName.trim() || !occupation.trim() || !city.trim() || !whatsappNumber.trim() || !age.trim() || !gender) {
      Alert.alert("Missing Fields", "Please complete all fields before booking.");
      return;
    }

    // 10-DIGIT MOBILE PHONE NUMBER VALIDATION LOOP
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(whatsappNumber.trim())) {
      Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit mobile number.");
      return;
    }

    if (selectedDifficulties.length === 0) {
      Alert.alert("Selection Needed", "Please pick at least one sleep difficulty.");
      return;
    }

    setLoading(true);

    const payload = {
      name: fullName.trim(),                              // ✅ Added name field parameter context
      occupation: occupation.trim(),
      city: city.trim(),
      whatsappNumber: whatsappNumber.trim(),
      age: parseInt(age, 10) || 0,                         
      gender: gender,                  
      difficulties: selectedDifficulties,
      duration: selectedDuration,
    };

    try {
      // Step 1: Hit Initial Booking Endpoint
      const response = await rootApi.post("/api/consultation/book", payload);
      const { bookingId, razorpayOrderId, amount, keyId } = response.data;

      if (!razorpayOrderId) {
        throw new Error("Order ID generation failed from server endpoint pipeline.");
      }

      // Step 2: Open Checkout Gateway Option
      processPaymentGateway({ bookingId, razorpayOrderId, amount, keyId });
    } catch (err: any) {
      console.error("Booking failed:", err);
      Alert.alert("Server Error", err.response?.data?.message || "Could not complete booking initialization loop.");
      setLoading(false);
    }
  };

  const processPaymentGateway = (data: { bookingId: number; razorpayOrderId: string; amount: number; keyId: string }) => {
    const baseOptions = {
      key: data.keyId,
      amount: data.amount.toString(),
      currency: "INR",
      name: "Sleep First Aid Consultation",
      description: "Mental Health Professional Care Session",
      order_id: data.razorpayOrderId,
      prefill: {
        name: fullName.trim() || user?.name || "",        // ✅ Mapped updated name parameters
        email: user?.email || "",
        contact: whatsappNumber,
      },
      theme: { color: COLORS.razorpayTheme }, 
    };

    if (Platform.OS === "web") {
      if (!razorpayLoaded || !(window as any).Razorpay) {
        Alert.alert("Error", "Payment library loading. Please re-attempt.");
        setLoading(false);
        return;
      }

      const webOptions = {
        ...baseOptions,
        handler: async function (response: any) {
          await verifyConsultationPayment(
            data.bookingId,
            data.razorpayOrderId,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            Alert.alert("Cancelled", "Payment dismissed by user session.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(webOptions);
      rzp.open();
    } else {
      // Native App Checkout
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
        Alert.alert("Incompatibility", "Native checkout bridging initialization error.");
        setLoading(false);
        return;
      }

      RazorpayCheckout.open(baseOptions)
        .then(async (res: any) => {
          await verifyConsultationPayment(
            data.bookingId,
            data.razorpayOrderId,
            res.razorpay_payment_id || res.payment_id,
            res.razorpay_signature || res.signature
          );
        })
        .catch((error: any) => {
          console.error("Native gateway failed:", error);
          Alert.alert("Payment Failed", error?.description || "Transaction rejected.");
          setLoading(false);
        });
    }
  };

  const verifyConsultationPayment = async (
    bookingId: number,
    orderId: string,
    paymentId: string,
    signature: string
  ) => {
    try {
      const verifyPayload = {
        bookingId: bookingId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        razorpayPaymentId: paymentId,
      };

      // Hit Verification route
      const verifyResponse = await rootApi.post("/api/consultation/verify", verifyPayload);

      if (verifyResponse.status === 200 || verifyResponse.data?.success) {
        // Clear inputs upon execution and open success modal logs
        setFormName("");                                   // ✅ Reset verification form fields
        setOccupation("");
        setCity("");
        setWhatsappNumber("");
        setAge("");                                        
        setGender("MALE");                                     
        setSelectedDifficulties([]);
        setSuccessModalVisible(true);
      } else {
        Alert.alert("Verification Fault", "Payment verification parameters unmatched.");
      }
    } catch (error: any) {
      console.error("Verification processing crash:", error);
      Alert.alert("Error", error.response?.data?.message || "Server verification pipeline crash.");
    } finally { 
      loading && setLoading(false);
    }
  };

  // Parallax Fluid Background Animations
  const ballParallax1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [0, -180]) }],
  }));
  const ballParallax2 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, screenHeight], [100, -100]) }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Animated.View style={[styles.blurredSphere1, ballParallax1]} />
      <Animated.View style={[styles.blurredSphere2, ballParallax2]} />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollLayout}
      >
        <View style={[styles.formContainerCard, isDesktop && styles.desktopLayoutWidth]}>
          <Text style={styles.formTitle}>Book Consultation</Text>
          <Text style={styles.formSubtitle}>Get expert guidance for improving your circadian health sync loops.</Text>

          {/* ✅ NEW INPUT BLOCK FOR FULL USER NAME CONTEXT */}
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Nishi Kumar"
            placeholderTextColor="#94A3B8"
            value={fullName}
            onChangeText={setFormName}
          />

          {/* Occupation Input */}
          <Text style={styles.inputLabel}>Occupation</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Software Engineer"
            placeholderTextColor="#94A3B8"
            value={occupation}
            onChangeText={setOccupation}
          />

          {/* City Input */}
          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Hyderabad"
            placeholderTextColor="#94A3B8"
            value={city}
            onChangeText={setCity}
          />

          {/* WhatsApp Number Input */}
          <Text style={styles.inputLabel}>WhatsApp Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 9876543210"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            maxLength={10}
            value={whatsappNumber}
            onChangeText={setWhatsappNumber}
          />

          {/* AGE & GENDER INLINE ROW TRACK */}
          <View style={styles.inlineFlexRowInputs}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 24"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={3}
                value={age}
                onChangeText={setAge}
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderToggleWrapperRow}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setGender("MALE")}
                  style={[styles.genderToggleButton, gender === "MALE" && styles.genderToggleButtonActive]}
                >
                  <Text style={[styles.genderToggleText, gender === "MALE" && styles.genderToggleTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setGender("FEMALE")}
                  style={[styles.genderToggleButton, gender === "FEMALE" && styles.genderToggleButtonActive]}
                >
                  <Text style={[styles.genderToggleText, gender === "FEMALE" && styles.genderToggleTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sleep Difficulties */}
          <Text style={styles.inputLabel}>Sleep Difficulties (Select Multiple)</Text>
          <View style={styles.checkboxContainerMesh}>
            {DIFFICULTY_OPTIONS.map((opt) => {
              const isChecked = selectedDifficulties.includes(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.7}
                  onPress={() => toggleDifficulty(opt.value)}
                  style={[styles.checkboxItemRow, isChecked && styles.checkboxItemRowActive]}
                >
                  <View style={[styles.checkboxBoxBox, isChecked && styles.checkboxBoxBoxChecked]}>
                    {isChecked && <Feather name="check" size={12} color="white" />}
                  </View>
                  <Text style={[styles.checkboxTextLabel, isChecked && { fontWeight: "700" }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Condition Duration */}
          <Text style={styles.inputLabel}>Duration of Condition</Text>
          <View style={styles.radioPillsFlexRowGroup}>
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = selectedDuration === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDuration(opt.value)}
                  style={[styles.radioPillTile, isSelected && styles.radioPillTileActive]}
                >
                  <Text style={[styles.radioPillText, isSelected && styles.radioPillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Book Now Main CTA Button */}
          <TouchableOpacity
            style={[styles.bookNowButtonCTA, loading && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleBookNow}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Feather name="calendar" size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.bookNowButtonCTAText}>Book Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* Audit Booking Payment Verification Success Modal Display Section */}
      <Modal animationType="fade" transparent visible={successModalVisible}>
        <View style={styles.modalOverlayCentered}>
          <View style={styles.successCardBox}>
              <Image
                source={require("../../assets/images/logo2.png")}
                className="w-32 h-32 rounded-[12px]"
                resizeMode="cover"
              />
            <Text style={styles.successHeadingTitle}>Thank you for booking Sleep First Aid.</Text>
            <Text style={styles.successBodyParagraph}>Your request has been received.</Text>
            <Text style={styles.successBodyParagraphSecondary}>
              A Shinray Health mental health professional will contact you shortly through your registered WhatsApp number within 5 minutes.
            </Text>

            <TouchableOpacity
              style={styles.modalDismissCTA}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalDismissCTAText}>Awesome</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollLayout: {
    paddingBottom: 60,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  desktopLayoutWidth: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  formContainerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    color: COLORS.textDark,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 14,
  },
  textInput: {
    backgroundColor: "#FAF9F5",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  inlineFlexRowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  genderToggleWrapperRow: {
    flexDirection: "row",
    backgroundColor: "#FAF9F5",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 4,
    height: 50,
  },
  genderToggleButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  genderToggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  genderToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textLight,
  },
  genderToggleTextActive: {
    color: "white",
  },
  checkboxContainerMesh: {
    gap: 10,
    marginBottom: 12,
  },
  checkboxItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF9F5",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 14,
  },
  checkboxItemRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(51, 105, 86, 0.03)",
  },
  checkboxBoxBox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.textLight,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxBoxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxTextLabel: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  radioPillsFlexRowGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  radioPillTile: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FAF9F5",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  radioPillTileActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radioPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  radioPillTextActive: {
    color: "white",
  },
  bookNowButtonCTA: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 12,
  },
  bookNowButtonCTAText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  blurredSphere1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.secondary,
    opacity: 0.15,
    top: "10%",
    left: -60,
    ...Platform.select({ web: { filter: "blur(75px)" } }),
  },
  blurredSphere2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
    bottom: "20%",
    right: -80,
    ...Platform.select({ web: { filter: "blur(90px)" } }),
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: "rgba(17, 35, 29, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successCardBox: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 24,
    maxWidth: 420,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkIconCircleGraphic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successHeadingTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  successBodyParagraph: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 12,
  },
  successBodyParagraphSecondary: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  modalDismissCTA: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  modalDismissCTAText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
});