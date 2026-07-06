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
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions
} from 'react-native';
import { rootApi } from '../utils/axiosInstance';

// Types
interface BannerResponse {
    bannerId: string;
    name: string;
    description: string;
}

interface BannerRequest {
    name: string;
    description: string;
}

// ─── ADD BANNER MODAL ──────────────────────────────────────────
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
            setFormData({ name: '', description: '' });
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
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create New Banner</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <X size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Form */}
                    <ScrollView
                        style={styles.modalBody}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Banner Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Summer Sale 2026"
                                placeholderTextColor="#94a3b8"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
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

                        {/* Preview */}
                        <View style={styles.previewSection}>
                            <Text style={styles.label}>Preview</Text>
                            <View style={styles.previewBox}>
                                <Text style={styles.previewTitle}>
                                    {formData.name || 'Banner Title'}
                                </Text>
                                <Text style={styles.previewDesc}>
                                    {formData.description || 'Banner description will appear here'}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.modalFooter}>
                        <Pressable
                            onPress={onClose}
                            style={[styles.btn, styles.btnCancel]}
                            disabled={isLoading}
                        >
                            <Text style={styles.btnCancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            style={[styles.btn, styles.btnCreate]}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.btnCreateText}>Create</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── VIEW BANNER MODAL ──────────────────────────────────────────
function ViewBannerModal({
    visible,
    onClose,
    banner
}: {
    visible: boolean;
    onClose: () => void;
    banner: BannerResponse | null;
}) {
    if (!banner) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Banner Details</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <X size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    <View style={styles.modalBody}>
                        {/* Banner Preview */}
                        <View style={styles.detailPreviewBox}>
                            <Text style={styles.detailPreviewTitle}>{banner.name}</Text>
                            <Text style={styles.detailPreviewDesc}>{banner.description}</Text>
                        </View>

                        {/* Info */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Image size={18} color="#0d9488" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Banner ID</Text>
                                <Text style={styles.infoValue}>{banner.bannerId}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIcon, { backgroundColor: '#dbeafe' }]}>
                                <Calendar size={18} color="#3b82f6" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Created</Text>
                                <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
                            </View>
                        </View>

                        <Pressable onPress={onClose} style={styles.closeDetailBtn}>
                            <Text style={styles.closeDetailBtnText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function BannerManagement() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    const [searchQuery, setSearchQuery] = useState('');
    const [banners, setBanners] = useState<BannerResponse[]>([]);
    const [filteredBanners, setFilteredBanners] = useState<BannerResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<BannerResponse | null>(null);

    // Fetch all banners
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

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllBanners();
    };

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

    useEffect(() => {
        fetchAllBanners();
    }, []);

    // Stats
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

    // Responsive card width
    const cardWidth = isDesktop ? '33.33%' : (isTablet ? '50%' : '100%');
    const cardPadding = isDesktop ? 8 : (isTablet ? 8 : 0);

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingBox}>
                    <RefreshCw size={32} color="#0d9488" />
                    <Text style={styles.loadingText}>Loading banners...</Text>
                </View>
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
                }
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.wrapper, isMobile && styles.wrapperMobile]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle}>Banner Management</Text>
                            <Text style={styles.headerSubtitle}>Create and manage promotional banners</Text>
                        </View>
                        <Pressable
                            onPress={() => setModalVisible(true)}
                            style={styles.createBtn}
                        >
                            <Plus size={isMobile ? 16 : 18} color="white" />
                            <Text style={styles.createBtnText}>
                                {isMobile ? 'Create' : 'Create Banner'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Error */}
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                            <Pressable onPress={fetchAllBanners}>
                                <Text style={styles.errorRetry}>Try Again →</Text>
                            </Pressable>
                        </View>
                    ) : null}

                    {/* Stats */}
                    <View style={styles.statsGrid}>
                        {statsCards.map((stat, index) => (
                            <View key={index} style={styles.statItem}>
                                <View style={styles.statCard}>
                                    <View style={styles.statHeader}>
                                        <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                                            <stat.icon size={isMobile ? 16 : 20} color={stat.color} />
                                        </View>
                                        <Text style={styles.statChange}>{stat.change}</Text>
                                    </View>
                                    <Text style={styles.statTitle}>{stat.title}</Text>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statDesc}>{stat.description}</Text>
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
                        <Pressable style={styles.filterBtn}>
                            <Filter size={18} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Banners Grid */}
                    {filteredBanners.length > 0 ? (
                        <View style={styles.gridContainer}>
                            {filteredBanners.map((banner) => (
                                <View
                                    key={banner.bannerId}
                                    style={{
                                        width: cardWidth,
                                        paddingBottom: 16,
                                        paddingHorizontal: cardPadding,
                                    }}
                                >
                                    <View style={styles.card}>
                                        <Pressable
                                            onPress={() => {
                                                setSelectedBanner(banner);
                                                setViewModalVisible(true);
                                            }}
                                        >
                                            <View style={styles.cardPreview}>
                                                <Text style={styles.cardPreviewTitle}>{banner.name}</Text>
                                                <Text style={styles.cardPreviewDesc} numberOfLines={2}>
                                                    {banner.description}
                                                </Text>
                                            </View>
                                        </Pressable>

                                        <View style={styles.cardBody}>
                                            <View style={styles.cardMeta}>
                                                <View style={styles.cardMetaIcon}>
                                                    <Image size={14} color="#0d9488" />
                                                </View>
                                                <Text style={styles.cardMetaText}>
                                                    ID: {banner.bannerId.slice(0, 8)}...
                                                </Text>
                                            </View>

                                            <Text style={styles.cardDesc} numberOfLines={2}>
                                                {banner.description.length > 80
                                                    ? banner.description.substring(0, 80) + '...'
                                                    : banner.description}
                                            </Text>

                                            <Pressable
                                                onPress={() => {
                                                    setSelectedBanner(banner);
                                                    setViewModalVisible(true);
                                                }}
                                                style={styles.viewDetailsBtn}
                                            >
                                                <Eye size={14} color="#3b82f6" />
                                                <Text style={styles.viewDetailsBtnText}>View Details</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Image size={48} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No Banners Found</Text>
                            <Text style={styles.emptySub}>
                                {searchQuery ? 'No banners match your search criteria' : 'Create your first banner to promote your content'}
                            </Text>
                            {!searchQuery && (
                                <Pressable
                                    onPress={() => setModalVisible(true)}
                                    style={styles.emptyCreateBtn}
                                >
                                    <Plus size={18} color="white" />
                                    <Text style={styles.emptyCreateBtnText}>Create Your First Banner</Text>
                                </Pressable>
                            )}
                        </View>
                    )}

                    {/* API Info */}
                    {/*<View style={styles.apiInfo}>
                        <Text style={styles.apiInfoTitle}>📡 API Endpoints Implemented:</Text>
                        <View style={styles.apiInfoList}>
                            <Text style={styles.apiInfoItem}>✓ GET /api/banner/all - Fetch all banners</Text>
                            <Text style={styles.apiInfoItem}>✓ POST /api/banner/create - Create new banner</Text>
                        </View>
                        <Text style={styles.apiInfoNote}>
                            ℹ️ Note: Edit and Delete functionality requires additional backend endpoints (PUT/DELETE)
                        </Text>
                    </View>*/}
                </View>
            </ScrollView>

            {/* Modals */}
            <AddBannerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => fetchAllBanners()}
            />
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

// ─── STYLES ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // ── Global ──
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    wrapper: {
        padding: 16,
    },
    wrapperMobile: {
        padding: 12,
    },

    // ── Loading ──
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
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
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
    createBtn: {
        backgroundColor: '#0d9488',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    createBtnText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },

    // ── Error ──
    errorBox: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
    },
    errorRetry: {
        color: '#b91c1c',
        fontWeight: '600',
        marginTop: 4,
        fontSize: 14,
    },

    // ── Stats ──
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
        marginBottom: 16,
    },
    statItem: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
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
        fontSize: 12,
        fontWeight: '600',
        color: '#10b981',
    },
    statTitle: {
        color: '#64748b',
        fontSize: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 4,
    },
    statDesc: {
        color: '#94a3b8',
        fontSize: 11,
        marginTop: 4,
    },

    // ── Search ──
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

    // ── Grid ──
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
    cardPreview: {
        backgroundColor: '#0d9488',
        padding: 16,
        overflow: 'hidden',
        minHeight: 80,
        justifyContent: 'center',
    },
    cardPreviewTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    cardPreviewDesc: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
    },
    cardBody: {
        padding: 12,
        flex: 1,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    cardMetaIcon: {
        backgroundColor: '#f0fdf4',
        padding: 4,
        borderRadius: 6,
    },
    cardMetaText: {
        color: '#64748b',
        fontSize: 11,
    },
    cardDesc: {
        color: '#475569',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
        flex: 1,
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#eff6ff',
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 4,
    },
    viewDetailsBtnText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 13,
    },

    // ── Empty State ──
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
        marginBottom: 16,
        fontSize: 14,
    },
    emptyCreateBtn: {
        backgroundColor: '#0d9488',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    emptyCreateBtnText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },

    // ── API Info ──
    apiInfo: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        padding: 16,
        marginTop: 24,
        width: '100%',
    },
    apiInfoTitle: {
        color: '#1e40af',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    apiInfoList: {
        gap: 2,
    },
    apiInfoItem: {
        color: '#1d4ed8',
        fontSize: 12,
    },
    apiInfoNote: {
        color: '#2563eb',
        fontSize: 12,
        marginTop: 8,
    },

    // ── MODALS ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
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
    },
    modalBody: {
        padding: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnCancel: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    btnCancelText: {
        color: '#475569',
        fontWeight: '600',
    },
    btnCreate: {
        backgroundColor: '#0d9488',
    },
    btnCreateText: {
        color: 'white',
        fontWeight: '600',
    },

    // ── Form ──
    formGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#334155',
        fontWeight: '600',
        marginBottom: 4,
        fontSize: 14,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#0f172a',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    previewSection: {
        marginTop: 8,
    },
    previewBox: {
        backgroundColor: '#0d9488',
        borderRadius: 10,
        padding: 16,
        marginTop: 4,
        overflow: 'hidden',
    },
    previewTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    previewDesc: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
    },

    // ── View Detail ──
    detailPreviewBox: {
        backgroundColor: '#0d9488',
        borderRadius: 10,
        padding: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    detailPreviewTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 4,
    },
    detailPreviewDesc: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    infoIcon: {
        backgroundColor: '#f0fdf4',
        padding: 8,
        borderRadius: 8,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        color: '#94a3b8',
        fontSize: 11,
    },
    infoValue: {
        color: '#0f172a',
        fontWeight: '500',
        fontSize: 14,
    },
    closeDetailBtn: {
        backgroundColor: '#0d9488',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 8,
    },
    closeDetailBtnText: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
    },
});