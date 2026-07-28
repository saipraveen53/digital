// app/(admin)/consultations.tsx
import {
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Filter,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  PlusCircle,
  Search,
  User,
  Users as UsersIcon,
  X,
  XCircle
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { rootApi } from '../utils/axiosInstance';

// ─── Types ──────────────────────────────────────────────────────
interface Consultation {
  bookingId: number;
  userId: string;
  userName: string;
  userAge: number;
  userGender: string;
  registeredPhone: string;
  whatsappNumber: string;
  occupation: string;
  city: string;
  difficulties: string[];
  duration: string;
  amountPaid: number;
  bookedAt: string;
  adminInteracted: boolean;
}

// ─── Main Component ─────────────────────────────────────────────
export default function ConsultationsManagement() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const cardWidth = isDesktop ? '33.33%' : (isTablet ? '50%' : '100%');
  const cardPadding = isDesktop ? 8 : (isTablet ? 8 : 0);

  // ── State ──
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 15;
  const hasMore = currentPage < totalPages - 1;

  const fetchingRef = useRef(false);

  // Fee Modal State
  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [newFee, setNewFee] = useState('');
  const [submittingFee, setSubmittingFee] = useState(false);

  // Success Modal State
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ── Fetch Consultations ──
  const fetchConsultations = async (page: number, append = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setError('');
      const response = await rootApi.get('/api/admin/getConsultations', {
        params: { page, size: pageSize }
      });

      const data = response.data;
      let content: Consultation[] = [];
      let total = 0;
      let pages = 0;
      let current = 0;

      if (Array.isArray(data)) {
        content = data;
        total = data.length;
        pages = data.length < pageSize ? page + 1 : page + 2;
        current = page;
      } else if (data && typeof data === 'object' && Array.isArray(data.content)) {
        content = data.content;
        total = data.totalElements ?? 0;
        pages = data.totalPages ?? 0;
        current = data.number ?? 0;
      } else {
        content = [];
      }

      if (append) {
        setConsultations(prev => [...prev, ...content]);
      } else {
        setConsultations(content);
      }
      setTotalElements(total);
      setTotalPages(pages);
      setCurrentPage(current);
    } catch (err: any) {
      console.error('Error fetching consultations:', err);
      setError(err.response?.data?.message || 'Failed to load consultations');
      setConsultations([]);
      Alert.alert('Error', 'Could not fetch consultations. Please try again.');
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // ── Load more ──
  const loadMore = () => {
    if (!hasMore || loadingMore || fetchingRef.current) return;
    setLoadingMore(true);
    fetchConsultations(currentPage + 1, true);
  };

  // ── Refresh ──
  const onRefresh = () => {
    setRefreshing(true);
    setConsultations([]);
    setCurrentPage(0);
    fetchConsultations(0, false);
  };

  useEffect(() => {
    fetchConsultations(0, false);
  }, []);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 40;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMore();
    }
  };

  // ── Update Consultation Fee ──
  const updateConsultationFee = async () => {
    const fee = parseInt(newFee);
    if (isNaN(fee) || fee < 0) {
      Alert.alert('Invalid Fee', 'Please enter a valid positive number.');
      return;
    }

    setSubmittingFee(true);
    try {
      await rootApi.post('/api/admin/updateCOnsultationFee', null, {
        params: { newFee: fee }
      });
      Alert.alert('Success', 'Consultation fee updated successfully!');
      setFeeModalVisible(false);
      setNewFee('');
    } catch (err: any) {
      console.error('Error updating fee:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update consultation fee.');
    } finally {
      setSubmittingFee(false);
    }
  };

  // ── Mark as Interacted ──
  const markAsInteracted = async (bookingId: number) => {
    try {
      await rootApi.patch('/api/admin/markAsConsulted', null, {
        params: { bookingId }
      });
      setSuccessMessage('Consultation marked as interacted successfully!');
      setSuccessModalVisible(true);
      // Refresh the list to update the status
      onRefresh();
    } catch (err: any) {
      console.error('Error marking as interacted:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to mark consultation as interacted.');
    }
  };

  // ── Helper ──
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration: string) => {
    const map: Record<string, string> = {
      'TONIGHT_ONLY': 'Tonight Only',
      'A_FEW_DAYS': 'A Few Days',
      'ONE_WEEK': 'One Week',
      'TWO_WEEKS': 'Two Weeks',
      'ONE_MONTH': 'One Month'
    };
    return map[duration] || duration;
  };

  const formatDifficulties = (difficulties: string[]) => {
    const map: Record<string, string> = {
      'DIFFICULTY_FALLING_ASLEEP': 'Falling Asleep',
      'WOKE_UP_DURING_THE_NIGHT': 'Woke Up at Night',
      'FEELING_ANXIOUS_BEFORE_SLEEP': 'Anxious Before Sleep',
      'MIND_WONT_STOP_THINKING': 'Mind Won\'t Stop',
      'STRESS_RELATED': 'Stress Related',
      'EMOTIONAL_DISTRESS': 'Emotional Distress',
      'OTHER': 'Other'
    };
    return difficulties.map(d => map[d] || d).join(' • ');
  };

  // ── Stats ──
  const totalConsultations = totalElements || consultations.length;
  const interactedCount = consultations.filter(c => c.adminInteracted).length;
  const notInteractedCount = totalConsultations - interactedCount;

  const statsCards = [
    {
      title: 'Total Consultations',
      value: totalConsultations.toString(),
      icon: UsersIcon,
      change: `+${totalConsultations}`,
      color: '#0d9488',
      bgColor: '#ccfbf1'
    },
    {
      title: 'Interacted',
      value: interactedCount.toString(),
      icon: CheckCircle,
      change: `+${interactedCount}`,
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'Pending Interaction',
      value: notInteractedCount.toString(),
      icon: XCircle,
      change: `+${notInteractedCount}`,
      color: '#f59e0b',
      bgColor: '#fef3c7'
    }
  ];

  // ── Loading ──
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Loading consultations...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
      }
      onScroll={handleScroll}
      scrollEventThrottle={200}
    >
      <View style={[styles.wrapper, isMobile && styles.wrapperMobile]}>

        {/* Header with Add Fee Button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Consultations</Text>
            <Text style={styles.headerSubtitle}>Manage user consultation requests</Text>
          </View>
          <Pressable
            onPress={() => setFeeModalVisible(true)}
            style={styles.addFeeBtn}
          >
            <PlusCircle size={18} color="white" />
            <Text style={styles.addFeeBtnText}>Add Fee</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statItem,
                { width: isMobile ? '33.33%' : '33.33%' }
              ]}
            >
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statChange}>{stat.change}</Text>
                </View>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by user name or phone..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable style={styles.filterBtn}>
            <Filter size={18} color="#64748b" />
          </Pressable>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={onRefresh}>
              <Text style={styles.errorRetry}>Retry →</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Consultations Grid */}
        {consultations.length > 0 ? (
          <View style={styles.gridContainer}>
            {consultations.map((consult) => {
              const isInteracted = consult.adminInteracted;
              return (
                <View
                  key={consult.bookingId}
                  style={{
                    width: cardWidth,
                    paddingBottom: 16,
                    paddingHorizontal: cardPadding,
                  }}
                >
                  <View style={styles.card}>
                    {/* Status Badge */}
                    <View style={styles.cardHeader}>
                      <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {consult.userName?.charAt(0) || 'U'}
                          </Text>
                        </View>
                        <View style={styles.userMeta}>
                          <Text style={styles.userName}>{consult.userName || 'Unknown'}</Text>
                          <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: isInteracted ? '#d1fae5' : '#fef3c7' }]}>
                              <Text style={[styles.statusText, { color: isInteracted ? '#10b981' : '#f59e0b' }]}>
                                {isInteracted ? 'Interacted' : 'Pending'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.amountBadge}>
                        <IndianRupee size={14} color="#0d9488" />
                        <Text style={styles.amountText}>{consult.amountPaid}</Text>
                      </View>
                    </View>

                    {/* Details */}
                    <View style={styles.cardDetails}>
                      <View style={styles.detailRow}>
                        <User size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>{consult.userAge} yrs • {consult.userGender}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Phone size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>{consult.registeredPhone}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MessageCircle size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>WhatsApp: {consult.whatsappNumber}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Briefcase size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>{consult.occupation || '—'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MapPin size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>{consult.city || '—'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Calendar size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>{formatDate(consult.bookedAt)}</Text>
                      </View>
                      {consult.difficulties && consult.difficulties.length > 0 && (
                        <View style={styles.difficultiesContainer}>
                          <Text style={styles.difficultiesLabel}>Difficulties:</Text>
                          <Text style={styles.difficultiesText} numberOfLines={2}>
                            {formatDifficulties(consult.difficulties)}
                          </Text>
                        </View>
                      )}
                      {/* Duration moved below difficulties */}
                      <View style={styles.detailRow}>
                        <Clock size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>Duration: {formatDuration(consult.duration)}</Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => markAsInteracted(consult.bookingId)}
                        disabled={isInteracted}
                        style={[styles.actionBtn, isInteracted && styles.actionBtnDisabled]}
                      >
                        <Text style={[styles.actionBtnText, isInteracted && styles.actionBtnTextDisabled]}>
                          {isInteracted ? 'Already Interacted' : 'Mark Interacted'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <UsersIcon size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Consultations</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'No consultations match your search' : 'Consultations will appear here'}
            </Text>
          </View>
        )}

        {/* Loading More */}
        {loadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#0d9488" />
            <Text style={styles.loadingMoreText}>Loading more...</Text>
          </View>
        )}

        {/* End of list */}
        {!hasMore && consultations.length > 0 && (
          <View style={styles.endOfList}>
            <Text style={styles.endOfListText}>You've reached the end</Text>
          </View>
        )}
      </View>

      {/* ─── Fee Modal ─── */}
      <Modal
        visible={feeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFeeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Consultation Fee</Text>
              <Pressable onPress={() => setFeeModalVisible(false)} hitSlop={10}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Fee (in USD)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 25"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={newFee}
                  onChangeText={setNewFee}
                  editable={!submittingFee}
                />
              </View>

              <Pressable
                onPress={updateConsultationFee}
                disabled={submittingFee}
                style={styles.submitBtn}
              >
                {submittingFee ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Update Fee</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Success Modal ─── */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successIconCircle}>
              <Check size={28} color="#059669" strokeWidth={3} />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            <Pressable
              onPress={() => setSuccessModalVisible(false)}
              style={styles.successBtn}
            >
              <Text style={styles.successBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles (all single‑line) ──────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  wrapper: { padding: 16 },
  wrapperMobile: { padding: 12 },
  loadingContainer: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  loadingBox: { backgroundColor: 'white', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' },
  headerLeft: { flex: 1, marginRight: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { color: '#64748b', fontSize: 14, marginTop: 2 },
  addFeeBtn: { backgroundColor: '#0d9488', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  addFeeBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8, marginBottom: 16 },
  statItem: { paddingHorizontal: 8, marginBottom: 16 },
  statCard: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  statIcon: { padding: 8, borderRadius: 8 },
  statChange: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  statTitle: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, color: '#0f172a', fontSize: 14, padding: 0 },
  filterBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText: { color: '#dc2626', fontSize: 14, flex: 1 },
  errorRetry: { color: '#b91c1c', fontWeight: '600', fontSize: 14, marginLeft: 8 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', alignItems: 'stretch' },
  card: { flex: 1, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1, flexDirection: 'column', justifyContent: 'space-between' },
  cardHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: 'bold', fontSize: 16, color: '#0f172a' },
  userMeta: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '600' },
  amountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ccfbf1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  amountText: { fontSize: 14, fontWeight: 'bold', color: '#0d9488' },
  cardDetails: { padding: 16, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: '#475569', flex: 1 },
  difficultiesContainer: { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  difficultiesLabel: { fontSize: 11, fontWeight: '600', color: '#64748b', marginBottom: 2 },
  difficultiesText: { fontSize: 12, color: '#475569', lineHeight: 16 },
  cardActions: { padding: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  actionBtn: { backgroundColor: '#0d9488', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionBtnDisabled: { backgroundColor: '#e2e8f0' },
  actionBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  actionBtnTextDisabled: { color: '#94a3b8' },
  emptyState: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 40, alignItems: 'center', width: '100%' },
  emptyTitle: { color: '#0f172a', fontWeight: 'bold', fontSize: 18, marginTop: 12 },
  emptySub: { color: '#64748b', textAlign: 'center', marginTop: 4, fontSize: 14 },
  loadingMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 8 },
  loadingMoreText: { color: '#64748b', fontSize: 14 },
  endOfList: { alignItems: 'center', paddingVertical: 20 },
  endOfListText: { color: '#94a3b8', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContainer: { backgroundColor: 'white', borderRadius: 24, width: '100%', maxWidth: 400, padding: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', flex: 1 },
  modalBody: { gap: 16 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
  textInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  submitBtn: { backgroundColor: '#0d9488', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },

  // Success Modal
  successModalContainer: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' },
  successIconCircle: { width: 56, height: 56, backgroundColor: '#f0fdf4', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#dcfce7' },
  successTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', letterSpacing: -0.3 },
  successMessage: { fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 6, marginBottom: 24, textAlign: 'center', lineHeight: 18, paddingHorizontal: 8 },
  successBtn: { width: '100%', paddingVertical: 14, backgroundColor: '#0f172a', borderRadius: 14 },
  successBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
});