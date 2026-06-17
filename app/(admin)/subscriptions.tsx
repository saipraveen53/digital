// app/(admin)/subscriptions.tsx
import { Calendar, Crown, DollarSign, Edit2, Plus, RefreshCw, Trash2, Users, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import { rootApi } from '../utils/axiosInstance';

interface Subscription {
  subId: string;
  subName: string;
  subDescription: string;
  price: number;
  durationDays: number;
  status: boolean;
}

export default function Subscriptions() {
  const [modalVisible, setModalVisible] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const isAndroid = Platform.OS === 'android';
  const isSmallScreen = width < 400;

  // Fetch all subscriptions from API
  const fetchSubscriptions = async () => {
    try {
      setError('');
      const response = await rootApi.get('/api/admin/allSubscriptions');
      
      // Response should be an array of SubscriptionResponse objects
      const data = response.data;
      
      if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        console.error('Unexpected response format:', data);
        setSubscriptions([]);
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      setError(error.response?.data?.message || 'Failed to fetch subscriptions');
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Delete subscription
  const deleteSubscription = async (subId: string, subName: string) => {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete "${subName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('Info', 'Delete endpoint not implemented yet. Please add DELETE /api/admin/subscription/{subId} to your backend.');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete subscription');
            }
          }
        }
      ]
    );
  };

  // Toggle subscription status
  const toggleSubscriptionStatus = async (subscription: Subscription) => {
    try {
      Alert.alert('Info', 'Update endpoint not implemented yet. Please add PUT /api/admin/subscription/{subId} to your backend.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update subscription status');
    }
  };

  // Edit subscription
  const editSubscription = (subscription: Subscription) => {
    Alert.alert('Info', 'Edit functionality coming soon. Please implement PUT /api/admin/subscription/{subId} endpoint.');
  };

  // Initial load
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  // Calculate stats based on fetched data
  const activeSubscriptions = subscriptions.filter(s => s.status === true);
  const totalRevenue = subscriptions.reduce((sum, s) => s.status ? sum + s.price : sum, 0);
  
  const statsCards = [
    {
      title: 'Total Plans',
      value: subscriptions.length.toString(),
      icon: Crown,
      change: `+${subscriptions.length}`,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      description: 'Total subscription plans'
    },
    {
      title: 'Active Plans',
      value: activeSubscriptions.length.toString(),
      icon: Zap,
      change: activeSubscriptions.length > 0 ? 'Active' : 'None',
      color: '#10b981',
      bgColor: '#d1fae5',
      description: 'Currently active plans'
    },
    {
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: `Based on ${activeSubscriptions.length} plans`,
      color: '#0d9488',
      bgColor: '#ccfbf1',
      description: 'Total monthly potential'
    },
    {
      title: 'Total Subscribers',
      value: '0',
      icon: Users,
      change: 'Coming soon',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      description: 'Active subscribers'
    },
  ];

  const getPlanColor = (index: number) => {
    const colors = ['#0d9488', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#ef4444', '#06b6d4'];
    return colors[index % colors.length];
  };

  const getDurationText = (days: number) => {
    if (days === 30) return 'month';
    if (days === 365) return 'year';
    if (days === 7) return 'week';
    return `${days} days`;
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <View className="bg-white rounded-xl p-8 items-center shadow-sm border border-slate-200">
          <RefreshCw size={32} color="#0d9488" />
          <Text className="text-slate-600 mt-4">Loading subscriptions...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        className="flex-1 bg-slate-50" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
        }
        contentContainerStyle={{ paddingBottom: isAndroid ? 20 : 0 }}
      >
        <View className={isSmallScreen ? "p-3" : "p-4"}>
          {/* Header with Create Button */}
          <View className="flex-row flex-wrap justify-between items-center gap-3 mb-6">
            <View className="flex-1">
              <Text className="text-xl md:text-2xl font-bold text-slate-900">Subscriptions</Text>
              <Text className="text-slate-600 text-sm mt-1">Manage user subscription plans</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable 
                onPress={onRefresh}
                className="bg-white px-3 md:px-4 py-2.5 rounded-xl flex-row items-center gap-2 border border-slate-200"
                disabled={refreshing}
              >
                <RefreshCw size={isSmallScreen ? 14 : 18} color="#64748b" />
                {!isSmallScreen && <Text className="text-slate-700 font-medium">Refresh</Text>}
              </Pressable>
              <Pressable 
                onPress={() => setModalVisible(true)}
                className="bg-teal-600 px-3 md:px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-sm"
              >
                <Plus size={isSmallScreen ? 16 : 18} color="white" />
                <Text className="text-white font-medium text-sm md:text-base">
                  {isSmallScreen ? 'Create' : 'Create Plan'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <Text className="text-red-600 text-sm">{error}</Text>
              <Pressable onPress={fetchSubscriptions} className="mt-2">
                <Text className="text-red-700 font-medium text-sm">Try Again →</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Stats Bento Grid */}
          <View className="flex-row flex-wrap -mx-2 mb-6">
            {statsCards.map((stat, index) => (
              <View key={index} className="w-1/2 px-2 mb-4">
                <View className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 shadow-sm">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className={`p-2 rounded-lg`} style={{ backgroundColor: stat.bgColor }}>
                      <stat.icon size={isSmallScreen ? 16 : 20} color={stat.color} />
                    </View>
                    <Text className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {stat.change}
                    </Text>
                  </View>
                  <Text className="text-slate-500 text-xs md:text-sm">{stat.title}</Text>
                  <Text className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{stat.value}</Text>
                  <Text className="text-slate-400 text-xs mt-2">{stat.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Subscriptions Bento Grid */}
          {subscriptions.length > 0 ? (
            <View className="flex-row flex-wrap -mx-2">
              {subscriptions.map((subscription, index) => {
                const planColor = getPlanColor(index);
                const durationText = getDurationText(subscription.durationDays);
                
                return (
                  <View key={subscription.subId} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <View className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      {/* Color Accent Bar */}
                      <View className="h-1" style={{ backgroundColor: planColor }} />
                      
                      {/* Plan Header */}
                      <View className="p-4 md:p-5 border-b border-slate-100">
                        <View className="flex-row flex-wrap justify-between items-start gap-2 mb-3">
                          <View className="flex-row items-center gap-2 flex-1">
                            <View className={`p-2 rounded-lg`} style={{ backgroundColor: `${planColor}15` }}>
                              <Crown size={isSmallScreen ? 14 : 18} color={planColor} />
                            </View>
                            <Text className="text-base md:text-lg font-bold text-slate-900 flex-1">{subscription.subName}</Text>
                          </View>
                          <Pressable 
                            onPress={() => toggleSubscriptionStatus(subscription)}
                            className={`px-2 py-1 rounded-full ${subscription.status ? 'bg-green-100' : 'bg-red-100'}`}
                            hitSlop={10}
                          >
                            <Text className={`text-xs font-medium ${subscription.status ? 'text-green-700' : 'text-red-700'}`}>
                              {subscription.status ? 'Active' : 'Inactive'}
                            </Text>
                          </Pressable>
                        </View>
                        <Text className="text-slate-600 text-xs md:text-sm leading-5">
                          {subscription.subDescription}
                        </Text>
                      </View>

                      {/* Price Section */}
                      <View className="p-4 md:p-5 bg-slate-50 border-b border-slate-100">
                        <View className="flex-row items-baseline flex-wrap gap-1 mb-2">
                          <Text className="text-2xl md:text-3xl font-bold text-slate-900">${subscription.price}</Text>
                          <Text className="text-slate-500 text-sm md:text-base">
                            / {durationText}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Calendar size={14} color="#64748b" />
                          <Text className="text-slate-500 text-xs">
                            {subscription.durationDays} days duration
                          </Text>
                        </View>
                      </View>

                      {/* Features Preview */}
                      <View className="p-4 md:p-5 gap-3">
                        <Text className="text-slate-700 font-semibold text-xs md:text-sm">What's included:</Text>
                        <View className="gap-2">
                          <View className="flex-row items-center gap-2">
                            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: planColor }} />
                            <Text className="text-slate-600 text-xs md:text-sm">Full access to all features</Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: planColor }} />
                            <Text className="text-slate-600 text-xs md:text-sm">AI-powered recovery tips</Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: planColor }} />
                            <Text className="text-slate-600 text-xs md:text-sm">Weekly trends & analytics</Text>
                          </View>
                          {subscription.durationDays === 365 && (
                            <View className="flex-row items-center gap-2">
                              <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: planColor }} />
                              <Text className="text-slate-600 text-xs md:text-sm">Priority support</Text>
                            </View>
                          )}
                          {subscription.durationDays === 30 && (
                            <View className="flex-row items-center gap-2">
                              <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: planColor }} />
                              <Text className="text-slate-600 text-xs md:text-sm">Monthly billing</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Subscription ID */}
                      <View className="px-4 md:px-5 pb-2">
                        <Text className="text-slate-400 text-xs">ID: {subscription.subId}</Text>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row p-3 md:p-4 gap-2 border-t border-slate-100">
                        <Pressable 
                          onPress={() => editSubscription(subscription)}
                          className="flex-1 flex-row items-center justify-center gap-2 py-2 md:py-2.5 bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={14} color="#3b82f6" />
                          <Text className="text-blue-700 text-xs md:text-sm font-medium">Edit</Text>
                        </Pressable>
                        <Pressable 
                          onPress={() => deleteSubscription(subscription.subId, subscription.subName)}
                          className="flex-1 flex-row items-center justify-center gap-2 py-2 md:py-2.5 bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} color="#ef4444" />
                          <Text className="text-red-700 text-xs md:text-sm font-medium">Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            /* Empty State */
            <View className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 items-center">
              <Crown size={48} color="#cbd5e1" />
              <Text className="text-slate-900 font-semibold text-lg mt-4">No Subscriptions Yet</Text>
              <Text className="text-slate-500 text-center text-sm mt-2 mb-6">
                Create your first subscription plan to start offering premium features
              </Text>
              <Pressable 
                onPress={() => setModalVisible(true)}
                className="bg-teal-600 px-6 py-3 rounded-xl flex-row items-center gap-2"
              >
                <Plus size={18} color="white" />
                <Text className="text-white font-medium">Create Your First Plan</Text>
              </Pressable>
            </View>
          )}

          {/* Footer Stats */}
          {subscriptions.length > 0 && (
            <View className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
              <View className="flex-row flex-wrap justify-between items-center gap-3">
                <View className="flex-1 min-w-[100px]">
                  <Text className="text-slate-500 text-xs md:text-sm">Total Plans Created</Text>
                  <Text className="text-xl md:text-2xl font-bold text-slate-900">{subscriptions.length}</Text>
                </View>
                <View className="w-px h-8 bg-slate-200" />
                <View className="flex-1 min-w-[100px]">
                  <Text className="text-slate-500 text-xs md:text-sm">Active Plans</Text>
                  <Text className="text-xl md:text-2xl font-bold text-green-600">{activeSubscriptions.length}</Text>
                </View>
                <View className="w-px h-8 bg-slate-200" />
                <View className="flex-1 min-w-[100px]">
                  <Text className="text-slate-500 text-xs md:text-sm">Price Range</Text>
                  <Text className="text-slate-900 font-semibold text-sm md:text-base">
                    {subscriptions.length > 0 ? `$${Math.min(...subscriptions.map(s => s.price))} - $${Math.max(...subscriptions.map(s => s.price))}` : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          fetchSubscriptions();
        }}
      />
    </>
  );
}