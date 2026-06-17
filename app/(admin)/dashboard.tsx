// app/(admin)/dashboard.tsx
import {
  Activity,
  ArrowUp,
  Award,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  Lightbulb,
  Plus,
  Server,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Zap
} from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);

  // Common styles for cards
  const cardStyle = {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  };

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="white"
        translucent={Platform.OS === 'android'}
      />
      <ScrollView 
        style={{ 
          flex: 1, 
          backgroundColor: '#f8fafc',
          marginTop: 0
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 20,
          paddingTop: 0 
        }}
      >
        <View style={{ 
          padding: Platform.OS === 'web' ? 24 : 16,
          maxWidth: Platform.OS === 'web' ? 1400 : '100%', 
          width: '100%', 
          alignSelf: 'center' 
        }}>
          
          {/* Header Section */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 24
          }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>Dashboard</Text>
              <Text style={{ color: '#64748b', marginTop: 4 }}>Welcome back, {user?.name || 'Admin'}</Text>
            </View>
            <Pressable 
              onPress={logout}
              style={({ pressed }) => ([{
                backgroundColor: 'white',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                opacity: pressed ? 0.8 : 1
              }])}
            >
              <Text style={{ color: '#334155', fontWeight: '500' }}>Logout</Text>
            </Pressable>
          </View>

          {/* Bento Grid - Row 1: Stats Cards */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            ...(Platform.OS === 'web' ? { marginHorizontal: -8 } : { marginHorizontal: -4 })
          }}>
            {/* Total Users Card */}
            <View style={{ 
              width: Platform.OS === 'web' ? '25%' : '50%', 
              ...(Platform.OS === 'web' ? { paddingHorizontal: 8 } : { paddingHorizontal: 4 }),
              marginBottom: Platform.OS === 'web' ? 16 : 8
            }}>
              <View style={[cardStyle, { padding: Platform.OS === 'web' ? 20 : 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#ccfbf1', padding: 8, borderRadius: 8 }}>
                    <Users size={22} color="#0d9488" />
                  </View>
                  <TrendingUp size={18} color="#10b981" />
                </View>
                <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Total Users</Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>2,847</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <ArrowUp size={12} color="#10b981" />
                  <Text style={{ color: '#10b981', fontSize: 11, marginLeft: 2 }}>+12.5%</Text>
                </View>
              </View>
            </View>

            {/* Revenue Card */}
            <View style={{ 
              width: Platform.OS === 'web' ? '25%' : '50%', 
              ...(Platform.OS === 'web' ? { paddingHorizontal: 8 } : { paddingHorizontal: 4 }),
              marginBottom: Platform.OS === 'web' ? 16 : 8
            }}>
              <View style={[cardStyle, { padding: Platform.OS === 'web' ? 20 : 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#dbeafe', padding: 8, borderRadius: 8 }}>
                    <DollarSign size={22} color="#3b82f6" />
                  </View>
                  <Activity size={18} color="#8b5cf6" />
                </View>
                <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Revenue</Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>$12,450</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <ArrowUp size={12} color="#10b981" />
                  <Text style={{ color: '#10b981', fontSize: 11, marginLeft: 2 }}>+8.2%</Text>
                </View>
              </View>
            </View>

            {/* Active Now Card */}
            <View style={{ 
              width: Platform.OS === 'web' ? '25%' : '50%', 
              ...(Platform.OS === 'web' ? { paddingHorizontal: 8 } : { paddingHorizontal: 4 }),
              marginBottom: Platform.OS === 'web' ? 16 : 8
            }}>
              <View style={[cardStyle, { padding: Platform.OS === 'web' ? 20 : 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#f3e8ff', padding: 8, borderRadius: 8 }}>
                    <Zap size={22} color="#8b5cf6" />
                  </View>
                  <Users size={18} color="#06b6d4" />
                </View>
                <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Active Now</Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>342</Text>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>Currently online</Text>
              </View>
            </View>

            {/* System Health Card */}
            <View style={{ 
              width: Platform.OS === 'web' ? '25%' : '50%', 
              ...(Platform.OS === 'web' ? { paddingHorizontal: 8 } : { paddingHorizontal: 4 }),
              marginBottom: Platform.OS === 'web' ? 16 : 8
            }}>
              <View style={[cardStyle, { padding: Platform.OS === 'web' ? 20 : 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#d1fae5', padding: 8, borderRadius: 8 }}>
                    <Server size={22} color="#10b981" />
                  </View>
                  <Activity size={18} color="#10b981" />
                </View>
                <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>System Health</Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>99.9%</Text>
                <Text style={{ color: '#10b981', fontSize: 11, marginTop: 8 }}>All systems operational</Text>
              </View>
            </View>
          </View>

          {/* Row 2: Analytics Overview (Large Card) */}
          <View style={{ 
            ...(Platform.OS === 'web' ? { marginHorizontal: 8 } : { marginHorizontal: 4 }),
            marginBottom: 16 
          }}>
            <View style={[cardStyle, { padding: Platform.OS === 'web' ? 24 : 20, borderRadius: 12 }]}>
              <View style={{ 
                flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                justifyContent: 'space-between', 
                alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
                marginBottom: 24,
                gap: Platform.OS === 'web' ? 0 : 12
              }}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Analytics Overview</Text>
                  <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Performance metrics for last 30 days</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable style={{ backgroundColor: '#0d9488', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>Monthly</Text>
                  </Pressable>
                  <Pressable style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ color: '#475569', fontSize: 12, fontWeight: '500' }}>Yearly</Text>
                  </Pressable>
                </View>
              </View>

              {/* Key Metrics Row */}
              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap',
                ...(Platform.OS === 'web' ? { marginHorizontal: -8 } : { marginHorizontal: -4 }),
                marginBottom: 24
              }}>
                <View style={{ 
                  width: Platform.OS === 'web' ? '33.33%' : '100%',
                  ...(Platform.OS === 'web' ? { paddingHorizontal: 8 } : { paddingHorizontal: 4 }),
                  marginBottom: Platform.OS === 'web' ? 0 : 12
                }}>
                  <View style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Conversion Rate</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>6.8%</Text>
                    <Text style={{ color: '#10b981', fontSize: 11, marginTop: 4 }}>↑ 0.5% increase</Text>
                  </View>
                </View>
                <View style={{ 
                  width: Platform.OS === 'web' ? '33.33%' : '100%',
                  ...(Platform.OS === 'web' ? { paddingHorizontal: 8 } : { paddingHorizontal: 4 }),
                  marginBottom: Platform.OS === 'web' ? 0 : 12
                }}>
                  <View style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Avg. Session Duration</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>4m 32s</Text>
                    <Text style={{ color: '#10b981', fontSize: 11, marginTop: 4 }}>↑ 23 seconds</Text>
                  </View>
                </View>
                <View style={{ 
                  width: Platform.OS === 'web' ? '33.33%' : '100%',
                  ...(Platform.OS === 'web' ? { paddingHorizontal: 8 } : { paddingHorizontal: 4 })
                }}>
                  <View style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Bounce Rate</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>34.2%</Text>
                    <Text style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>↓ 2.1% improvement</Text>
                  </View>
                </View>
              </View>

              {/* Bar Chart */}
              <View style={{ marginTop: 8 }}>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'flex-end', 
                  gap: Platform.OS === 'web' ? 8 : 4, 
                  height: 240 
                }}>
                  {[65, 75, 55, 85, 70, 90, 80, 88, 72, 78, 82, 92].map((height, index) => (
                    <View key={index} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                      <View style={{ width: '100%', backgroundColor: '#0d9488', height: `${height}%`, borderTopLeftRadius: 4, borderTopRightRadius: 4, position: 'relative' }}>
                        <View style={{ position: 'absolute', top: -24, left: 0, right: 0, alignItems: 'center' }}>
                          <Text style={{ color: '#0d9488', fontSize: 11, fontWeight: '600' }}>{height}%</Text>
                        </View>
                      </View>
                      <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Summary Stats */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                marginTop: 24, 
                paddingTop: 16, 
                borderTopWidth: 1, 
                borderTopColor: '#f1f5f9' 
              }}>
                <View>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>Total Revenue</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>$145,230</Text>
                </View>
                <View>
                  <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'right' }}>Growth Rate</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>+23.1%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Row 3: Quick Actions + Recent Activity */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            ...(Platform.OS === 'web' ? { marginHorizontal: 8 } : { marginHorizontal: 4 })
          }}>
            {/* Quick Actions */}
            <View style={{ 
              width: Platform.OS === 'web' ? '33.33%' : '100%',
              ...(Platform.OS === 'web' ? { paddingRight: 8 } : { paddingRight: 4 }),
              marginBottom: 16
            }}>
              <View style={[cardStyle, { padding: 20, borderRadius: 12 }]}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 16 }}>Quick Actions</Text>
                <View style={{ gap: 12 }}>
                  {/* Create Subscription Button */}
                  <Pressable 
                    onPress={() => setSubscriptionModalVisible(true)}
                    style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ backgroundColor: '#ccfbf1', padding: 8, borderRadius: 8 }}>
                          <Crown size={18} color="#0d9488" />
                        </View>
                        <View>
                          <Text style={{ color: '#0f172a', fontWeight: '500' }}>Create Subscription</Text>
                          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Add new subscription plan</Text>
                        </View>
                      </View>
                      <Plus size={16} color="#0d9488" />
                    </View>
                  </Pressable>

                  <Pressable style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ backgroundColor: '#dbeafe', padding: 8, borderRadius: 8 }}>
                          <Users size={18} color="#3b82f6" />
                        </View>
                        <View>
                          <Text style={{ color: '#0f172a', fontWeight: '500' }}>Manage Users</Text>
                          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Add, edit, or remove users</Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color="#94a3b8" />
                    </View>
                  </Pressable>

                  <Pressable style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ backgroundColor: '#f3e8ff', padding: 8, borderRadius: 8 }}>
                          <Lightbulb size={18} color="#8b5cf6" />
                        </View>
                        <View>
                          <Text style={{ color: '#0f172a', fontWeight: '500' }}>Manage Tips</Text>
                          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Update AI recovery tips</Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color="#94a3b8" />
                    </View>
                  </Pressable>

                  <Pressable style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ backgroundColor: '#fef3c7', padding: 8, borderRadius: 8 }}>
                          <BarChart3 size={18} color="#f59e0b" />
                        </View>
                        <View>
                          <Text style={{ color: '#0f172a', fontWeight: '500' }}>View Reports</Text>
                          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Generate analytics reports</Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color="#94a3b8" />
                    </View>
                  </Pressable>

                  <Pressable style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ backgroundColor: '#fee2e2', padding: 8, borderRadius: 8 }}>
                          <Settings size={18} color="#ef4444" />
                        </View>
                        <View>
                          <Text style={{ color: '#0f172a', fontWeight: '500' }}>Settings</Text>
                          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Configure system settings</Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color="#94a3b8" />
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View style={{ 
              width: Platform.OS === 'web' ? '66.67%' : '100%',
              ...(Platform.OS === 'web' ? { paddingLeft: 8 } : { paddingLeft: 4 }),
              marginBottom: 16
            }}>
              <View style={[cardStyle, { padding: 20, borderRadius: 12 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Recent Activity</Text>
                    <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Latest user interactions</Text>
                  </View>
                  <Pressable style={{ backgroundColor: '#ccfbf1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                    <Text style={{ color: '#0d9488', fontSize: 12, fontWeight: '500' }}>View All</Text>
                  </Pressable>
                </View>
                <View style={{ gap: 12 }}>
                  {[
                    { initials: "JD", name: "John Doe", action: "subscribed to Yearly Plan", time: "2 minutes ago", bgColor: "#dbeafe", textColor: "#2563eb" },
                    { initials: "AS", name: "Alice Smith", action: "logged 5 activities", time: "15 minutes ago", bgColor: "#f3e8ff", textColor: "#7e22ce" },
                    { initials: "MB", name: "Mike Brown", action: "requested support", time: "1 hour ago", bgColor: "#ccfbf1", textColor: "#0d9488" },
                    { initials: "RK", name: "Rachel Kim", action: "cancelled subscription", time: "2 hours ago", bgColor: "#ffedd5", textColor: "#ea580c" }
                  ].map((activity, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' }}>
                      <View style={{ backgroundColor: activity.bgColor, width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: activity.textColor, fontWeight: 'bold' }}>{activity.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#0f172a', fontWeight: '500' }}>{activity.name}</Text>
                        <Text style={{ color: '#64748b', fontSize: 13 }}>{activity.action}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} color="#94a3b8" />
                        <Text style={{ color: '#94a3b8', fontSize: 11 }}>{activity.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Row 4: Subscriptions + AI Tips + User Growth */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            ...(Platform.OS === 'web' ? { marginHorizontal: 8 } : { marginHorizontal: 4 })
          }}>
            {/* Top Users */}
            <View style={{ 
              width: Platform.OS === 'web' ? '33.33%' : '100%',
              ...(Platform.OS === 'web' ? { paddingRight: 8 } : { paddingRight: 4 }),
              marginBottom: 16
            }}>
              <View style={[cardStyle, { padding: 20, borderRadius: 12 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Top Users</Text>
                    <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Highest engagement</Text>
                  </View>
                  <Award size={20} color="#0d9488" />
                </View>
                <View style={{ gap: 12 }}>
                  {[
                    { rank: 1, name: "Sarah Johnson", plan: "Premium User", points: 245, bgColor: "#fef3c7", textColor: "#d97706" },
                    { rank: 2, name: "David Chen", plan: "Monthly Plan", points: 198, bgColor: "#e2e8f0", textColor: "#475569" },
                    { rank: 3, name: "Emma Wilson", plan: "Yearly Plan", points: 167, bgColor: "#ffedd5", textColor: "#ea580c" }
                  ].map((userItem, index) => (
                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ backgroundColor: userItem.bgColor, width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: userItem.textColor, fontWeight: 'bold', fontSize: 12 }}>#{userItem.rank}</Text>
                        </View>
                        <View>
                          <Text style={{ fontWeight: '500', color: '#0f172a' }}>{userItem.name}</Text>
                          <Text style={{ color: '#64748b', fontSize: 11 }}>{userItem.plan}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#10b981', fontWeight: '600' }}>{userItem.points} pts</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Crown size={10} color="#f59e0b" />
                          <Text style={{ color: '#94a3b8', fontSize: 10 }}>Active</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Subscriptions Overview */}
            <View style={{ 
              width: Platform.OS === 'web' ? '33.33%' : '100%',
              ...(Platform.OS === 'web' ? { paddingHorizontal: 8 } : { paddingHorizontal: 4 }),
              marginBottom: 16
            }}>
              <View style={[cardStyle, { padding: 20, borderRadius: 12 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Subscriptions</Text>
                    <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Plan distribution</Text>
                  </View>
                  <CreditCard size={20} color="#0d9488" />
                </View>
                <View style={{ gap: 16 }}>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#475569', fontSize: 13 }}>Premium</Text>
                      <Text style={{ color: '#0f172a', fontWeight: '600' }}>1,847 (64.9%)</Text>
                    </View>
                    <View style={{ backgroundColor: '#f1f5f9', height: 6, borderRadius: 3 }}>
                      <View style={{ backgroundColor: '#0d9488', width: '64.9%', height: 6, borderRadius: 3 }} />
                    </View>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#475569', fontSize: 13 }}>Monthly</Text>
                      <Text style={{ color: '#0f172a', fontWeight: '600' }}>642 (22.6%)</Text>
                    </View>
                    <View style={{ backgroundColor: '#f1f5f9', height: 6, borderRadius: 3 }}>
                      <View style={{ backgroundColor: '#3b82f6', width: '22.6%', height: 6, borderRadius: 3 }} />
                    </View>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#475569', fontSize: 13 }}>Yearly</Text>
                      <Text style={{ color: '#0f172a', fontWeight: '600' }}>358 (12.5%)</Text>
                    </View>
                    <View style={{ backgroundColor: '#f1f5f9', height: 6, borderRadius: 3 }}>
                      <View style={{ backgroundColor: '#8b5cf6', width: '12.5%', height: 6, borderRadius: 3 }} />
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ color: '#64748b', fontSize: 11 }}>Monthly Recurring</Text>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>$8,450</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#64748b', fontSize: 11 }}>Annual Recurring</Text>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>$101,400</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Combined Tips & Growth */}
            <View style={{ 
              width: Platform.OS === 'web' ? '33.33%' : '100%',
              ...(Platform.OS === 'web' ? { paddingLeft: 8 } : { paddingLeft: 4 }),
              marginBottom: 16
            }}>
              <View style={{ flexDirection: 'column', gap: 16 }}>
                {/* AI Tips Card */}
                <View style={[cardStyle, { padding: 20, borderRadius: 12 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ backgroundColor: '#f3e8ff', padding: 8, borderRadius: 8 }}>
                      <Sparkles size={22} color="#8b5cf6" />
                    </View>
                    <Calendar size={18} color="#8b5cf6" />
                  </View>
                  <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>AI Tips Generated</Text>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>8,942</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                    <View>
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>This week</Text>
                      <Text style={{ color: '#0f172a', fontWeight: '600' }}>1,234</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#e2e8f0' }} />
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>Avg. Rating</Text>
                      <Text style={{ color: '#0f172a', fontWeight: '600' }}>4.8 ★</Text>
                    </View>
                  </View>
                </View>

                {/* User Growth Card */}
                <View style={[cardStyle, { padding: 20, borderRadius: 12 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ backgroundColor: '#ccfbf1', padding: 8, borderRadius: 8 }}>
                      <UserPlus size={22} color="#0d9488" />
                    </View>
                    <Target size={18} color="#0d9488" />
                  </View>
                  <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>New Users (30d)</Text>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>+345</Text>
                  <Text style={{ color: '#10b981', fontSize: 13, marginTop: 8 }}>↑ 24.5% growth rate</Text>
                  <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>Projected next month</Text>
                    <Text style={{ color: '#0f172a', fontWeight: '600', marginTop: 2 }}>+420 new users</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        visible={subscriptionModalVisible}
        onClose={() => setSubscriptionModalVisible(false)}
        onSuccess={() => {
          console.log('Subscription created successfully');
          // You can add a refresh function here if needed
        }}
      />
    </>
  );
}