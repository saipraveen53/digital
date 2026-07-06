import {
    BookOpen,
    Check,
    CheckCircle,
    CornerDownRight,
    Eye,
    FolderPlus,
    Grid,
    Plus,
    Sparkles,
    X,
    XCircle
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
    View,
    useWindowDimensions
} from 'react-native';
import { rootApi } from '../utils/axiosInstance';

// Interfaces
interface CategoryDto {
    categoryId: number;
    categoryTipName: string;
    status?: boolean;
}

interface TipResponseDto {
    tipId: string;
    tipName: string;
    tipDescription: string;
    status: boolean;
    tipScore: number;
    categoryId: number;
    categoryName: string;
}

export default function EnhancedTipsManagement() {
    const { width } = useWindowDimensions();

    // Responsive: one column on all non‑desktop, three columns on desktop
    const isDesktop = width >= 1024;
    const cardWidth = isDesktop ? '33.33%' : '100%';
    const cardPadding = isDesktop ? 8 : 0;

    // Core States
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal Active States
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [addTipModalVisible, setAddTipModalVisible] = useState(false);
    const [viewTipsModalVisible, setViewTipsModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successConfig, setSuccessConfig] = useState({ title: '', message: '' });

    // Selection Data States
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [tipsList, setTipsList] = useState<TipResponseDto[]>([]);
    const [loadingTips, setLoadingTips] = useState(false);
    const [tipsFilterStatus, setTipsFilterStatus] = useState<boolean>(true);

    // Form Submissions Hooks
    const [newCategoryName, setNewCategoryName] = useState('');
    const [submittingCategory, setSubmittingCategory] = useState(false);

    const [tipForm, setTipForm] = useState({
        tipName: '',
        tipDescription: '',
        status: true,
        tipScore: 0
    });
    const [submittingTip, setSubmittingTip] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await rootApi.get<CategoryDto[]>('/api/tipCategory/getByStatus', {
                params: { status: true }
            });
            setCategories(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            // Fallback mock data
            setCategories([
                { categoryId: 1, categoryTipName: "Mind & Emotional Wellbeing", status: true },
                { categoryId: 2, categoryTipName: "Social Wellbeing", status: true },
                { categoryId: 3, categoryTipName: "Physical Wellbeing", status: true },
                { categoryId: 4, categoryTipName: "Lifestyle & Productivity", status: true },
                { categoryId: 5, categoryTipName: "Spiritual & Personal Growth", status: true },
                { categoryId: 6, categoryTipName: "Learning & Cognitive Wellbeing", status: true }
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCategories();
    };

    const triggerSuccessNotification = (title: string, message: string) => {
        setSuccessConfig({ title, message });
        setSuccessModalVisible(true);
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Validation Error', 'Please enter a valid category name');
            return;
        }
        setSubmittingCategory(true);
        try {
            await rootApi.post('/api/tipCategory/add', { tipName: newCategoryName.trim() });
            setCategoryModalVisible(false);
            setNewCategoryName('');
            fetchCategories();
            triggerSuccessNotification('Category Saved 🎉', 'Your new lifestyle behavioral cluster has been deployed safely.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to add tip category');
        } finally {
            setSubmittingCategory(false);
        }
    };

    const handleCreateTip = async () => {
        if (!tipForm.tipName.trim() || !tipForm.tipDescription.trim()) {
            Alert.alert('Validation Error', 'Please provide values for title and description');
            return;
        }
        setSubmittingTip(true);
        try {
            await rootApi.post('/api/tips/add', {
                tipName: tipForm.tipName.trim(),
                tipDescription: tipForm.tipDescription.trim(),
                status: tipForm.status,
                tipScore: Number(tipForm.tipScore)
            }, {
                params: { categoryId: selectedCategoryId }
            });
            setAddTipModalVisible(false);
            setTipForm({ tipName: '', tipDescription: '', status: true, tipScore: 0 });
            triggerSuccessNotification('Tip Deployed Successfully 💡', 'The analytical prescription matrices have successfully indexed your content guidelines.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to deploy wellness tip context');
        } finally {
            setSubmittingTip(false);
        }
    };

    const handleGetTips = async (catId: number, catName: string, targetStatus: boolean) => {
        setSelectedCategoryId(catId);
        setSelectedCategoryName(catName);
        setTipsFilterStatus(targetStatus);
        setLoadingTips(true);
        setViewTipsModalVisible(true);

        try {
            const res = await rootApi.get<TipResponseDto[]>('/api/tips/byCategory', {
                params: {
                    categoryId: catId,
                    status: targetStatus
                }
            });
            setTipsList(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Error fetching filtered tips:', err);
            setTipsList([]);
        } finally {
            setLoadingTips(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d9488" />
                <Text style={styles.loadingText}>Loading Matrix Hub...</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />}
            >
                <View style={styles.wrapper}>

                    {/* Header */}
                    <View style={[styles.headerCard, !isDesktop && { flexDirection: 'column', alignItems: 'stretch', gap: 16 }]}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Grid size={22} color="#0d9488" />
                                <Text style={styles.headerTitle}>Tips Engine Center</Text>
                            </View>
                            <Text style={styles.headerSubtitle}>
                                Manage category hierarchies & active targets
                            </Text>
                        </View>

                        <Pressable
                            onPress={() => setCategoryModalVisible(true)}
                            style={[styles.addCategoryBtn, !isDesktop && { width: '100%' }]}
                        >
                            <FolderPlus size={16} color="white" />
                            <Text style={styles.addCategoryBtnText}>Add Category</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.blueprintTitle}>Tip Categories Blueprint</Text>

                    {/* Grid with stretch alignment */}
                    <View style={styles.gridContainer}>
                        {categories.map((cat) => {
                            const isActiveStatus = cat.status !== false;
                            return (
                                <View
                                    key={cat.categoryId}
                                    style={{
                                        width: cardWidth,
                                        paddingBottom: 16,
                                        paddingHorizontal: cardPadding,
                                    }}
                                >
                                    <View style={styles.itemCard}>
                                        <View>
                                            <View style={styles.cardHeaderRow}>
                                                <View style={{ flex: 1, paddingRight: 8 }}>
                                                    <Text style={styles.categoryLabel}>CATEGORY:</Text>
                                                    <Text style={styles.categoryNameText}>{cat.categoryTipName}</Text>
                                                    <Text style={styles.uidText}>UID: #{cat.categoryId}</Text>
                                                </View>

                                                <View style={[styles.statusBadge, { backgroundColor: isActiveStatus ? '#f0fdf4' : '#fef2f2' }]}>
                                                    {isActiveStatus ? <CheckCircle size={11} color="#059669" /> : <XCircle size={11} color="#dc2626" />}
                                                    <Text style={[styles.statusText, { color: isActiveStatus ? '#047857' : '#b91c1c' }]}>
                                                        {isActiveStatus ? 'Active' : 'InActive'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Row Actions */}
                                        <View style={styles.cardActionsRow}>
                                            <Pressable
                                                onPress={() => {
                                                    setSelectedCategoryId(cat.categoryId);
                                                    setAddTipModalVisible(true);
                                                }}
                                                style={styles.addTipsBtn}
                                            >
                                                <Plus size={13} color="#4f46e5" strokeWidth={3} />
                                                <Text style={styles.addTipsBtnText}>Add Tips</Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={() => handleGetTips(cat.categoryId, cat.categoryTipName, true)}
                                                style={styles.getTipsBtn}
                                            >
                                                <BookOpen size={13} color="#0A8F82" />
                                                <Text style={styles.getTipsBtnText}>Get Tips</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        {categories.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Sparkles size={36} color="#94a3b8" />
                                <Text style={styles.emptyText}>No Category Infrastructure Available</Text>
                                <Text style={styles.emptySubtext}>Deploy a brand new block from top selector row action</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* --- MODAL 1: CREATE CATEGORY --- */}
            <Modal visible={categoryModalVisible} animationType="fade" transparent onRequestClose={() => setCategoryModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentSmall}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Category</Text>
                            <Pressable onPress={() => setCategoryModalVisible(false)} style={{ padding: 4 }}><X size={22} color="#64748b" /></Pressable>
                        </View>

                        <View style={{ marginBottom: 24 }}>
                            <Text style={styles.inputLabel}>Category Name / Area Identifier</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Cognitive Balance, Cardio Care"
                                placeholderTextColor="#94A3B8"
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                editable={!submittingCategory}
                            />
                        </View>

                        <View style={styles.modalFooterRow}>
                            <Pressable onPress={() => setCategoryModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleCreateCategory} disabled={submittingCategory} style={styles.saveCategoryBtn}>
                                {submittingCategory ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.saveCategoryBtnText}>Save Category</Text>}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL 2: ADD TIP --- */}
            <Modal visible={addTipModalVisible} animationType="slide" transparent onRequestClose={() => setAddTipModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentMedium}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Create Behavioral Tip</Text>
                                <Text style={styles.modalSubtitle}>Assigned Parent Category ID: #{selectedCategoryId}</Text>
                            </View>
                            <Pressable onPress={() => setAddTipModalVisible(false)} style={{ padding: 4 }}><X size={22} color="#64748b" /></Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            <View style={{ marginBottom: 16 }}>
                                <Text style={styles.inputLabel}>Tip Title Name *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Complete 5-Min Stillness Break"
                                    placeholderTextColor="#94A3B8"
                                    value={tipForm.tipName}
                                    onChangeText={(val) => setTipForm({ ...tipForm, tipName: val })}
                                />
                            </View>

                            <View style={{ marginBottom: 16 }}>
                                <Text style={styles.inputLabel}>Instruction Description *</Text>
                                <TextInput
                                    style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
                                    placeholder="Provide operational guide details..."
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    value={tipForm.tipDescription}
                                    onChangeText={(val) => setTipForm({ ...tipForm, tipDescription: val })}
                                />
                            </View>

                            <View style={{ marginBottom: 16 }}>
                                <Text style={styles.inputLabel}>Assigned Score Factor Value Impact *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="0"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numeric"
                                    value={String(tipForm.tipScore)}
                                    onChangeText={(val) => setTipForm({ ...tipForm, tipScore: Number(val) || 0 })}
                                />
                            </View>

                            <View style={styles.toggleRowContainer}>
                                <View style={{ flex: 1, paddingRight: 8 }}>
                                    <Text style={styles.toggleTitle}>Tip Active Matrix</Text>
                                    <Text style={styles.toggleSubtext}>Toggle visibility state across prescription pipelines</Text>
                                </View>
                                <Pressable
                                    onPress={() => setTipForm({ ...tipForm, status: !tipForm.status })}
                                    style={[styles.toggleBtn, { backgroundColor: tipForm.status ? '#e6faf4' : '#e2e8f0', borderColor: tipForm.status ? '#b2f0da' : '#cbd5e1' }]}
                                >
                                    <Text style={[styles.toggleBtnText, { color: tipForm.status ? '#0a8f82' : '#475569' }]}>{tipForm.status ? 'Active' : 'Disabled'}</Text>
                                </Pressable>
                            </View>
                        </ScrollView>

                        <View style={[styles.modalFooterRow, { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 }]}>
                            <Pressable onPress={() => setAddTipModalVisible(false)} style={[styles.cancelBtn, { flex: 1 }]}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleCreateTip} disabled={submittingTip} style={[styles.deployTipBtn, { flex: 1 }]}>
                                {submittingTip ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.deployTipBtnText}>Deploy Tip Variant</Text>}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL 3: VIEW TIPS --- */}
            <Modal visible={viewTipsModalVisible} animationType="fade" transparent onRequestClose={() => setViewTipsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentLarge}>
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>Tips for: {selectedCategoryName}</Text>
                                <Text style={styles.modalSubtitle}>Category Identifier: #{selectedCategoryId}</Text>
                            </View>
                            <Pressable onPress={() => setViewTipsModalVisible(false)} style={{ padding: 4 }}><X size={20} color="#64748b" /></Pressable>
                        </View>

                        <View style={styles.filterTabsRow}>
                            <Pressable
                                onPress={() => { if (selectedCategoryId) handleGetTips(selectedCategoryId, selectedCategoryName, true); }}
                                style={[styles.filterTab, tipsFilterStatus && styles.filterTabActive]}
                            >
                                <CheckCircle size={12} color={tipsFilterStatus ? '#0d9488' : '#64748b'} />
                                <Text style={[styles.filterTabText, tipsFilterStatus && styles.filterTabTextActive]}>Active Tips</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => { if (selectedCategoryId) handleGetTips(selectedCategoryId, selectedCategoryName, false); }}
                                style={[styles.filterTab, !tipsFilterStatus && styles.filterTabActive]}
                            >
                                <XCircle size={12} color={!tipsFilterStatus ? '#dc2626' : '#64748b'} />
                                <Text style={[styles.filterTabText, !tipsFilterStatus && { color: '#b91c1c', fontWeight: '900' }]}>InActive Tips</Text>
                            </Pressable>
                        </View>

                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            {loadingTips ? (
                                <View style={{ py: 40, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="small" color="#0d9488" /></View>
                            ) : tipsList.length > 0 ? (
                                <View style={{ gap: 12 }}>
                                    {tipsList.map((tip) => (
                                        <View key={tip.tipId} style={styles.tipResultCard}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <Text style={styles.tipResultTitle}>{tip.tipName}</Text>
                                                <View style={styles.scoreBadge}>
                                                    <Text style={styles.scoreBadgeText}>Impact Score: +{tip.tipScore}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.tipResultDesc}>{tip.tipDescription}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <CornerDownRight size={12} color="#94a3b8" />
                                                <Text style={styles.tipResultFooter}>Category: {tip.categoryName || selectedCategoryName}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={{ paddingVertical: 60, justifyContent: 'center', alignItems: 'center' }}>
                                    <Eye size={28} color="#cbd5e1" />
                                    <Text style={styles.emptyText}>No matching tracking variants listed.</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* --- SUCCESS MODAL --- */}
            <Modal visible={successModalVisible} animationType="fade" transparent onRequestClose={() => setSuccessModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconCircle}>
                            <Check size={28} color="#059669" strokeWidth={3} />
                        </View>
                        <Text style={styles.successTitle}>{successConfig.title}</Text>
                        <Text style={styles.successMessage}>{successConfig.message}</Text>

                        <Pressable onPress={() => setSuccessModalVisible(false)} style={styles.dismissBtn}>
                            <Text style={styles.dismissBtnText}>Dismiss</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ─── STYLES ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F8F6F0',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F8F6F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#64748b',
        marginTop: 16,
        fontWeight: '600',
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    wrapper: {
        padding: 16,
    },
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    addCategoryBtn: {
        backgroundColor: '#0d9488',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
    },
    addCategoryBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    blueprintTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        alignItems: 'stretch', // Ensures all cards in a row have equal height
    },
    itemCard: {
        flex: 1,                // Fills the parent wrapper
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 175,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    categoryLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#0d9488',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    categoryNameText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -0.3,
        lineHeight: 22,
    },
    uidText: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '700',
        marginTop: 6,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    addTipsBtn: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    addTipsBtnText: {
        color: '#4f46e5',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    getTipsBtn: {
        flex: 1,
        backgroundColor: '#E6FAF4',
        borderWidth: 1,
        borderColor: '#B2F0DA',
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    getTipsBtnText: {
        color: '#0A8F82',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 48,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#334155',
        fontWeight: '700',
        marginTop: 8,
    },
    emptySubtext: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContentSmall: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    modalContentMedium: {
        backgroundColor: '#ffffff',
        borderRadius: 28,
        width: '100%',
        maxWidth: 500,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    modalContentLarge: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 650,
        padding: 24,
        borderColor: '#f1f5f9',
        height: '80%',
        flexDirection: 'column',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0B1A30',
        letterSpacing: -0.3,
    },
    modalSubtitle: {
        fontSize: 11,
        color: '#4f46e5',
        fontWeight: '900',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#5C6E84',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    textInput: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F4F7FA',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        color: '#1e293b',
        fontWeight: '600',
        fontSize: 14,
    },
    modalFooterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
    },
    cancelBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#EEF2F6',
        borderRadius: 14,
    },
    cancelBtnText: {
        fontWeight: '700',
        color: '#384A62',
        fontSize: 14,
        textAlign: 'center',
    },
    saveCategoryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#0A8F82',
        borderRadius: 14,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveCategoryBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 14,
    },
    deployTipBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#4F46E5',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deployTipBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 14,
        textAlign: 'center',
    },
    toggleRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F4F7FA',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(226,232,240,0.6)',
        marginTop: 8,
    },
    toggleTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#384A62',
        textTransform: 'uppercase',
    },
    toggleSubtext: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 2,
    },
    toggleBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    toggleBtnText: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    filterTabsRow: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(226,232,240,0.5)',
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    filterTabActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    filterTabText: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#64748b',
    },
    filterTabTextActive: {
        color: '#0f766e',
    },
    tipResultCard: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
    },
    tipResultTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        flex: 1,
    },
    scoreBadge: {
        backgroundColor: '#e0e7ff',
        borderWidth: 1,
        borderColor: '#c7d2fe',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    scoreBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#4338ca',
        textTransform: 'uppercase',
    },
    tipResultDesc: {
        color: '#475569',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    tipResultFooter: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    successModalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
    },
    successIconCircle: {
        width: 56,
        height: 56,
        backgroundColor: '#f0fdf4',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    successTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.3,
    },
    successMessage: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 6,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 8,
    },
    dismissBtn: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#0f172a',
        borderRadius: 14,
    },
    dismissBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});