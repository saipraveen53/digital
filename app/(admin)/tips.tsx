// app/(admin)/tips.tsx
import {
    Award,
    Bookmark,
    Clock,
    Edit2,
    Eye,
    Filter,
    Plus,
    RefreshCw,
    Search,
    Sparkles,
    Trash2,
    Users,
    X
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
    useWindowDimensions
} from 'react-native';
import { rootApi } from '../utils/axiosInstance';

// Types based on Swagger
interface TipsResponseDto {
    tipId: string;
    tipName: string;
    tipDescription: string;
    status: boolean;
    tipScore: number;
}

interface TipsRequestDto {
    tipName: string;
    tipDescription: string;
    status: boolean;
    tipScore: number;
}

// Add/Edit Tip Modal Component
function TipModal({ 
    visible, 
    onClose, 
    onSuccess, 
    tip,
    isEditing 
}: { 
    visible: boolean; 
    onClose: () => void; 
    onSuccess: () => void;
    tip?: TipsResponseDto;
    isEditing: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<TipsRequestDto>({
        tipName: '',
        tipDescription: '',
        status: true,
        tipScore: 10,
    });
    const [error, setError] = useState('');
    const { width } = useWindowDimensions();
    const isAndroid = Platform.OS === 'android';
    const isSmallScreen = width < 400;

    useEffect(() => {
        if (tip && isEditing) {
            setFormData({
                tipName: tip.tipName,
                tipDescription: tip.tipDescription,
                status: tip.status,
                tipScore: tip.tipScore,
            });
        } else {
            setFormData({
                tipName: '',
                tipDescription: '',
                status: true,
                tipScore: 10,
            });
        }
    }, [tip, isEditing, visible]);

    const handleSubmit = async () => {
        if (!formData.tipName.trim()) {
            setError('Please enter tip name');
            return;
        }
        if (!formData.tipDescription.trim()) {
            setError('Please enter tip description');
            return;
        }
        if (formData.tipScore < 1 || formData.tipScore > 100) {
            setError('Tip score must be between 1 and 100');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            if (isEditing && tip) {
                await rootApi.put<TipsResponseDto>(`/api/tips/${tip.tipId}`, formData);
                Alert.alert('Success', 'Tip updated successfully');
            } else {
                await rootApi.post<TipsResponseDto>('/api/tips/createTip', formData);
                Alert.alert('Success', 'Tip created successfully');
            }
            
            setFormData({
                tipName: '',
                tipDescription: '',
                status: true,
                tipScore: 10,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving tip:', error);
            setError(error.response?.data?.message || 'Failed to save tip. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ marginTop: isAndroid ? 40 : 0 }}>
                    {/* Header */}
                    <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
                        <Text className="text-xl font-bold text-slate-900">
                            {isEditing ? 'Edit Tip' : 'Create New Tip'}
                        </Text>
                        <Pressable onPress={onClose} className="p-1" hitSlop={10}>
                            <X size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Form */}
                    <ScrollView className="p-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View className="gap-4">
                            {error ? (
                                <View className="bg-red-50 border border-red-200 rounded-xl p-3">
                                    <Text className="text-red-600 text-sm">{error}</Text>
                                </View>
                            ) : null}

                            <View>
                                <Text className="text-slate-700 font-semibold mb-2">Tip Name *</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="e.g., Take Regular Breaks"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.tipName}
                                    onChangeText={(text) => setFormData({ ...formData, tipName: text })}
                                    editable={!isLoading}
                                />
                            </View>

                            <View>
                                <Text className="text-slate-700 font-semibold mb-2">Description *</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="Describe the tip in detail..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={formData.tipDescription}
                                    onChangeText={(text) => setFormData({ ...formData, tipDescription: text })}
                                    editable={!isLoading}
                                />
                            </View>

                            <View>
                                <Text className="text-slate-700 font-semibold mb-2">Score Impact (1-100) *</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="e.g., 10"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={formData.tipScore.toString()}
                                    onChangeText={(text) => {
                                        const num = parseInt(text) || 0;
                                        setFormData({ ...formData, tipScore: Math.min(100, Math.max(1, num)) });
                                    }}
                                    editable={!isLoading}
                                />
                                <Text className="text-slate-400 text-xs mt-1">
                                    How many points this tip adds to user's wellbeing score
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text className="text-slate-700 font-semibold">Status</Text>
                                <Pressable
                                    onPress={() => setFormData({ ...formData, status: !formData.status })}
                                    className={`px-4 py-2 rounded-full ${formData.status ? 'bg-green-100' : 'bg-red-100'}`}
                                >
                                    <Text className={formData.status ? 'text-green-700' : 'text-red-700'}>
                                        {formData.status ? 'Active' : 'Inactive'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View className="flex-row gap-3 p-5 border-t border-slate-100">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200"
                            disabled={isLoading}
                        >
                            <Text className="text-slate-700 font-medium text-center">Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            className="flex-1 py-3 rounded-xl bg-teal-600"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-medium text-center">
                                    {isEditing ? 'Update' : 'Create'}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ 
    visible, 
    onClose, 
    onConfirm, 
    tipName 
}: { 
    visible: boolean; 
    onClose: () => void; 
    onConfirm: () => void;
    tipName: string;
}) {
    const isAndroid = Platform.OS === 'android';
    
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" style={{ marginTop: isAndroid ? 40 : 0 }}>
                    <View className="p-6">
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                                <Trash2 size={32} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-slate-900 text-center mb-2">
                                Delete Tip
                            </Text>
                            <Text className="text-slate-600 text-center">
                                Are you sure you want to delete "{tipName}"? This action cannot be undone.
                            </Text>
                        </View>
                        
                        <View className="flex-row gap-3 mt-4">
                            <Pressable
                                onPress={onClose}
                                className="flex-1 py-3 rounded-xl border border-slate-200"
                            >
                                <Text className="text-slate-700 font-medium text-center">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={onConfirm}
                                className="flex-1 py-3 rounded-xl bg-red-600"
                            >
                                <Text className="text-white font-medium text-center">Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default function TipsManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [tips, setTips] = useState<TipsResponseDto[]>([]);
    const [filteredTips, setFilteredTips] = useState<TipsResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editingTip, setEditingTip] = useState<TipsResponseDto | undefined>();
    const [isEditing, setIsEditing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const { width } = useWindowDimensions();
    const isAndroid = Platform.OS === 'android';
    const isSmallScreen = width < 400;

    // Fetch all tips
    const fetchAllTips = async () => {
        try {
            setError('');
            const response = await rootApi.get<TipsResponseDto[]>('/api/tips/getAll');
            setTips(response.data);
            setFilteredTips(response.data);
        } catch (error: any) {
            console.error('Error fetching tips:', error);
            setError(error.response?.data?.message || 'Failed to fetch tips');
            setTips([]);
            setFilteredTips([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch active tips only
    const fetchActiveTips = async () => {
        try {
            setError('');
            const response = await rootApi.get<TipsResponseDto[]>('/api/tips/active');
            setTips(response.data);
            setFilteredTips(response.data);
        } catch (error: any) {
            console.error('Error fetching active tips:', error);
            setError(error.response?.data?.message || 'Failed to fetch active tips');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch inactive tips only
    const fetchInactiveTips = async () => {
        try {
            setError('');
            const response = await rootApi.get<TipsResponseDto[]>('/api/tips/inactive');
            setTips(response.data);
            setFilteredTips(response.data);
        } catch (error: any) {
            console.error('Error fetching inactive tips:', error);
            setError(error.response?.data?.message || 'Failed to fetch inactive tips');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Delete tip
    const deleteTip = async () => {
        if (!editingTip) return;
        
        try {
            await rootApi.delete(`/api/tips/${editingTip.tipId}`);
            Alert.alert('Success', 'Tip deleted successfully');
            setDeleteModalVisible(false);
            fetchAllTips();
        } catch (error: any) {
            console.error('Error deleting tip:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete tip');
        }
    };

    // Handle refresh
    const onRefresh = () => {
        setRefreshing(true);
        if (filterStatus === 'active') {
            fetchActiveTips();
        } else if (filterStatus === 'inactive') {
            fetchInactiveTips();
        } else {
            fetchAllTips();
        }
    };

    // Handle filter change
    const handleFilterChange = (status: 'all' | 'active' | 'inactive') => {
        setFilterStatus(status);
        setIsLoading(true);
        if (status === 'active') {
            fetchActiveTips();
        } else if (status === 'inactive') {
            fetchInactiveTips();
        } else {
            fetchAllTips();
        }
    };

    // Handle search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredTips(tips);
        } else {
            const filtered = tips.filter(tip => 
                tip.tipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tip.tipDescription.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTips(filtered);
        }
    }, [searchQuery, tips]);

    // Initial load
    useEffect(() => {
        fetchAllTips();
    }, []);

    // Calculate stats
    const activeCount = tips.filter(t => t.status === true).length;
    const inactiveCount = tips.filter(t => t.status === false).length;
    const totalScore = tips.reduce((sum, tip) => sum + tip.tipScore, 0);
    const avgScore = tips.length > 0 ? (totalScore / tips.length).toFixed(1) : 0;

    const statsCards = [
        {
            title: 'Total Tips',
            value: tips.length.toString(),
            icon: Sparkles,
            change: `+${tips.length}`,
            color: '#8b5cf6',
            bgColor: '#f3e8ff',
            description: 'All tips in library'
        },
        {
            title: 'Active Tips',
            value: activeCount.toString(),
            icon: Award,
            change: activeCount > 0 ? 'Active' : 'None',
            color: '#10b981',
            bgColor: '#d1fae5',
            description: 'Currently published'
        },
        {
            title: 'Inactive Tips',
            value: inactiveCount.toString(),
            icon: Bookmark,
            change: 'Draft',
            color: '#f59e0b',
            bgColor: '#fef3c7',
            description: 'Not published'
        },
        {
            title: 'Avg. Score Impact',
            value: avgScore.toString(),
            icon: Users,
            change: 'Points',
            color: '#0d9488',
            bgColor: '#ccfbf1',
            description: 'Average wellbeing points'
        },
    ];

    if (isLoading && !refreshing) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <View className="bg-white rounded-xl p-8 items-center shadow-sm border border-slate-200">
                    <RefreshCw size={32} color="#0d9488" />
                    <Text className="text-slate-600 mt-4">Loading tips...</Text>
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
                    {/* Header */}
                    <View className="flex-row flex-wrap justify-between items-center gap-3 mb-6">
                        <View className="flex-1">
                            <Text className="text-xl md:text-2xl font-bold text-slate-900">AI Tips Management</Text>
                            <Text className="text-slate-600 text-sm mt-1">Manage and optimize recovery tips</Text>
                        </View>
                        <Pressable 
                            onPress={() => {
                                setEditingTip(undefined);
                                setIsEditing(false);
                                setModalVisible(true);
                            }}
                            className="bg-teal-600 px-3 md:px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-sm"
                        >
                            <Plus size={isSmallScreen ? 16 : 18} color="white" />
                            <Text className="text-white font-medium text-sm md:text-base">
                                {isSmallScreen ? 'Create' : 'Create Tip'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <Text className="text-red-600 text-sm">{error}</Text>
                            <Pressable onPress={onRefresh} className="mt-2">
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

                    {/* Filter Tabs */}
                    <View className="flex-row gap-2 mb-6">
                        <Pressable 
                            onPress={() => handleFilterChange('all')}
                            className={`flex-1 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-teal-600' : 'bg-white border border-slate-200'}`}
                        >
                            <Text className={`text-center font-medium text-sm md:text-base ${filterStatus === 'all' ? 'text-white' : 'text-slate-700'}`}>
                                All Tips ({tips.length})
                            </Text>
                        </Pressable>
                        <Pressable 
                            onPress={() => handleFilterChange('active')}
                            className={`flex-1 py-2 rounded-lg ${filterStatus === 'active' ? 'bg-teal-600' : 'bg-white border border-slate-200'}`}
                        >
                            <Text className={`text-center font-medium text-sm md:text-base ${filterStatus === 'active' ? 'text-white' : 'text-slate-700'}`}>
                                Active ({activeCount})
                            </Text>
                        </Pressable>
                        <Pressable 
                            onPress={() => handleFilterChange('inactive')}
                            className={`flex-1 py-2 rounded-lg ${filterStatus === 'inactive' ? 'bg-teal-600' : 'bg-white border border-slate-200'}`}
                        >
                            <Text className={`text-center font-medium text-sm md:text-base ${filterStatus === 'inactive' ? 'text-white' : 'text-slate-700'}`}>
                                Inactive ({inactiveCount})
                            </Text>
                        </Pressable>
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-3 flex-row items-center gap-2">
                            <Search size={18} color="#94a3b8" />
                            <TextInput
                                className="flex-1 text-slate-700 text-sm md:text-base"
                                placeholder="Search tips by name or description..."
                                placeholderTextColor="#94a3b8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                                autoCapitalize="none"
                            />
                            {searchQuery ? (
                                <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                                    <X size={16} color="#94a3b8" />
                                </Pressable>
                            ) : null}
                        </View>
                        <Pressable className="bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-3 items-center justify-center">
                            <Filter size={18} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Tips Bento Grid */}
                    {filteredTips.length > 0 ? (
                        <View className="flex-row flex-wrap -mx-2">
                            {filteredTips.map((tip) => (
                                <View key={tip.tipId} className="w-full md:w-1/2 px-2 mb-4">
                                    <View className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                        {/* Status Bar */}
                                        <View className={`h-1 ${tip.status ? 'bg-green-500' : 'bg-red-500'}`} />
                                        
                                        {/* Tip Header */}
                                        <View className="p-4 border-b border-slate-100">
                                            <View className="flex-row justify-between items-start mb-3">
                                                <View className="flex-row items-center gap-2">
                                                    <View className={`p-2 rounded-lg ${tip.status ? 'bg-purple-50' : 'bg-slate-100'}`}>
                                                        <Sparkles size={16} color={tip.status ? '#8b5cf6' : '#94a3b8'} />
                                                    </View>
                                                    <Text className={`font-semibold text-sm ${tip.status ? 'text-purple-700' : 'text-slate-500'}`}>
                                                        {tip.status ? 'Published' : 'Draft'}
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center gap-1">
                                                    <Eye size={14} color="#94a3b8" />
                                                    <Text className="text-slate-500 text-xs">Score: {tip.tipScore}</Text>
                                                </View>
                                            </View>
                                            <Text className="text-slate-900 font-semibold text-base md:text-lg mb-2">{tip.tipName}</Text>
                                            <Text className="text-slate-600 text-xs md:text-sm leading-5">{tip.tipDescription}</Text>
                                        </View>

                                        {/* Meta Info & Actions */}
                                        <View className="flex-row justify-between items-center p-4 bg-slate-50 border-t border-slate-100">
                                            <View className="flex-row items-center gap-2">
                                                <Clock size={12} color="#94a3b8" />
                                                <Text className="text-slate-500 text-xs">ID: {tip.tipId.slice(0, 8)}...</Text>
                                            </View>
                                            <View className="flex-row gap-2">
                                                <Pressable 
                                                    onPress={() => {
                                                        setEditingTip(tip);
                                                        setIsEditing(true);
                                                        setModalVisible(true);
                                                    }}
                                                    className="bg-blue-50 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
                                                >
                                                    <Edit2 size={12} color="#3b82f6" />
                                                    <Text className="text-blue-700 text-xs font-medium">Edit</Text>
                                                </Pressable>
                                                <Pressable 
                                                    onPress={() => {
                                                        setEditingTip(tip);
                                                        setDeleteModalVisible(true);
                                                    }}
                                                    className="bg-red-50 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
                                                >
                                                    <Trash2 size={12} color="#ef4444" />
                                                    <Text className="text-red-700 text-xs font-medium">Delete</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        /* Empty State */
                        <View className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 items-center">
                            <Sparkles size={48} color="#cbd5e1" />
                            <Text className="text-slate-900 font-semibold text-lg mt-4">No Tips Found</Text>
                            <Text className="text-slate-500 text-center text-sm mt-2 mb-6">
                                {searchQuery ? 'No tips match your search criteria' : 'Create your first tip to help users improve their wellbeing'}
                            </Text>
                            {!searchQuery && (
                                <Pressable 
                                    onPress={() => {
                                        setEditingTip(undefined);
                                        setIsEditing(false);
                                        setModalVisible(true);
                                    }}
                                    className="bg-teal-600 px-6 py-3 rounded-xl flex-row items-center gap-2"
                                >
                                    <Plus size={18} color="white" />
                                    <Text className="text-white font-medium">Create Your First Tip</Text>
                                </Pressable>
                            )}
                        </View>
                    )}

                    {/* Footer Stats */}
                    {filteredTips.length > 0 && (
                        <View className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
                            <View className="flex-row flex-wrap justify-between items-center gap-3">
                                <View className="flex-1 min-w-[100px]">
                                    <Text className="text-slate-500 text-xs md:text-sm">Total Tips</Text>
                                    <Text className="text-xl md:text-2xl font-bold text-slate-900">{tips.length}</Text>
                                </View>
                                <View className="w-px h-8 bg-slate-200" />
                                <View className="flex-1 min-w-[100px]">
                                    <Text className="text-slate-500 text-xs md:text-sm">Active Rate</Text>
                                    <Text className="text-xl md:text-2xl font-bold text-green-600">
                                        {tips.length > 0 ? ((activeCount / tips.length) * 100).toFixed(0) : 0}%
                                    </Text>
                                </View>
                                <View className="w-px h-8 bg-slate-200" />
                                <View className="flex-1 min-w-[100px]">
                                    <Text className="text-slate-500 text-xs md:text-sm">Score Range</Text>
                                    <Text className="text-slate-900 font-semibold text-sm md:text-base">
                                        {tips.length > 0 ? `${Math.min(...tips.map(t => t.tipScore))} - ${Math.max(...tips.map(t => t.tipScore))}` : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Add/Edit Tip Modal */}
            <TipModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingTip(undefined);
                    setIsEditing(false);
                }}
                onSuccess={() => {
                    if (filterStatus === 'active') {
                        fetchActiveTips();
                    } else if (filterStatus === 'inactive') {
                        fetchInactiveTips();
                    } else {
                        fetchAllTips();
                    }
                }}
                tip={editingTip}
                isEditing={isEditing}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                visible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false);
                    setEditingTip(undefined);
                }}
                onConfirm={deleteTip}
                tipName={editingTip?.tipName || ''}
            />
        </>
    );
}