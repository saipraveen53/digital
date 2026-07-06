// app/(admin)/users.tsx
import {
  Activity,
  Award,
  Battery,
  Calendar,
  Crown,
  Filter,
  Mail,
  MoreVertical,
  Phone,
  Search,
  Star,
  TrendingUp,
  UserCheck,
  Users as UsersIcon,
  X,
  Zap
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
interface User {
  userId: string;
  name: string;
  email: string;
  age: number | null;
  gender: string | null;
  primaryRole: string | null;
  wakeUpTime: string | null;
  timeZone: string | null;
  phoneNo: string | null;
  guardianName: string | null;
  guardianPhoneNo: string | null;
}

interface MonthlyStats {
  averageWellbeingScore: number;
  mostRecoveredActivity: string;
  mostDrainedActivity: string;
}

// ─── Main Component ─────────────────────────────────────────────
export default function UsersManagement() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const cardWidth = isDesktop ? '33.33%' : (isTablet ? '50%' : '100%');
  const cardPadding = isDesktop ? 8 : (isTablet ? 8 : 0);

  // ── State ──
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const hasMore = currentPage < totalPages - 1;

  const fetchingRef = useRef(false);

  // Score Modal State
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [month, setMonth] = useState<string>('1');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Month names mapping
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // ── Fetch Users ──
  const fetchUsers = async (page: number, append = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setError('');
      const response = await rootApi.get('/api/admin/getAllUsers', {
        params: { page, size: pageSize }
      });

      const data = response.data;
      let content: User[] = [];
      let total = 0;
      let pages = 0;
      let current = 0;

      if (Array.isArray(data)) {
        content = data;
        total = data.length;
        pages = Math.ceil(data.length / pageSize);
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
        setUsers(prev => [...prev, ...content]);
      } else {
        setUsers(content);
      }
      setTotalElements(total);
      setTotalPages(pages);
      setCurrentPage(current);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
      setUsers([]);
      Alert.alert('Error', 'Could not fetch users. Please try again.');
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
    fetchUsers(currentPage + 1, true);
  };

  // ── Refresh ──
  const onRefresh = () => {
    setRefreshing(true);
    setUsers([]);
    setCurrentPage(0);
    fetchUsers(0, false);
  };

  useEffect(() => {
    fetchUsers(0, false);
  }, []);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 40;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMore();
    }
  };

  // ── Fetch Monthly Stats ──
  const fetchMonthlyStats = async () => {
    if (!selectedUser) return;

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      Alert.alert('Invalid Month', 'Please select a valid month.');
      return;
    }
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      Alert.alert('Invalid Year', 'Please enter a valid year (e.g., 2026).');
      return;
    }

    setLoadingStats(true);
    setStats(null);
    try {
      const response = await rootApi.get<MonthlyStats>(
        `/api/admin/user/${selectedUser.userId}/monthlyStats`,
        {
          params: { month: monthNum, year: yearNum }
        }
      );
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to fetch user stats.');
    } finally {
      setLoadingStats(false);
    }
  };

  // ── Open Score Modal ──
  const openScoreModal = (user: User) => {
    setSelectedUser(user);
    setMonth('1');
    setYear(new Date().getFullYear().toString());
    setStats(null);
    setScoreModalVisible(true);
  };

  // ── Stats ──
  const activeUsers = (users || []).filter(u => u.email && u.name).length;
  const newThisMonth = (users || []).filter(u => {
    if (!u.wakeUpTime) return false;
    const joinDate = new Date(u.wakeUpTime);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;

  const statsCards = [
    {
      title: 'Total Users',
      value: totalElements.toString(),
      icon: UsersIcon,
      change: `+${totalElements}`,
      color: '#0d9488',
      bgColor: '#ccfbf1'
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      icon: UserCheck,
      change: `+${activeUsers}`,
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'New This Month',
      value: newThisMonth.toString(),
      icon: TrendingUp,
      change: `+${newThisMonth}`,
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Inactive Users',
      value: (totalElements - activeUsers).toString(),
      icon: UsersIcon,
      change: '-',
      color: '#ef4444',
      bgColor: '#fee2e2'
    }
  ];

  // ── Helpers ──
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColor = (name: string) => {
    const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ── Loading ──
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Loading users...</Text>
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

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Users Management</Text>
            <Text style={styles.headerSubtitle}>Manage and monitor platform users</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statItem,
                { width: isMobile ? '50%' : '25%' }
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
              placeholder="Search users by name or email..."
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

        {/* Users Grid */}
        {users.length > 0 ? (
          <View style={styles.gridContainer}>
            {users.map((user) => {
              const initials = getInitials(user.name);
              const color = getColor(user.name);
              const status = user.email && user.name ? 'Active' : 'Inactive';
              const statusColor = status === 'Active' ? '#10b981' : '#ef4444';
              const statusBg = status === 'Active' ? '#d1fae5' : '#fee2e2';
              const role = user.primaryRole || 'No Role';
              const joinDate = user.wakeUpTime ? formatDate(user.wakeUpTime) : 'N/A';

              return (
                <View
                  key={user.userId}
                  style={{
                    width: cardWidth,
                    paddingBottom: 16,
                    paddingHorizontal: cardPadding,
                  }}
                >
                  <View style={styles.card}>
                    <View style={[styles.accentBar, { backgroundColor: color }]} />

                    <View style={styles.cardHeader}>
                      <View style={styles.userInfo}>
                        <View style={[styles.avatar, { backgroundColor: `${color}15` }]}>
                          <Text style={[styles.avatarText, { color }]}>{initials}</Text>
                        </View>
                        <View style={styles.userMeta}>
                          <Text style={styles.userName}>{user.name || 'Unknown'}</Text>
                          <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                              <Text style={[styles.statusText, { color: statusColor }]}>
                                {status}
                              </Text>
                            </View>
                            <View style={styles.rating}>
                              <Star size={12} color="#f59e0b" />
                              <Text style={styles.ratingText}>4.5</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <Pressable>
                        <MoreVertical size={18} color="#94a3b8" />
                      </Pressable>
                    </View>

                    <View style={styles.cardDetails}>
                      <View style={styles.detailRow}>
                        <Mail size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>{user.email || 'No email'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Phone size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>{user.phoneNo || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Calendar size={14} color="#94a3b8" />
                        <Text style={styles.detailText}>Joined {joinDate}</Text>
                      </View>
                    </View>

                    <View style={styles.cardStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{user.age ?? '—'}</Text>
                        <Text style={styles.statLabel}>Age</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.statItem}>
                        <View style={styles.roleRow}>
                          <Crown size={14} color="#f59e0b" />
                          <Text style={styles.roleText}>{role}</Text>
                        </View>
                        <Text style={styles.statLabel}>Role</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{user.gender || '—'}</Text>
                        <Text style={styles.statLabel}>Gender</Text>
                      </View>
                    </View>

                    {/* Check Score Button */}
                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => openScoreModal(user)}
                        style={styles.scoreBtn}
                      >
                        <Activity size={14} color="#8b5cf6" />
                        <Text style={styles.scoreBtnText}>Check Score</Text>
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
            <Text style={styles.emptyTitle}>No Users Found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'No users match your search' : 'Start adding users to your platform'}
            </Text>
          </View>
        )}

        {/* Loading More */}
        {loadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#0d9488" />
            <Text style={styles.loadingMoreText}>Loading more users...</Text>
          </View>
        )}

        {/* End of list */}
        {!hasMore && users.length > 0 && (
          <View style={styles.endOfList}>
            <Text style={styles.endOfListText}>You've reached the end</Text>
          </View>
        )}
      </View>

      {/* ─── Score Modal ─── */}
      <Modal
        visible={scoreModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Monthly Score for {selectedUser?.name || 'User'}
              </Text>
              <Pressable onPress={() => setScoreModalVisible(false)} hitSlop={10}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {/* Month Dropdown with Names */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Month</Text>
                <View style={styles.dropdownWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dropdownScroll}
                  >
                    {monthNames.map((name, index) => {
                      const monthNum = index + 1;
                      const isActive = parseInt(month) === monthNum;
                      return (
                        <Pressable
                          key={monthNum}
                          onPress={() => setMonth(monthNum.toString())}
                          style={[
                            styles.monthOption,
                            isActive && styles.monthOptionActive
                          ]}
                        >
                          <Text
                            style={[
                              styles.monthOptionText,
                              isActive && styles.monthOptionTextActive
                            ]}
                          >
                            {name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              {/* Year Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Year</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 2026"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={year}
                  onChangeText={setYear}
                />
              </View>

              {/* Fetch Button */}
              <Pressable
                onPress={fetchMonthlyStats}
                disabled={loadingStats}
                style={styles.fetchBtn}
              >
                {loadingStats ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.fetchBtnText}>Get Score</Text>
                )}
              </Pressable>

              {/* Stats Result */}
              {stats && (
                <View style={styles.statsResult}>
                  <View style={styles.resultRow}>
                    <Award size={20} color="#0d9488" />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultLabel}>Average Wellbeing Score</Text>
                      <Text style={styles.resultValue}>{stats.averageWellbeingScore.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <Zap size={20} color="#8b5cf6" />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultLabel}>Most Recovered Activity</Text>
                      <Text style={styles.resultValue}>{stats.mostRecoveredActivity || '—'}</Text>
                    </View>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <Battery size={20} color="#ef4444" />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultLabel}>Most Drained Activity</Text>
                      <Text style={styles.resultValue}>{stats.mostDrainedActivity || '—'}</Text>
                    </View>
                  </View>
                </View>
              )}

              {!stats && !loadingStats && (
                <View style={styles.noStats}>
                  <Activity size={32} color="#cbd5e1" />
                  <Text style={styles.noStatsText}>Select month & year and tap "Get Score"</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  wrapper: {
    padding: 16,
  },
  wrapperMobile: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingText: {
    color: '#64748b',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 2,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  statItem: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statIcon: {
    padding: 8,
    borderRadius: 8,
  },
  statChange: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  statTitle: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 14,
    padding: 0,
  },
  filterBtn: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  errorRetry: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    alignItems: 'stretch',
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  accentBar: {
    height: 4,
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    color: '#64748b',
  },
  cardDetails: {
    padding: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  scoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#d8b4fe',
  },
  scoreBtnText: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 12,
  },
  emptySub: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 14,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    color: '#64748b',
    fontSize: 14,
  },
  endOfList: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endOfListText: {
    color: '#94a3b8',
    fontSize: 13,
  },

  // ─── Modal Styles ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  dropdownWrapper: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dropdownScroll: {
    flexDirection: 'row',
  },
  monthOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 3,
  },
  monthOptionActive: {
    backgroundColor: '#0d9488',
  },
  monthOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  monthOptionTextActive: {
    color: 'white',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  fetchBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fetchBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  statsResult: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  noStats: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  noStatsText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});