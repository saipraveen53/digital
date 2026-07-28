// app/(admin)/subscribers.tsx
import {
  Briefcase,
  CreditCard,
  Eye,
  Filter,
  IndianRupee,
  Mail,
  Phone,
  Search,
  User,
  UserCheck,
  Users,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
interface Subscription {
  subId: string;
  subName: string;
  price: number;
  totalPurchases: number;
  userIds: string[];
}

interface Subscriber {
  userId: string;
  name: string;
  email: string;
  phoneNo: string;
  role: string;
  gender: string;
}

// ─── Main Component ─────────────────────────────────────────────
export default function SubscribersManagement() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const cardWidth = isDesktop ? '33.33%' : (isTablet ? '50%' : '100%');
  const cardPadding = isDesktop ? 8 : (isTablet ? 8 : 0);

  // ── State ──
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // ── Fetch Subscriptions ──
  const fetchSubscriptions = async () => {
    try {
      setError('');
      const response = await rootApi.get<Subscription[]>('/api/admin/subAnalytics');
      setSubscriptions(response.data || []);
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      setError(err.response?.data?.message || 'Failed to load subscriptions');
      setSubscriptions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── Refresh ──
  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // ── Fetch Subscribers for a plan ──
  const fetchSubscribers = async (subscription: Subscription) => {
    if (!subscription.userIds || subscription.userIds.length === 0) {
      Alert.alert('No Subscribers', 'This plan has no subscribers yet.');
      return;
    }

    setSelectedSub(subscription);
    setModalVisible(true);
    setLoadingSubscribers(true);
    setSubscribers([]);

    try {
      // Send userIds as array in query params
      const response = await rootApi.get<Subscriber[]>('/api/admin/planByUsers', {
        params: { userIds: subscription.userIds }
      });
      setSubscribers(response.data || []);
    } catch (err: any) {
      console.error('Error fetching subscribers:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to load subscribers.');
    } finally {
      setLoadingSubscribers(false);
    }
  };

  // ── Stats ──
  const totalSubscriptions = subscriptions.length;
  const totalPurchases = subscriptions.reduce((sum, s) => sum + s.totalPurchases, 0);
  const totalUsers = subscriptions.reduce((sum, s) => sum + s.userIds.length, 0);

  const statsCards = [
    {
      title: 'Total Plans',
      value: totalSubscriptions.toString(),
      icon: CreditCard,
      change: `+${totalSubscriptions}`,
      color: '#0d9488',
      bgColor: '#ccfbf1'
    },
    {
      title: 'Total Purchases',
      value: totalPurchases.toString(),
      icon: IndianRupee,
      change: `+${totalPurchases}`,
      color: '#8b5cf6',
      bgColor: '#f3e8ff'
    },
    {
      title: 'Total Subscribers',
      value: totalUsers.toString(),
      icon: Users,
      change: `+${totalUsers}`,
      color: '#3b82f6',
      bgColor: '#dbeafe'
    }
  ];

  // ── Loading ──
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
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
    >
      <View style={[styles.wrapper, isMobile && styles.wrapperMobile]}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Subscribers</Text>
            <Text style={styles.headerSubtitle}>Manage subscription plans and view subscribers</Text>
          </View>
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
              placeholder="Search plans by name..."
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

        {/* Subscriptions Grid */}
        {subscriptions.length > 0 ? (
          <View style={styles.gridContainer}>
            {subscriptions
              .filter(sub => sub.subName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((sub) => (
                <View
                  key={sub.subId}
                  style={{
                    width: cardWidth,
                    paddingBottom: 16,
                    paddingHorizontal: cardPadding,
                  }}
                >
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.planInfo}>
                        <Text style={styles.planName}>{sub.subName}</Text>
                        <View style={styles.priceBadge}>
                          <IndianRupee size={12} color="#0d9488" />
                          <Text style={styles.priceText}>{sub.price}</Text>
                        </View>
                      </View>
                      <View style={styles.purchasesBadge}>
                        <Users size={12} color="#8b5cf6" />
                        <Text style={styles.purchasesText}>{sub.totalPurchases} purchases</Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.subscribersCount}>
                        <UserCheck size={16} color="#64748b" />
                        <Text style={styles.countText}>
                          {sub.userIds.length} subscriber{sub.userIds.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => fetchSubscribers(sub)}
                        style={styles.viewBtn}
                      >
                        <Eye size={14} color="white" />
                        <Text style={styles.viewBtnText}>View Subscribers</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <CreditCard size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Plans Found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'No plans match your search' : 'Subscription plans will appear here'}
            </Text>
          </View>
        )}
      </View>

      {/* ─── Subscribers Modal ─── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Subscribers – {selectedSub?.subName}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {loadingSubscribers ? (
                <View style={styles.loadingSubscribers}>
                  <ActivityIndicator size="large" color="#0d9488" />
                  <Text style={styles.loadingSubscribersText}>Loading subscribers...</Text>
                </View>
              ) : subscribers.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false} style={styles.subscribersList}>
                  {subscribers.map((user) => (
                    <View key={user.userId} style={styles.subscriberCard}>
                      <View style={styles.subscriberAvatar}>
                        <Text style={styles.subscriberAvatarText}>
                          {user.name?.charAt(0) || '?'}
                        </Text>
                      </View>
                      <View style={styles.subscriberInfo}>
                        <Text style={styles.subscriberName}>{user.name || 'Unknown'}</Text>
                        <View style={styles.subscriberDetails}>
                          <Mail size={12} color="#94a3b8" />
                          <Text style={styles.subscriberDetailText}>{user.email || '—'}</Text>
                        </View>
                        <View style={styles.subscriberDetails}>
                          <Phone size={12} color="#94a3b8" />
                          <Text style={styles.subscriberDetailText}>{user.phoneNo || '—'}</Text>
                        </View>
                        <View style={styles.subscriberDetails}>
                          <Briefcase size={12} color="#94a3b8" />
                          <Text style={styles.subscriberDetailText}>{user.role || '—'}</Text>
                        </View>
                        <View style={styles.subscriberDetails}>
                          <User size={12} color="#94a3b8" />
                          <Text style={styles.subscriberDetailText}>{user.gender || '—'}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noSubscribers}>
                  <Users size={48} color="#cbd5e1" />
                  <Text style={styles.noSubscribersText}>No subscribers for this plan</Text>
                </View>
              )}
            </View>
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
  cardHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  planInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  planName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  priceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ccfbf1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priceText: { fontSize: 13, fontWeight: 'bold', color: '#0d9488' },
  purchasesBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  purchasesText: { fontSize: 12, color: '#64748b' },
  cardBody: { padding: 16, flex: 1 },
  subscribersCount: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countText: { fontSize: 14, color: '#475569' },
  cardActions: { padding: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  viewBtn: { backgroundColor: '#0d9488', paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  viewBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  emptyState: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 40, alignItems: 'center', width: '100%' },
  emptyTitle: { color: '#0f172a', fontWeight: 'bold', fontSize: 18, marginTop: 12 },
  emptySub: { color: '#64748b', textAlign: 'center', marginTop: 4, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContainer: { backgroundColor: 'white', borderRadius: 24, width: '100%', maxWidth: 600, maxHeight: '90%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', flex: 1 },
  modalBody: { padding: 16 },
  loadingSubscribers: { paddingVertical: 40, alignItems: 'center' },
  loadingSubscribersText: { color: '#64748b', marginTop: 12, fontSize: 14 },
  subscribersList: { maxHeight: 500 },
  subscriberCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  subscriberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  subscriberAvatarText: { fontWeight: 'bold', fontSize: 16, color: '#0f172a' },
  subscriberInfo: { flex: 1 },
  subscriberName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  subscriberDetails: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  subscriberDetailText: { fontSize: 12, color: '#475569' },
  noSubscribers: { paddingVertical: 40, alignItems: 'center' },
  noSubscribersText: { color: '#94a3b8', fontSize: 14, marginTop: 8 }
});