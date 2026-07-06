// app/(user)/settings.tsx
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  Text,
  TextInput,
  TouchableOpacity,
  View
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

const COLORS = {
  background: '#FAF9F5',
  cardBg: 'rgba(255, 255, 255, 0.90)',
  textDark: '#11231D',
  textLight: '#576860',
  primary: '#336956',
  secondary: '#E09643',
  darkSienna: '#1B4235',
  border: 'rgba(51, 105, 86, 0.08)',
  accentBg: 'rgba(51, 105, 86, 0.06)',
};

interface UserProfileData {
  userId: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  primaryRole: string;
  wakeUpTime: string;
  phoneNo: string;
  guardianName: string;
  guardianPhoneNo: string;
}

export default function SettingsScreen() {
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  const [globalLoading, setGlobalLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('MALE');
  const [formRole, setFormRole] = useState('STUDENT');
  const [formWakeUp, setFormWakeUp] = useState('');
  const [formPhoneNo, setFormPhoneNo] = useState('');
  const [formGuardianName, setFormGuardianName] = useState('');
  const [formGuardianPhoneNo, setFormGuardianPhoneNo] = useState('');

  // --- Change Password States ---
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // Reanimated Shared Scroll Offset
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
      const response = await rootApi.get<UserProfileData>('/api/user/profile');
      if (response.data) {
        setProfile(response.data);
        setFormName(response.data.name);
        setFormEmail(response.data.email);
        setFormAge(String(response.data.age));
        setFormGender(response.data.gender || 'MALE');
        setFormRole(response.data.primaryRole || 'STUDENT');
        setFormWakeUp(response.data.wakeUpTime || '2026-06-11T06:00:00');
        setFormPhoneNo(response.data.phoneNo || '');
        setFormGuardianName(response.data.guardianName || '');
        setFormGuardianPhoneNo(response.data.guardianPhoneNo || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formName.trim() || !formAge.trim() || !formPhoneNo.trim() || !formGuardianName.trim() || !formGuardianPhoneNo.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setUpdating(true);
    const payload = {
      userId: profile?.userId || 'USER00002',
      name: formName.trim(),
      email: formEmail.trim(),
      age: parseInt(formAge, 10) || 0,
      gender: formGender,
      primaryRole: formRole,
      wakeUpTime: formWakeUp,
      phoneNo: formPhoneNo.trim(),
      guardianName: formGuardianName.trim(),
      guardianPhoneNo: formGuardianPhoneNo.trim()
    };

    try {
      await rootApi.put('/api/user/profile/update', payload);
      setProfile({
        ...profile,
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        age: payload.age,
        gender: payload.gender,
        primaryRole: payload.primaryRole,
        wakeUpTime: payload.wakeUpTime,
        phoneNo: payload.phoneNo,
        guardianName: payload.guardianName,
        guardianPhoneNo: payload.guardianPhoneNo
      });
      setEditModalVisible(false);
      setSuccessModalVisible(true);
    } catch (err) {
      console.error('Update failed:', err);
      Alert.alert('Update Failed', 'An error occurred during submission.');
    } finally {
      setUpdating(false);
    }
  };

  // --- Change Password Handlers ---
  const handleChangePassword = async () => {
    // Validations
    if (!oldPassword.trim()) {
      setChangePasswordError('Please enter your current password');
      return;
    }
    if (!newPassword.trim()) {
      setChangePasswordError('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setChangePasswordError('New password must contain at least 1 uppercase, 1 lowercase, and 1 digit');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('Passwords do not match');
      return;
    }
    if (oldPassword === newPassword) {
      setChangePasswordError('New password cannot be the same as old password');
      return;
    }

    setChangePasswordError('');
    setChangePasswordLoading(true);

    try {
      await rootApi.post('/api/auth/change-Password', {
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim()
      });
      // Success
      setChangePasswordModalVisible(false);
      setPasswordChangeSuccess(true);
      // Reset fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setChangePasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const closeChangePasswordModal = () => {
    setChangePasswordModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangePasswordError('');
    setChangePasswordLoading(false);
  };

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
          
          <Text style={[styles.dashboardSectionMainHeadline, { color: COLORS.textDark }]}>My Account Details</Text>

          <View style={isDesktop ? styles.desktopGridColumnsSplitRow : styles.mobileVerticalStackedLayout}>
            
            {/* COLUMN LEFT: PERSONAL IDENTITY PANEL */}
            <View style={isDesktop ? styles.desktopFlexibleColumn : styles.fullWidthPanelStack}>
              
              <View style={styles.glassPremiumDashboardCard}>
                <View style={[styles.profileSidebarAvatarCircle, { backgroundColor: COLORS.primary }]}>
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

                <View style={styles.metadataInlinePropertiesContainerList}>
                  <View style={styles.metadataRowItemFlex}>
                    <Text style={[styles.metadataItemLabel, { color: COLORS.textLight }]}>Age Index</Text>
                    <Text style={[styles.metadataItemValueText, { color: COLORS.textDark }]}>{profile?.age || 23} Yrs</Text>
                  </View>
                  <View style={styles.metadataRowItemFlex}>
                    <Text style={[styles.metadataItemLabel, { color: COLORS.textLight }]}>Phone Number</Text>
                    <Text style={[styles.metadataItemValueText, { color: COLORS.textDark }]}>{profile?.phoneNo || 'Not Set'}</Text>
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
                    <Text style={[styles.metadataItemLabel, { color: COLORS.textLight }]}>Guardian Name</Text>
                    <Text style={[styles.metadataItemValueText, { color: COLORS.textDark }]}>{profile?.guardianName || 'Not Set'}</Text>
                  </View>
                  <View style={styles.metadataRowItemFlex}>
                    <Text style={[styles.metadataItemLabel, { color: COLORS.textLight }]}>Guardian Phone</Text>
                    <Text style={[styles.metadataItemValueText, { color: COLORS.textDark }]}>{profile?.guardianPhoneNo || 'Not Set'}</Text>
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
                  <Text style={styles.editProfileTriggerCTAButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* COLUMN RIGHT: PREFERENCES & SYSTEM INTERACTIONS */}
            <View style={isDesktop ? styles.desktopFlexibleColumn : styles.fullWidthPanelStack}>
              
              <View style={styles.glassPremiumDashboardCard}>
                <Text style={[styles.cardSectionMiniHeadingTitleText, { color: COLORS.textDark }]}>Account Verification & Exit</Text>
                
                {/* Change Password Button - NEW */}
                <TouchableOpacity style={styles.actionRowTileAnchorButton} onPress={() => setChangePasswordModalVisible(true)}>
                  <Feather name="lock" size={18} color={COLORS.primary} />
                  <Text style={[styles.actionRowTileAnchorButtonText, { color: COLORS.primary, fontWeight: '700' }]}>Change Password</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRowTileAnchorButton} onPress={() => router.push('/(user)/faq')}>
                  <Feather name="user" size={18} color={COLORS.primary} />
                  <Text style={[styles.actionRowTileAnchorButtonText, { color: COLORS.primary, fontWeight: '700' }]}>FAQ's</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRowTileAnchorButton} onPress={logout}>
                  <Feather name="log-out" size={18} color="#DC2626" />
                  <Text style={[styles.actionRowTileAnchorButtonText, { color: '#DC2626', fontWeight: '700' }]}>Terminate Secure Session</Text>
                  <Feather name="chevron-right" size={16} color="#DC2626" style={{ marginLeft: 'auto' }} />
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
                placeholderTextColor={COLORS.textLight}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Secure Email Identifier</Text>
              <TextInput
                style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="example@gmail.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formEmail}
                onChangeText={setFormEmail}
              />

              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Phone Number</Text>
              <TextInput
                style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="10 digit number"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
                maxLength={10}
                value={formPhoneNo}
                onChangeText={setFormPhoneNo}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}>
                  <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Age Meter</Text>
                  <TextInput
                    style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                    placeholder="23"
                    placeholderTextColor={COLORS.textLight}
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
                    placeholderTextColor={COLORS.textLight}
                    value={formGender}
                    onChangeText={setFormGender}
                  />
                </View>
              </View>

              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Primary Role Authority</Text>
              <TextInput
                style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="STUDENT"
                placeholderTextColor={COLORS.textLight}
                value={formRole}
                onChangeText={setFormRole}
              />

              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Guardian Name</Text>
              <TextInput
                style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="Guardian full name"
                placeholderTextColor={COLORS.textLight}
                value={formGuardianName}
                onChangeText={setFormGuardianName}
              />

              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Guardian Phone Number</Text>
              <TextInput
                style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border }]}
                placeholder="Guardian 10 digit number"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
                maxLength={10}
                value={formGuardianPhoneNo}
                onChangeText={setFormGuardianPhoneNo}
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

      {/* --- CHANGE PASSWORD MODAL --- */}
      <Modal
        animationType="slide"
        transparent
        visible={changePasswordModalVisible}
        onRequestClose={closeChangePasswordModal}
      >
        <View style={styles.modalBlurOverlayDimmer}>
          <View style={styles.modalInteractiveSheetContainer}>
            <View style={styles.modalHeaderRowLayout}>
              <Text style={[styles.modalSheetMainTitle, { color: COLORS.textDark }]}>Change Password</Text>
              <TouchableOpacity style={styles.modalCloseCircleButton} onPress={closeChangePasswordModal}>
                <Feather name="x" size={18} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
              {changePasswordError ? (
                <View style={[styles.errorContainer, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 16 }]}>
                  <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600' }}>{changePasswordError}</Text>
                </View>
              ) : null}

              {/* Old Password */}
              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Current Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border, paddingRight: 48 }]}
                  placeholder="Enter current password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowOldPassword(!showOldPassword)}>
                  <Feather name={showOldPassword ? "eye" : "eye-off"} size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              {/* New Password */}
              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>New Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border, paddingRight: 48 }]}
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Feather name={showNewPassword ? "eye" : "eye-off"} size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={[styles.modalLabelTitleField, { color: COLORS.textDark }]}>Confirm New Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.modalTextInputBoxComponent, { color: COLORS.textDark, borderColor: COLORS.border, paddingRight: 48 }]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitButtonCTA, { backgroundColor: COLORS.primary }]}
                onPress={handleChangePassword}
                disabled={changePasswordLoading}
              >
                {changePasswordLoading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.modalSubmitButtonCTAText}>Update Password</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PASSWORD CHANGE SUCCESS MODAL */}
      <Modal animationType="fade" transparent visible={passwordChangeSuccess} onRequestClose={() => setPasswordChangeSuccess(false)}>
        <View style={styles.modalCenterDimmerView}>
          <View style={styles.modalSuccessAlertCard}>
            <View style={[styles.modalSuccessCheckCircleIconBadge, { backgroundColor: '#22C55E' }]}>
              <Feather name="check-circle" size={36} color="white" />
            </View>
            <Text style={[styles.modalSuccessAlertHeadingMainText, { color: COLORS.textDark }]}>Password Changed!</Text>
            <Text style={[styles.modalSuccessAlertBodyParagraphText, { color: COLORS.textLight }]}>Your password has been updated successfully.</Text>
            <TouchableOpacity style={[styles.modalDismissCTAButton, { backgroundColor: COLORS.primary }]} activeOpacity={0.8} onPress={() => setPasswordChangeSuccess(false)}>
              <Text style={styles.modalDismissCTAButtonText}>Done</Text>
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
  blurredLiquidSphere1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.secondary,
    opacity: 0.22,
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
    opacity: 0.14,
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
    opacity: 0.18,
    top: '55%',
    left: '35%',
    ...Platform.select({
      web: { filter: 'blur(70px)' },
    }),
    zIndex: 0,
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
  profileSidebarAvatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 3 },
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
    backgroundColor: 'rgba(51, 105, 86, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 105, 86, 0.15)',
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
    borderTopColor: 'rgba(51, 105, 86, 0.08)',
    paddingTop: 12,
    marginBottom: 24,
  },
  metadataRowItemFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 105, 86, 0.04)',
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
  actionRowTileAnchorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 105, 86, 0.06)',
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
    backgroundColor: 'rgba(17, 35, 29, 0.3)',
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
    backgroundColor: 'rgba(17, 35, 29, 0.3)',
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
  // New styles for password inputs with eye icon
  passwordInputWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
    zIndex: 5,
  },
  errorContainer: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
});