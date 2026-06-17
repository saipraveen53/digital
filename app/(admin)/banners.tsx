// app/(admin)/banners.tsx
import {
    Calendar,
    Eye,
    Filter,
    Image,
    Plus,
    RefreshCw,
    Search,
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
interface BannerResponse {
    bannerId: string;
    name: string;
    description: string;
}

interface BannerRequest {
    name: string;
    description: string;
}

// Add Banner Modal Component
function AddBannerModal({
    visible,
    onClose,
    onSuccess
}: {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<BannerRequest>({
        name: '',
        description: '',
    });
    const [error, setError] = useState('');
    const { width } = useWindowDimensions();
    const isAndroid = Platform.OS === 'android';

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Please enter banner name');
            return;
        }
        if (!formData.description.trim()) {
            setError('Please enter banner description');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await rootApi.post<BannerResponse>('/api/banner/create', formData);
            Alert.alert('Success', 'Banner created successfully');
            
            setFormData({
                name: '',
                description: '',
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving banner:', error);
            setError(error.response?.data?.message || 'Failed to save banner. Please try again.');
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
                        <Text className="text-xl font-bold text-slate-900">Create New Banner</Text>
                        <Pressable onPress={onClose} className="p-1" hitSlop={10}>
                            <X size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Form */}
                    <ScrollView 
                        className="p-5" 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="gap-4">
                            {error ? (
                                <View className="bg-red-50 border border-red-200 rounded-xl p-3">
                                    <Text className="text-red-600 text-sm">{error}</Text>
                                </View>
                            ) : null}

                            <View>
                                <Text className="text-slate-700 font-semibold mb-2">Banner Name *</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="e.g., Summer Sale 2026"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    editable={!isLoading}
                                />
                            </View>

                            <View>
                                <Text className="text-slate-700 font-semibold mb-2">Description *</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
                                    placeholder="Describe the banner content..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Preview Section */}
                            <View className="mt-4">
                                <Text className="text-slate-700 font-semibold mb-2">Preview</Text>
                                <View className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 overflow-hidden">
                                    <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                                    <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                                    <Text className="text-white font-bold text-lg mb-2">
                                        {formData.name || 'Banner Title'}
                                    </Text>
                                    <Text className="text-white/90 text-sm">
                                        {formData.description || 'Banner description will appear here'}
                                    </Text>
                                </View>
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
                                <Text className="text-white font-medium text-center">Create</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// View Banner Details Modal
function ViewBannerModal({
    visible,
    onClose,
    banner
}: {
    visible: boolean;
    onClose: () => void;
    banner: BannerResponse | null;
}) {
    const isAndroid = Platform.OS === 'android';
    
    if (!banner) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ marginTop: isAndroid ? 40 : 0 }}>
                    <View className="p-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-slate-900">Banner Details</Text>
                            <Pressable onPress={onClose} className="p-1" hitSlop={10}>
                                <X size={20} color="#64748b" />
                            </Pressable>
                        </View>

                        {/* Banner Preview */}
                        <View className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 mb-6 overflow-hidden">
                            <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                            <Text className="text-white font-bold text-xl mb-3">{banner.name}</Text>
                            <Text className="text-white/90 text-base leading-5">{banner.description}</Text>
                        </View>

                        {/* Banner Info */}
                        <View className="gap-4">
                            <View className="flex-row items-center gap-3">
                                <View className="bg-teal-50 p-2 rounded-lg">
                                    <Image size={18} color="#0d9488" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-500 text-xs">Banner ID</Text>
                                    <Text className="text-slate-900 font-medium text-sm">{banner.bannerId}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-3">
                                <View className="bg-blue-50 p-2 rounded-lg">
                                    <Calendar size={18} color="#3b82f6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-500 text-xs">Created</Text>
                                    <Text className="text-slate-900 font-medium text-sm">{new Date().toLocaleDateString()}</Text>
                                </View>
                            </View>
                        </View>

                        <Pressable
                            onPress={onClose}
                            className="mt-6 py-3 rounded-xl bg-teal-600"
                        >
                            <Text className="text-white font-medium text-center">Close</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default function BannerManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [banners, setBanners] = useState<BannerResponse[]>([]);
    const [filteredBanners, setFilteredBanners] = useState<BannerResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<BannerResponse | null>(null);
    const { width } = useWindowDimensions();
    const isAndroid = Platform.OS === 'android';
    const isSmallScreen = width < 400;

    // Fetch all banners using GET /api/banner/all
    const fetchAllBanners = async () => {
        try {
            setError('');
            const response = await rootApi.get<BannerResponse[]>('/api/banner/all');
            setBanners(response.data);
            setFilteredBanners(response.data);
        } catch (error: any) {
            console.error('Error fetching banners:', error);
            setError(error.response?.data?.message || 'Failed to fetch banners');
            setBanners([]);
            setFilteredBanners([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Handle refresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchAllBanners();
    };

    // Handle search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBanners(banners);
        } else {
            const filtered = banners.filter(banner => 
                banner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                banner.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBanners(filtered);
        }
    }, [searchQuery, banners]);

    // Initial load
    useEffect(() => {
        fetchAllBanners();
    }, []);

    // Calculate stats based on fetched data
    const totalBanners = banners.length;
    const avgDescriptionLength = banners.length > 0 
        ? Math.round(banners.reduce((sum, b) => sum + b.description.length, 0) / banners.length) 
        : 0;

    const statsCards = [
        {
            title: 'Total Banners',
            value: totalBanners.toString(),
            icon: Image,
            change: `+${totalBanners}`,
            color: '#0d9488',
            bgColor: '#ccfbf1',
            description: 'Total banners'
        },
        {
            title: 'Avg. Length',
            value: `${avgDescriptionLength}`,
            icon: Eye,
            change: 'chars',
            color: '#8b5cf6',
            bgColor: '#f3e8ff',
            description: 'Average description'
        },
        {
            title: 'Active Banners',
            value: totalBanners.toString(),
            icon: Eye,
            change: 'Active',
            color: '#10b981',
            bgColor: '#d1fae5',
            description: 'All banners active'
        },
        {
            title: 'Impressions',
            value: '0',
            icon: Eye,
            change: 'Coming soon',
            color: '#3b82f6',
            bgColor: '#dbeafe',
            description: 'Analytics coming'
        },
    ];

    if (isLoading && !refreshing) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <View className="bg-white rounded-xl p-8 items-center shadow-sm border border-slate-200">
                    <RefreshCw size={32} color="#0d9488" className="animate-spin" />
                    <Text className="text-slate-600 mt-4">Loading banners...</Text>
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
                            <Text className="text-xl md:text-2xl font-bold text-slate-900">Banner Management</Text>
                            <Text className="text-slate-600 text-sm mt-1">Create and manage promotional banners</Text>
                        </View>
                        <Pressable 
                            onPress={() => setModalVisible(true)}
                            className="bg-teal-600 px-3 md:px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-sm"
                            style={{ minWidth: isSmallScreen ? 'auto' : undefined }}
                        >
                            <Plus size={isSmallScreen ? 16 : 18} color="white" />
                            <Text className="text-white font-medium text-sm md:text-base">
                                {isSmallScreen ? 'Create' : 'Create Banner'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <Text className="text-red-600 text-sm">{error}</Text>
                            <Pressable onPress={fetchAllBanners} className="mt-2">
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

                    {/* Search Bar */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-3 flex-row items-center gap-2">
                            <Search size={18} color="#94a3b8" />
                            <TextInput
                                className="flex-1 text-slate-700 text-sm md:text-base"
                                placeholder="Search banners by name or description..."
                                placeholderTextColor="#94a3b8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
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

                    {/* Banners Grid */}
                    {filteredBanners.length > 0 ? (
                        <View className="flex-row flex-wrap -mx-2">
                            {filteredBanners.map((banner) => (
                                <View key={banner.bannerId} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                                    <View className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                        {/* Banner Preview */}
                                        <Pressable 
                                            onPress={() => {
                                                setSelectedBanner(banner);
                                                setViewModalVisible(true);
                                            }}
                                        >
                                            <View className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 md:p-5 overflow-hidden">
                                                <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                                                <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                                                <Text className="text-white font-bold text-base md:text-lg mb-2">{banner.name}</Text>
                                                <Text className="text-white/90 text-xs md:text-sm line-clamp-2">{banner.description}</Text>
                                            </View>
                                        </Pressable>

                                        {/* Banner Details */}
                                        <View className="p-3 md:p-4">
                                            <View className="flex-row items-center gap-2 mb-3">
                                                <View className="bg-teal-50 p-1.5 rounded-lg">
                                                    <Image size={14} color="#0d9488" />
                                                </View>
                                                <Text className="text-slate-500 text-xs">
                                                    ID: {banner.bannerId.slice(0, 8)}...
                                                </Text>
                                            </View>

                                            <Text className="text-slate-600 text-xs md:text-sm leading-5 mb-4">
                                                {banner.description.length > 80 
                                                    ? banner.description.substring(0, 80) + '...' 
                                                    : banner.description}
                                            </Text>

                                            {/* Action Buttons */}
                                            <View className="flex-row gap-2">
                                                <Pressable 
                                                    onPress={() => {
                                                        setSelectedBanner(banner);
                                                        setViewModalVisible(true);
                                                    }}
                                                    className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-blue-50 rounded-lg"
                                                >
                                                    <Eye size={14} color="#3b82f6" />
                                                    <Text className="text-blue-700 text-xs md:text-sm font-medium">View Details</Text>
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
                            <Image size={48} color="#cbd5e1" />
                            <Text className="text-slate-900 font-semibold text-lg mt-4">No Banners Found</Text>
                            <Text className="text-slate-500 text-center text-sm mt-2 mb-6">
                                {searchQuery ? 'No banners match your search criteria' : 'Create your first banner to promote your content'}
                            </Text>
                            {!searchQuery && (
                                <Pressable 
                                    onPress={() => setModalVisible(true)}
                                    className="bg-teal-600 px-6 py-3 rounded-xl flex-row items-center gap-2"
                                >
                                    <Plus size={18} color="white" />
                                    <Text className="text-white font-medium">Create Your First Banner</Text>
                                </Pressable>
                            )}
                        </View>
                    )}

                    {/* API Endpoint Documentation */}
                    <View className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <Text className="text-blue-800 font-semibold mb-2 text-sm md:text-base">📡 API Endpoints Implemented:</Text>
                        <View className="gap-1">
                            <Text className="text-blue-700 text-xs">✓ GET /api/banner/all - Fetch all banners</Text>
                            <Text className="text-blue-700 text-xs">✓ POST /api/banner/create - Create new banner</Text>
                        </View>
                        <Text className="text-blue-600 text-xs mt-2">
                            ℹ️ Note: Edit and Delete functionality requires additional backend endpoints (PUT/DELETE)
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Add Banner Modal */}
            <AddBannerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    fetchAllBanners();
                }}
            />

            {/* View Banner Modal */}
            <ViewBannerModal
                visible={viewModalVisible}
                onClose={() => {
                    setViewModalVisible(false);
                    setSelectedBanner(null);
                }}
                banner={selectedBanner}
            />
        </>
    );
}