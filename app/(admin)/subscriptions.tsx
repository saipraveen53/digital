import { CheckCircle, Crown, Edit2, Plus, RefreshCw, ToggleLeft, ToggleRight, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, RefreshControl, ScrollView, Switch, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { rootApi } from '../utils/axiosInstance';

interface Subscription {
  subId: string;
  subName: string;
  subDescription: string;
  price: number;
  durationDays: number;
  status: boolean;
  // additional fields from API response (not used in UI)
  discountAmount?: number;
  finalPrice?: number;
}

// ─── ACTION SUCCESS MODAL ──────────────────────────────────────
function StatusSuccessModal({
  visible,
  message,
  onClose
}: {
  visible: boolean;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white p-6 rounded-2xl w-4/5 max-w-[300px] items-center gap-4 shadow-xl">
          <CheckCircle size={50} color="#10b981" />
          <Text className="text-base font-bold text-slate-900 text-center">{message}</Text>
          <Pressable className="bg-emerald-500 py-2.5 px-6 rounded-xl min-w-[100px] items-center" onPress={onClose}>
            <Text className="text-white font-semibold text-sm">OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── CREATE SUBSCRIPTION MODAL ──────────────────────────────────
function AddSubscriptionModal({
  visible,
  onClose,
  onSuccess
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [subName, setSubName] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [trialPlan, setTrialPlan] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!subName.trim() || !subDescription.trim() || !price.trim() || !durationDays.trim()) {
      setError('All fields except discount are required');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await rootApi.post('/api/admin/create/subscription', {
        subName: subName.trim(),
        subDescription: subDescription.trim(),
        price: Number(price),
        discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
        durationDays: Number(durationDays),
        trialPlan
      });
      onSuccess('Subscription created successfully');
      onClose();
      // reset form
      setSubName('');
      setSubDescription('');
      setPrice('');
      setDiscountPercentage('');
      setDurationDays('');
      setTrialPlan(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-[450px] max-h-[85%] overflow-hidden shadow-xl">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">Create Subscription Plan</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color="#64748b" />
            </Pressable>
          </View>
          <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
            {error ? <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4"><Text className="text-red-600 text-sm">{error}</Text></View> : null}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Plan Name *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm"
                value={subName}
                onChangeText={setSubName}
                editable={!isLoading}
              />
            </View>
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Description *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm min-h-[80px]"
                multiline
                numberOfLines={4}
                value={subDescription}
                onChangeText={setSubDescription}
                editable={!isLoading}
                textAlignVertical="top"
              />
            </View>
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Price ($) *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                editable={!isLoading}
              />
            </View>
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Discount (%)</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm"
                keyboardType="numeric"
                value={discountPercentage}
                onChangeText={setDiscountPercentage}
                editable={!isLoading}
                placeholder="0"
              />
            </View>
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Duration (Days) *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm"
                keyboardType="numeric"
                value={durationDays}
                onChangeText={setDurationDays}
                editable={!isLoading}
              />
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-slate-700 font-semibold text-sm">Trial Plan</Text>
              <Switch
                value={trialPlan}
                onValueChange={setTrialPlan}
                trackColor={{ false: '#cbd5e1', true: '#0d9488' }}
                thumbColor={trialPlan ? '#ffffff' : '#f4f4f4'}
                disabled={isLoading}
              />
            </View>
          </ScrollView>
          <View className="flex-row gap-3 px-5 py-4 border-t border-slate-100">
            <Pressable onPress={onClose} className="flex-1 py-3 rounded-xl items-center justify-center bg-slate-100 border border-slate-200" disabled={isLoading}>
              <Text className="text-slate-600 font-semibold">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleCreate} className="flex-1 py-3 rounded-xl items-center justify-center bg-teal-600" disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-semibold">Create Plan</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── UPDATE SUBSCRIPTION MODAL ──────────────────────────────────
function UpdateSubscriptionModal({
  visible,
  subscription,
  onClose,
  onSuccess
}: {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [subName, setSubName] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (subscription) {
      setSubName(subscription.subName);
      setSubDescription(subscription.subDescription);
      setPrice(subscription.price.toString());
      setDurationDays(subscription.durationDays.toString());
      // discountPercentage is not available from the current subscription object, leave empty
      setDiscountPercentage('');
    }
  }, [subscription, visible]);

  const handleUpdate = async () => {
    if (!subName.trim() || !subDescription.trim() || !price.trim() || !durationDays.trim()) {
      setError('All fields are required');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await rootApi.put('/api/admin/updateSubscription', {
        subName: subName.trim(),
        subDescription: subDescription.trim(),
        price: Number(price),
        discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
        durationDays: Number(durationDays)
      }, {
        params: { subId: subscription?.subId }
      });
      onSuccess('Subscription updated successfully');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-[450px] max-h-[85%] overflow-hidden shadow-xl">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">Update Subscription Plan</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color="#64748b" />
            </Pressable>
          </View>
          <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
            {error ? <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4"><Text className="text-red-600 text-sm">{error}</Text></View> : null}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Plan Name *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm"
                value={subName}
                onChangeText={setSubName}
                editable={!isLoading}
              />
            </View>
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Description *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm min-h-[80px]"
                multiline
                numberOfLines={4}
                value={subDescription}
                onChangeText={setSubDescription}
                editable={!isLoading}
                textAlignVertical="top"
              />
            </View>
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Price ($) *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                editable={!isLoading}
              />
            </View>
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Discount (%)</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm"
                keyboardType="numeric"
                value={discountPercentage}
                onChangeText={setDiscountPercentage}
                editable={!isLoading}
                placeholder="0"
              />
            </View>
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-1 text-sm">Duration (Days) *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm"
                keyboardType="numeric"
                value={durationDays}
                onChangeText={setDurationDays}
                editable={!isLoading}
              />
            </View>
          </ScrollView>
          <View className="flex-row gap-3 px-5 py-4 border-t border-slate-100">
            <Pressable onPress={onClose} className="flex-1 py-3 rounded-xl items-center justify-center bg-slate-100 border border-slate-200" disabled={isLoading}>
              <Text className="text-slate-600 font-semibold">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleUpdate} className="flex-1 py-3 rounded-xl items-center justify-center bg-teal-600" disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-semibold">Update Plan</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function Subscriptions() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activePlans, setActivePlans] = useState<Subscription[]>([]);
  const [inactivePlans, setInactivePlans] = useState<Subscription[]>([]);
  const [currentTab, setCurrentTab] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Success Modal
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Update Modal
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Subscription | null>(null);

  const { width } = useWindowDimensions();
  const isAndroid = Platform.OS === 'android';
  const isSmallScreen = width < 400;

  // Fetch subscriptions
  const fetchSubscriptionsData = async () => {
    try {
      setIsLoading(true);
      const [activeRes, inactiveRes] = await Promise.all([
        rootApi.get<Subscription[]>('/api/admin/getByStatus', { params: { status: true } }),
        rootApi.get<Subscription[]>('/api/admin/getByStatus', { params: { status: false } })
      ]);
      setActivePlans(activeRes.data || []);
      setInactivePlans(inactiveRes.data || []);
    } catch (error) {
      console.error('Error fetching subscription records:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Toggle status
  const handleStatusChange = async (subId: string, targetStatus: boolean) => {
    try {
      await rootApi.put('/api/admin/changeStatus', null, {
        params: { subId, status: targetStatus }
      });
      setSuccessMsg(targetStatus ? 'Activated' : 'Deactivated');
      setSuccessVisible(true);
      fetchSubscriptionsData();
    } catch (err) {
      Alert.alert('Status Error', 'Could not complete status toggle.');
    }
  };

  const triggerSuccessCallback = (message: string) => {
    setSuccessMsg(message);
    setSuccessVisible(true);
    fetchSubscriptionsData();
  };

  useEffect(() => {
    fetchSubscriptionsData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptionsData();
  };

  const displayList = currentTab === 'ACTIVE' ? activePlans : inactivePlans;
  const getPlanColor = (index: number) => {
    const colors = ['#0d9488', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6'];
    return colors[index % colors.length];
  };

  if (isLoading && !refreshing) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <View className="bg-white rounded-xl p-8 items-center shadow-sm border border-slate-200">
          <RefreshCw size={32} color="#0d9488" />
          <Text className="text-slate-600 mt-4">Loading configurations matrix...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-slate-50"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />}
        contentContainerStyle={{ paddingBottom: isAndroid ? 20 : 0 }}
      >
        <View className={isSmallScreen ? "p-3" : "p-4"}>
          {/* Header */}
          <View className="flex-row flex-wrap justify-between items-center gap-3 mb-6">
            <View className="flex-1">
              <Text className="text-xl md:text-2xl font-bold text-slate-900">Subscriptions</Text>
              <Text className="text-slate-600 text-sm mt-1">Manage standard and custom enterprise tiers</Text>
            </View>
            <Pressable onPress={() => setModalVisible(true)} className="bg-teal-600 px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-sm">
              <Plus size={16} color="white" />
              <Text className="text-white font-medium text-sm">Create Plan</Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View className="flex-row bg-slate-200 rounded-xl padding p-1 mb-6">
            <Pressable className={`flex-1 py-2.5 items-center rounded-lg ${currentTab === 'ACTIVE' ? 'bg-white shadow-sm' : ''}`} onPress={() => setCurrentTab('ACTIVE')}>
              <Text className={`font-semibold text-sm ${currentTab === 'ACTIVE' ? 'text-slate-900' : 'text-slate-500'}`}>Active ({activePlans.length})</Text>
            </Pressable>
            <Pressable className={`flex-1 py-2.5 items-center rounded-lg ${currentTab === 'INACTIVE' ? 'bg-white shadow-sm' : ''}`} onPress={() => setCurrentTab('INACTIVE')}>
              <Text className={`font-semibold text-sm ${currentTab === 'INACTIVE' ? 'text-slate-900' : 'text-slate-500'}`}>Inactive ({inactivePlans.length})</Text>
            </Pressable>
          </View>

          {/* Plan Cards */}
          {displayList.length > 0 ? (
            <View className="flex-row flex-wrap -mx-2">
              {displayList.map((subscription, index) => {
                const planColor = currentTab === 'ACTIVE' ? getPlanColor(index) : '#64748b';
                return (
                  <View key={subscription.subId} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <View className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <View className="h-1" style={{ backgroundColor: planColor }} />
                      <View className="p-4 md:p-5 border-b border-slate-100">
                        <View className="flex-row items-center gap-2 mb-2">
                          <Crown size={16} color={planColor} />
                          <Text className="text-base font-bold text-slate-900 flex-1">{subscription.subName}</Text>
                        </View>
                        <Text className="text-slate-600 text-xs md:text-sm leading-5">{subscription.subDescription}</Text>
                      </View>
                      <View className="p-4 md:p-5 bg-slate-50 border-b border-slate-100">
                        <Text className="text-2xl font-bold text-slate-900">₹{subscription.finalPrice?.toFixed(2) || subscription.price.toFixed(2)} <Text className="text-slate-500 text-sm font-normal">/ {subscription.discountAmount ? `${subscription.discountAmount.toFixed(2)} off` : 'No discount'}</Text></Text>
                          <Text className="text-slate-500 text-xs font-normal">/ {subscription.durationDays} days</Text>
                      </View>
                      <View className="px-5 py-2">
                        <Text className="text-slate-400 text-xs">ID: {subscription.subId}</Text>
                      </View>
                      {/* Actions */}
                      <View className="flex-row p-3 gap-2 border-t border-slate-100">
                        {currentTab === 'ACTIVE' ? (
                          <>
                            <Pressable onPress={() => handleStatusChange(subscription.subId, false)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-100 rounded-lg">
                              <ToggleLeft size={14} color="#ef4444" />
                              <Text className="text-red-700 text-xs font-semibold">Deactivate</Text>
                            </Pressable>
                            <Pressable onPress={() => { setSelectedPlan(subscription); setUpdateModalVisible(true); }} className="flex-1 flex-row items-center justify-center gap-1.5 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                              <Edit2 size={14} color="#0d9488" />
                              <Text className="text-teal-800 text-xs font-semibold">Update</Text>
                            </Pressable>
                          </>
                        ) : (
                          <Pressable onPress={() => handleStatusChange(subscription.subId, true)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2 bg-green-50 border border-green-100 rounded-lg">
                            <ToggleRight size={14} color="#22c55e" />
                            <Text className="text-green-700 text-xs font-semibold">Activate</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-white rounded-xl border border-slate-200 p-8 items-center">
              <Crown size={44} color="#cbd5e1" />
              <Text className="text-slate-900 font-semibold text-base mt-3">No plans in this category.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <AddSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={triggerSuccessCallback}
      />
      <UpdateSubscriptionModal
        visible={updateModalVisible}
        subscription={selectedPlan}
        onClose={() => { setUpdateModalVisible(false); setSelectedPlan(null); }}
        onSuccess={triggerSuccessCallback}
      />
      <StatusSuccessModal
        visible={successVisible}
        message={successMsg}
        onClose={() => setSuccessVisible(false)}
      />
    </>
  );
}