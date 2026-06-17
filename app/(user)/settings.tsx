// app/(user)/settings.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { rootApi } from '../utils/axiosInstance';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isDesktop = screenWidth >= 1024;

// Burnt sienna explicit design specifications theme setup mapping
const COLORS = {
  background: '#F5F5DC',      // Soft cream beige background tone
  cardBg: 'rgba(255, 255, 255, 0.82)', 
  textDark: '#4A231A',       // Deep rich warm slate
  textLight: '#8C665C',      
  primary: '#E35336',        // Vibrant sienna brand focus
  secondary: '#F4A460',      // Balanced soft sandy orange accent
  darkSienna: '#A0522D',     // Luxury solid boundary tint
  border: 'rgba(160, 82, 45, 0.12)',
  accentBg: 'rgba(244, 164, 96, 0.15)',
};

// API Response Structures
interface UserProfileData {
  userId: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  primaryRole: string;
  wakeUpTime: string;
}

export default function SettingsScreen() {
  const { logout } = useAuth();
  
  // Local Profile & Preferences State
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailReminders, setEmailReminders] = useState(true);

  // UI Flow Controls
  const [globalLoading, setGlobalLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('MALE');
  const [formRole, setFormRole] = useState('STUDENT');
  const [formWakeUp, setFormWakeUp] = useState('');

  // Reanimated Shared Scroll Offset for 3D Anti-Direction Parallax
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setGlobalLoading(true);
    try {
      // GET Request: /api/user/profile
      const response = await rootApi.get<UserProfileData>('/api/user/profile');
      if (response.data) {
        setProfile(response.data);
        // Sync values to form state fields
        setFormName(response.data.name);
        setFormEmail(response.data.email);
        setFormAge(String(response.data.age));
        setFormGender(response.data.gender || 'MALE');
        setFormRole(response.data.primaryRole || 'STUDENT');
        setFormWakeUp(response.data.wakeUpTime || '2026-06-11T06:00:00');
      }
    } catch (err) {
      console.error('Error compiling network profile matrices:', err);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formName.trim() || !formAge.trim()) {
      Alert.alert('Error', 'Please map out all required identifier properties');
      return;
    }

    setUpdating(true);
    
    // Constructing request payload structure specified by requirement metrics
    const payload = {
      userId: profile?.userId || 'USER00002',
      name: formName.trim(),
      email: formEmail.trim(),
      age: parseInt(formAge, 10) || 0,
      gender: formGender,
      primaryRole: formRole,
      wakeUpTime: formWakeUp
    };

    try {
      // PUT Request: /api/user/profile/update
      await rootApi.put('/api/user/profile/update', payload);
      
      // Update local view state optimistically
      setProfile({
        ...profile,
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        age: payload.age,
        gender: payload.gender,
        primaryRole: payload.primaryRole,
        wakeUpTime: payload.wakeUpTime,
      });

      setEditModalVisible(false);
      setSuccessModalVisible(true);
    } catch (err) {
      console.error('Payload validation rejected by service node:', err);
      Alert.alert('Update Failed', 'An error occurred during submission.');
    } finally {
      setUpdating(false);
    }
  };

  // --- 3D Parallax Coordinate Interceptors (Anti-Direction Spheres Layout Engine) ---
  const ballStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [0, -220]) },
    ],
  }));

  const ballStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [120, -110]) },
    ],
  }));

  const ballStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, screenHeight], [-60, -390]) },
    ],
  }));

  if (globalLoading) {
    return (
      <View style={[styles.loadingWrapperContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingContextText, { color: COLORS.textDark }]}>Synchronizing secure profile data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      
      {/* 3D BLURRED ORB AMBIENT SPHERES RENDER LAYER */}
      <Animated.View style={[styles.blurredLiquidSphere1, ballStyle1]} />
      <Animated.View style={[styles.blurredLiquidSphere2, ballStyle2]} />
      <Animated.View style={[styles.blurredLiquidSphere3, ballStyle3]} />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainerLayoutEngine}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveBentoContainerGrid}>
          
          <Text style={[styles.dashboardSectionMainHeadline, { color: COLORS.textDark }]}>Account Core Engine</Text>

          {/* DYNAMIC VIEW CONSTRAINTS WRAPPER */}
          <View style={isDesktop ? styles.desktopGridColumnsSplitRow : styles.mobileVerticalStackedLayout}>
            
            {/* COLUMN LEFT: PERSONAL IDENTITY PANEL */}
            <View style={isDesktop ? styles.desktopFlexibleColumn : styles.fullWidthPanelStack}>
              
              {/* Profile Bio Widget Card Layout */}
              <View style={styles.glassPremiumDashboardCard}>
                <View style={[styles.profileAvatar3DBadgeCircle, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.profileAvatarTextGraphic}>
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>

                <Text style={[styles.profileMainHeadingNameText, { color: COLORS.textDark }]}>{profile?.name || 'Wellbeing User'}</Text>
                <Text style={[styles.profileSubtextEmailText, { color: COLORS.textLight }]}>{profile?.email || 'user@example.com'}</Text>
                
                <View style={styles.premiumTierBadgeWrapper}>
                  <Feather name="crown" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.premiumTierBadgeText}>Premium Active Plan</Text>
                </View>

                {/* Identity Property Read-Only List Block */}
                <View style={styles.metadataInlinePropertiesContainerList}>
                  <View style={styles.metadataRowItemFlex}>
                    <Text style={[styles.metadataItemLabel, { color: COLORS.textLight }]}>Age Index</Text>
                    <Text style={[styles.metadataItemValueText, { color: COLORS.textDark }]}>{profile?.age || 23} Yrs</Text>
                  </View>
                  <View style={styles.metadataRowItemFlex}>
                    <Text style={[styles.metadataItemLabel, { color: COLORS.textLight }]}>Gender Node</Text>
                    <Text style={[styles.metadataItemValueText, { color: COLORS.textDark }]}>{profile?.gender || 'MALE'}</Text>
                  </View>
                  <View style={styles.metadataRowItemFlex}>
                    <Text style={[styles.metadataItemLabel, { color: COLORS.textLight }]}>Account Authority Role</Text>
                    <Text style={[styles.metadataItemValueText, { color: COLORS.textDark }]}>{profile?.primaryRole || 'STUDENT'}</Text>
                  </View>
                  <View style={styles.metadataRowItemFlex}>
                    <Text style={[styles.metadataItemLabel, { color: COLORS.textLight }]}>Wake Up Sync Time</Text>
                    <Text style={[styles.metadataItemValueText, { color: COLORS.textDark }]}>
                      {profile?.wakeUpTime ? new Date(profile.wakeUpTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:00 AM'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.editProfileTriggerCTAButton, { backgroundColor: COLORS.primary }]} 
                  activeOpacity={0.8} 
                  onPress={() => setEditModalVisible(true)}
                >
                  <Feather name="edit-3" size={16} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.editProfileTriggerCTAButtonText}>Edit System Profile</Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* COLUMN RIGHT: PREFERENCES & SYSTEM INTERACTIONS */}
            <View style={isDesktop ? styles.desktopFlexibleColumn : styles.fullWidthPanelStack}>
              
              {/* Preferences Configuration block */}
              <View style={styles.glassPremiumDashboardCard}>
                <Text style={[styles.cardSectionMiniHeadingTitleText, { color: COLORS.textDark }]}>System Preferences</Text>

                <View style={styles.switchRowInteractionFlex}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.interactionMainLabelText, { color: COLORS.textDark }]}>Push Notification Matrix</Text>
                    <Text style={[styles.interactionSubLabelText, { color: COLORS.textLight }]}>Real-time logs reminders configuration tips</Text>
                  </View>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
                    thumbColor="white"
                  />
                </View>

                <View style={styles.switchRowInteractionFlex}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.interactionMainLabelText, { color: COLORS.textDark }]}>Dark Mode Overlays</Text>
                    <Text style={[styles.interactionSubLabelText, { color: COLORS.textLight }]}>Dynamic adaptive visual parameters (Beta)</Text>
                  </View>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
                    thumbColor="white"
                  />
                </View>

                <View style={styles.switchRowInteractionFlex}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.interactionMainLabelText, { color: COLORS.textDark }]}>Weekly Digest Reports</Text>
                    <Text style={[styles.interactionSubLabelText, { color: COLORS.textLight }]}>Deliver mental battery resource logs to email</Text>
                  </View>
                  <Switch
                    value={emailReminders}
                    onValueChange={setEmailReminders}
                    trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
                    thumbColor="white"
                  />
                </View>
              </View>

              {/* Security operations exit card container panel */}
              <View style={styles.glassPremiumDashboardCard}>
                <Text style={[styles.cardSectionMiniHeadingTitleText, { color: COLORS.textDark }]}>Account Verification & Exit</Text>
                
                <TouchableOpacity style={styles.actionRowTileAnchorButton} onPress={() => Alert.alert('Security', 'System tokens are encrypted natively.')}>
                  <Feather name="shield" size={18} color={COLORS.textDark} />
                  <Text style={[styles.actionRowTileAnchorButtonText, { color: COLORS.textDark }]}>Data Protection Integrity</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.textLight} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRowTileAnchorButton} onPress={logout}>
                  <Feather name="log-out" size={18} color={COLORS.primary} />
                  <Text style={[styles.actionRowTileAnchorButtonText, { color: COLORS.primary, fontWeight: '700' }]}>Terminate Secure Session</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.versioningMetadataFootnoteText, { color: COLORS.textLight }]}>Version 1.0.5 • Build Node Production Verified</Text>

            </View>

          </View>

        </View>
      </Animated.ScrollView>

      {/* UPDATE PROFILE FORM INPUTS OVERLAY SHEET MODAL */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalBlurOverlayDimmer}>
          <View style={styles.modalInteractiveSheetContainer}>
            
            <View style={styles.modalHeaderRowLayout}>
              <Text style={[styles.modalSheetMainTitle, { color: COLORS.textDark }]}>Update Profile Form</Text>
              <TouchableOpacity style={styles.modalCloseCircleButton} onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Full Profile Name</Text>
              <TextInput
                style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="Nishi"
                placeholderTextColor="#A0522D"
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Secure Email Identifier</Text>
              <TextInput
                style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="example@gmail.com"
                placeholderTextColor="#A0522D"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formEmail}
                onChangeText={formEmail => setFormEmail(formEmail)}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}>
                  <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Age Meter</Text>
                  <TextInput
                    style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                    placeholder="23"
                    placeholderTextColor="#A0522D"
                    keyboardType="number-pad"
                    value={formAge}
                    onChangeText={setFormAge}
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Gender Vector</Text>
                  <TextInput
                    style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                    placeholder="MALE"
                    placeholderTextColor="#A0522D"
                    value={formGender}
                    onChangeText={setFormGender}
                  />
                </View>
              </View>

              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Primary Role Authority</Text>
              <TextInput
                style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="STUDENT"
                placeholderTextColor="#A0522D"
                value={formRole}
                onChangeText={setFormRole}
              />

              <TouchableOpacity 
                style={[styles.modalSubmitButtonCTA, { backgroundColor: COLORS.primary }]} 
                onPress={handleUpdateProfile}
                disabled={updating}
              >
                {updating ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.modalSubmitButtonCTAText}>Submit Profile Update</Text>}
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DYNAMIC SUCCESS BANNER MODAL WINDOW */}
      <Modal animationType="fade" transparent={true} visible={successModalVisible} onRequestClose={() => setSuccessModalVisible(false)}>
        <View style={styles.modalCenterDimmerView}>
          <View style={styles.modalSuccessAlertCard}>
            <View style={[styles.modalSuccessCheckCircleIconBadge, { backgroundColor: '#22C55E' }]}>
              <Feather name="check-circle" size={36} color="white" />
            </View>
            <Text style={[styles.modalSuccessAlertHeadingMainText, { color: COLORS.textDark }]}>Update Finalized</Text>
            <Text style={[styles.modalSuccessAlertBodyParagraphText, { color: COLORS.textLight }]}>Your profile updated successfully! System records re-aligned.</Text>
            <TouchableOpacity style={[styles.modalDismissCTAButton, { backgroundColor: COLORS.primary }]} activeOpacity={0.8} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.modalDismissCTAButtonText}>Acknowledge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrapperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContextText: {
    marginTop: 14,
    fontWeight: '600',
    fontSize: 14,
  },
  // Anti-Direction 3D Soft Blurred Spheres Layout Matrix Design
  blurredLiquidSphere1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.secondary,
    opacity: 0.28,
    top: '10%',
    left: -80,
    ...Platform.select({
      web: { filter: 'blur(75px)' },
    }),
    zIndex: 0,
  },
  blurredLiquidSphere2: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.primary,
    opacity: 0.16,
    bottom: '22%',
    right: -100,
    ...Platform.select({
      web: { filter: 'blur(90px)' },
    }),
    zIndex: 0,
  },
  blurredLiquidSphere3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.darkSienna,
    opacity: 0.22,
    top: '55%',
    left: '35%',
    ...Platform.select({
      web: { filter: 'blur(70px)' },
    }),
    zIndex: 0,
  },
  floatingVectorLeft: {
    position: 'absolute',
    left: -40,
    top: screenHeight * 0.12,
    zIndex: 1,
  },
  floatingVectorRight: {
    position: 'absolute',
    right: -50,
    bottom: screenHeight * 0.15,
    zIndex: 1,
  },
  scrollContainerLayoutEngine: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
  },
  responsiveBentoContainerGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    zIndex: 3,
  },
  dashboardSectionMainHeadline: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  desktopGridColumnsSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mobileVerticalStackedLayout: {
    flexDirection: 'column',
  },
  desktopFlexibleColumn: {
    width: '49%',
  },
  fullWidthPanelStack: {
    width: '100%',
  },
  glassPremiumDashboardCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.darkSienna, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 16 },
      android: { elevation: 2 },
    }),
  },
  profileAvatar3DBadgeCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  profileAvatarTextGraphic: {
    fontSize: 36,
    color: 'white',
    fontWeight: '800',
  },
  profileMainHeadingNameText: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  profileSubtextEmailText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  premiumTierBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFEA', // Delicate sienna hue padding background
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(227, 83, 54, 0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  premiumTierBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  metadataInlinePropertiesContainerList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(160, 82, 45, 0.1)',
    paddingTop: 12,
    marginBottom: 24,
  },
  metadataRowItemFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 82, 45, 0.05)',
  },
  metadataItemLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metadataItemValueText: {
    fontSize: 14,
    fontWeight: '700',
  },
  editProfileTriggerCTAButton: {
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  editProfileTriggerCTAButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  cardSectionMiniHeadingTitleText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  switchRowInteractionFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 82, 45, 0.08)',
  },
  interactionMainLabelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  interactionSubLabelText: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRowTileAnchorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 82, 45, 0.08)',
  },
  actionRowTileAnchorButtonText: {
    fontSize: 15,
    marginLeft: 14,
    fontWeight: '500',
  },
  versioningMetadataFootnoteText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  modalBlurOverlayDimmer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(74, 35, 26, 0.4)', // Dimmed overlay matching sienna context profile tint
  },
  modalInteractiveSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: screenHeight * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeaderRowLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalSheetMainTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalCloseCircleButton: {
    backgroundColor: '#F5F5F6',
    padding: 6,
    borderRadius: 20,
  },
  modalLabelTitleField: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalTextInputBoxComponent: {
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 18,
  },
  modalSubmitButtonCTA: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalSubmitButtonCTAText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCenterDimmerView: {
    flex: 1,
    backgroundColor: 'rgba(74, 35, 26, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalSuccessAlertCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalSuccessCheckCircleIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalSuccessAlertHeadingMainText: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalSuccessAlertBodyParagraphText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalDismissCTAButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalDismissCTAButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});