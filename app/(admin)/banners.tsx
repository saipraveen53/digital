import {
    CheckCircle,
    Edit2,
    Image as ImageIcon,
    Plus,
    RefreshCw,
    Search,
    ToggleLeft,
    ToggleRight,
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
            <View style={styles.modalOverlay}>
                <View style={styles.successModalContainer}>
                    <CheckCircle size={50} color="#10b981" />
                    <Text style={styles.successModalText}>{message}</Text>
                    <Pressable style={styles.successModalBtn} onPress={onClose}>
                        <Text style={styles.successModalBtnText}>OK</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

// ─── UPDATE BANNER MODAL ────────────────────────────────────────
function UpdateBannerModal({
    visible,
    banner,
    onClose,
    onSuccess
}: {
    visible: boolean;
    banner: BannerResponse | null;
    onClose: () => void;
    onSuccess: (msg: string) => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (banner) {
            setName(banner.name);
            setDescription(banner.description);
        }
    }, [banner, visible]);

    const handleUpdate = async () => {
        if (!name.trim() || !description.trim()) {
            setError('All fields are required');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await rootApi.put(`/api/banner/update`, {
                name: name.trim(),
                description: description.trim()
            }, {
                params: { bannerId: banner?.bannerId }
            });
            onSuccess('Banner updated successfully');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update banner');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Update Banner</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <X size={20} color="#64748b" />
                        </Pressable>
                    </View>
                    <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Banner Name *</Text>
                            <TextInput style={styles.input} value={name} onChangeText={setName} editable={!isLoading} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description *</Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={description} onChangeText={setDescription} editable={!isLoading} />
                        </View>
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <Pressable onPress={onClose} style={[styles.btn, styles.btnCancel]} disabled={isLoading}>
                            <Text style={styles.btnCancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable onPress={handleUpdate} style={[styles.btn, styles.btnCreate]} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnCreateText}>Update</Text>}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
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
    const [formData, setFormData] = useState<BannerRequest>({ name: '', description: '' });
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await rootApi.post<BannerResponse>('/api/banner/create', formData);
            setFormData({ name: '', description: '' });
            onSuccess();
            onClose();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to save banner.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create New Banner</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <X size={20} color="#64748b" />
                        </Pressable>
                    </View>
                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Banner Name *</Text>
                            <TextInput style={styles.input} placeholder="e.g., Summer Sale 2026" placeholderTextColor="#94a3b8" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} editable={!isLoading} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description *</Text>
                            <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the banner content..." placeholderTextColor="#94a3b8" multiline numberOfLines={4} textAlignVertical="top" value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} editable={!isLoading} />
                        </View>
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <Pressable onPress={onClose} style={[styles.btn, styles.btnCancel]} disabled={isLoading}>
                            <Text style={styles.btnCancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable onPress={handleSubmit} style={[styles.btn, styles.btnCreate]} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnCreateText}>Create</Text>}
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
    const [activeBanners, setActiveBanners] = useState<BannerResponse[]>([]);
    const [inactiveBanners, setInactiveBanners] = useState<BannerResponse[]>([]);
    const [currentTab, setCurrentTab] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
    const [filteredBanners, setFilteredBanners] = useState<BannerResponse[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Success Modal Configurations
    const [successVisible, setSuccessVisible] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Modals visibility triggers
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<BannerResponse | null>(null);

    // Fetch banners by status endpoint context pipeline
    const fetchBannersData = async () => {
        try {
            setIsLoading(true);
            const [activeRes, inactiveRes] = await Promise.all([
                rootApi.get<BannerResponse[]>('/api/banner/getByStatus', { params: { status: true } }),
                rootApi.get<BannerResponse[]>('/api/banner/getByStatus', { params: { status: false } })
            ]);
            setActiveBanners(activeRes.data || []);
            setInactiveBanners(inactiveRes.data || []);
        } catch (error) {
            console.error('Error loading banners dynamic context:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Toggle status pipeline trigger
    const handleStatusChange = async (bannerId: string, targetStatus: boolean) => {
        try {
            await rootApi.put('/api/banner/changeStatus', null, {
                params: { bannerId, status: targetStatus }
            });
            setSuccessMsg(targetStatus ? 'Activated' : 'Deactivated');
            setSuccessVisible(true);
            fetchBannersData();
        } catch (err) {
            Alert.alert('Status Error', 'Could not update banner lifecycle mapping state.');
        }
    };

    const triggerSuccessCallback = (message: string) => {
        setSuccessMsg(message);
        setSuccessVisible(true);
        fetchBannersData();
    };

    useEffect(() => {
        fetchBannersData();
    }, []);

    useEffect(() => {
        const sourceList = currentTab === 'ACTIVE' ? activeBanners : inactiveBanners;
        if (searchQuery.trim() === '') {
            setFilteredBanners(sourceList);
        } else {
            const filtered = sourceList.filter(b =>
                b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBanners(filtered);
        }
    }, [searchQuery, activeBanners, inactiveBanners, currentTab]);

    const cardWidth = isDesktop ? '33.33%' : (isTablet ? '50%' : '100%');
    const cardPadding = isDesktop ? 8 : (isTablet ? 8 : 0);

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingBox}>
                    <RefreshCw size={32} color="#0d9488" />
                    <Text style={styles.loadingText}>Loading banners content setup...</Text>
                </View>
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBannersData(); }} colors={['#0d9488']} />}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.wrapper, isMobile && styles.wrapperMobile]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle}>Banner Management</Text>
                            <Text style={styles.headerSubtitle}>View, filter, update or toggle active state promotions</Text>
                        </View>
                        <Pressable onPress={() => setCreateModalVisible(true)} style={styles.createBtn}>
                            <Plus size={16} color="white" />
                            <Text style={styles.createBtnText}>Create Banner</Text>
                        </Pressable>
                    </View>

                    {/* Mode/Status Tabs Controller View */}
                    <View style={styles.tabContainer}>
                        <Pressable style={[styles.tabButton, currentTab === 'ACTIVE' && styles.tabButtonActive]} onPress={() => setCurrentTab('ACTIVE')}>
                            <Text style={[styles.tabButtonText, currentTab === 'ACTIVE' && styles.tabButtonTextActive]}>Active ({activeBanners.length})</Text>
                        </Pressable>
                        <Pressable style={[styles.tabButton, currentTab === 'INACTIVE' && styles.tabButtonActive]} onPress={() => setCurrentTab('INACTIVE')}>
                            <Text style={[styles.tabButtonText, currentTab === 'INACTIVE' && styles.tabButtonTextActive]}>Inactive ({inactiveBanners.length})</Text>
                        </Pressable>
                    </View>

                    {/* Search Field */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchBox}>
                            <Search size={18} color="#94a3b8" />
                            <TextInput style={styles.searchInput} placeholder={`Search ${currentTab.toLowerCase()} banners...`} placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
                            {searchQuery ? (
                                <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                                    <X size={16} color="#94a3b8" />
                                </Pressable>
                            ) : null}
                        </View>
                    </View>

                    {/* Banners Output Distribution Matrix Grid */}
                    {filteredBanners.length > 0 ? (
                        <View style={styles.gridContainer}>
                            {filteredBanners.map((banner) => (
                                <View key={banner.bannerId} style={{ width: cardWidth, paddingBottom: 16, paddingHorizontal: cardPadding }}>
                                    <View style={styles.card}>
                                        <View style={[styles.cardPreview, currentTab === 'INACTIVE' && { backgroundColor: '#64748b' }]}>
                                            <Text style={styles.cardPreviewTitle}>{banner.name}</Text>
                                            <Text style={styles.cardPreviewDesc} numberOfLines={2}>{banner.description}</Text>
                                        </View>

                                        <View style={styles.cardBody}>
                                            <View style={styles.cardMeta}>
                                                <ImageIcon size={14} color={currentTab === 'ACTIVE' ? "#0d9488" : "#64748b"} />
                                                <Text style={styles.cardMetaText}>ID: {banner.bannerId}</Text>
                                            </View>

                                            {/* Action Operational Buttons Cluster row stack */}
                                            <View style={styles.actionClusterRow}>
                                                {currentTab === 'ACTIVE' ? (
                                                    <>
                                                        <Pressable style={[styles.actionBtn, styles.btnDeactivate]} onPress={() => handleStatusChange(banner.bannerId, false)}>
                                                            <ToggleLeft size={14} color="#dc2626" />
                                                            <Text style={styles.deactivateText}>Deactivate</Text>
                                                        </Pressable>
                                                        <Pressable style={[styles.actionBtn, styles.btnUpdate]} onPress={() => { setSelectedBanner(banner); setUpdateModalVisible(true); }}>
                                                            <Edit2 size={14} color="#0d9488" />
                                                            <Text style={styles.updateText}>Update</Text>
                                                        </Pressable>
                                                    </>
                                                ) : (
                                                    <Pressable style={[styles.actionBtn, styles.btnActivate]} onPress={() => handleStatusChange(banner.bannerId, true)}>
                                                        <ToggleRight size={14} color="#10b981" />
                                                        <Text style={styles.activateText}>Activate</Text>
                                                    </Pressable>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <ImageIcon size={48} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No Banners Found</Text>
                            <Text style={styles.emptySub}>No elements match the active filter pipeline indexes.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modals Hooks Layout Render Tree */}
            <AddBannerModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} onSuccess={() => triggerSuccessCallback('Banner created successfully')} />
            <UpdateBannerModal visible={updateModalVisible} banner={selectedBanner} onClose={() => { setUpdateModalVisible(false); setSelectedBanner(null); }} onSuccess={triggerSuccessCallback} />
            <StatusSuccessModal visible={successVisible} message={successMsg} onClose={() => setSuccessVisible(false)} />
        </>
    );
}

// ─── STYLES ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { paddingBottom: 20 },
    wrapper: { padding: 16 },
    wrapperMobile: { padding: 12 },
    loadingContainer: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
    loadingBox: { backgroundColor: 'white', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    loadingText: { color: '#64748b', marginTop: 12 },
    header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerLeft: { flex: 1, marginRight: 12 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    headerSubtitle: { color: '#64748b', fontSize: 14, marginTop: 2 },
    createBtn: { backgroundColor: '#0d9488', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    createBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 10, padding: 4, marginBottom: 16 },
    tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    tabButtonActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    tabButtonText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    tabButtonTextActive: { color: '#0f172a' },
    searchRow: { flexDirection: 'row', marginBottom: 16 },
    searchBox: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchInput: { flex: 1, color: '#0f172a', fontSize: 14, padding: 0 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
    card: { flex: 1, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', justifyContent: 'space-between' },
    cardPreview: { backgroundColor: '#0d9488', padding: 16, minHeight: 80, justifyContent: 'center' },
    cardPreviewTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    cardPreviewDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
    cardBody: { padding: 12, flex: 1 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    cardMetaText: { color: '#64748b', fontSize: 11, fontWeight: '500' },
    actionClusterRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    btnDeactivate: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    btnUpdate: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    btnActivate: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    deactivateText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
    updateText: { color: '#0d9488', fontSize: 12, fontWeight: '600' },
    activateText: { color: '#10b981', fontSize: 12, fontWeight: '600' },
    emptyState: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 40, alignItems: 'center', width: '100%' },
    emptyTitle: { color: '#0f172a', fontWeight: 'bold', fontSize: 18, marginTop: 12 },
    emptySub: { color: '#64748b', textAlign: 'center', marginTop: 4, fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modalContainer: { backgroundColor: 'white', borderRadius: 16, width: '100%', maxWidth: 450, maxHeight: '85%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    modalBody: { padding: 20 },
    modalFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnCancel: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    btnCancelText: { color: '#475569', fontWeight: '600' },
    btnCreate: { backgroundColor: '#0d9488' },
    btnCreateText: { color: 'white', fontWeight: '600' },
    formGroup: { marginBottom: 16 },
    label: { color: '#334155', fontWeight: '600', marginBottom: 4, fontSize: 14 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12, marginBottom: 16 },
    errorText: { color: '#dc2626', fontSize: 14 },
    successModalContainer: { backgroundColor: 'white', padding: 24, borderRadius: 20, width: '80%', maxWidth: 300, alignItems: 'center', gap: 14 },
    successModalText: { fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
    successModalBtn: { backgroundColor: '#10b981', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10, minWidth: 100, alignItems: 'center' },
    successModalBtnText: { color: 'white', fontWeight: '600', fontSize: 14 }
});