// app/(admin)/_layout.tsx
import { Slot, usePathname, useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
  X
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const isWeb = Platform.OS === 'web';

interface MenuItem {
  title: string;
  icon: any;
  route: string;
  color: string;
  badge?: number;
  description?: string;
}

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  isSidebarCollapsed 
}: { 
  searchQuery: string; 
  setSearchQuery: (query: string) => void; 
  isSidebarCollapsed: boolean;
}) => {
  const searchInputRef = useRef<TextInput>(null);
  if (isSidebarCollapsed) return null;

  return (
    <View className="px-6 pt-4 pb-2">
      <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
        <Search size={16} color="#94a3b8" />
        <TextInput
          ref={searchInputRef}
          className="flex-1 ml-2 text-slate-900 text-sm"
          style={{ outline: 'none' }}
          placeholder="Search menu..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <Pressable 
            onPress={(e) => {
              e.stopPropagation();
              setSearchQuery('');
              setTimeout(() => searchInputRef.current?.focus(), 0);
            }}
            hitSlop={8}
          >
            <X size={14} color="#94a3b8" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoute, setActiveRoute] = useState<string>('/(admin)/dashboard');
  const sidebarWidth = useRef(new Animated.Value(280)).current;

  // Helper to normalize pathname
  const normalizePath = useCallback((path: string): string => {
    if (!path) return '/(admin)/dashboard';
    if (path.includes('(admin)')) return path;
    if (path.startsWith('/(admin)')) return path;
    const segments = path.split('/').filter(s => s.length > 0);
    const lastSegment = segments[segments.length - 1] || 'dashboard';
    const adminRoute = `/(admin)/${lastSegment}`;
    const validRoutes = ['dashboard', 'users', 'tips', 'advertisements', 'subscriptions', 'settings', 'banners'];
    return validRoutes.includes(lastSegment) ? adminRoute : '/(admin)/dashboard';
  }, []);

  // Detect mobile view (only web, for native we assume mobile)
  useEffect(() => {
    if (isWeb && typeof window !== 'undefined') {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) setIsSidebarCollapsed(true);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    } else {
      setIsMobile(true);
    }
  }, []);

  // Update active route
  useEffect(() => {
    setActiveRoute(normalizePath(pathname));
  }, [pathname, normalizePath]);

  // Animate sidebar width
  useEffect(() => {
    Animated.spring(sidebarWidth, {
      toValue: isSidebarCollapsed ? 80 : 280,
      useNativeDriver: false,
      friction: 8,
      tension: 100,
    }).start();
  }, [isSidebarCollapsed]);

  // Navigation effect – redirect if not admin or not logged in
  useEffect(() => {
    if (!user || !user.isLoggedIn) {
      router.replace('/(public)/login');
    } else if (user.role !== 'admin') {
      router.replace('/(user)/home');
    }
  }, [user, router]);

  // ========== ALL HOOKS ARE CALLED BEFORE ANY CONDITIONAL RETURN ==========
  const menuItems: MenuItem[] = useMemo(() => [
    { title: 'Dashboard', icon: LayoutDashboard, route: '/(admin)/dashboard', color: '#0d9488', description: 'Overview & Analytics' },
    { title: 'Users', icon: Users, route: '/(admin)/users', color: '#3b82f6', description: 'Manage Users' },
    { title: 'AI Tips', icon: Sparkles, route: '/(admin)/tips', color: '#8b5cf6', description: 'Recovery Tips' },
    { title: 'Banners', icon: Megaphone, route: '/(admin)/banners', color: '#ec4899', description: 'Promotional Banners' },
    { title: 'Advertisements', icon: Megaphone, route: '/(admin)/advertisements', color: '#ec4899', description: 'Campaigns' },
    { title: 'Subscriptions', icon: CreditCard, route: '/(admin)/subscriptions', color: '#f59e0b', description: 'Plans & Revenue' },
    { title: 'Settings', icon: Settings, route: '/(admin)/settings', color: '#64748b', description: 'Configuration' }
  ], []);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return menuItems;
    return menuItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, menuItems]);

  const handleNavigation = useCallback((route: string) => {
    setActiveRoute(route);
    if (isWeb && !isMobile) {
      setTimeout(() => router.push(route), 0);
    } else {
      setOpen(false);
      setTimeout(() => router.push(route), 0);
    }
  }, [isMobile, router]);

  const handleLogout = useCallback(() => {
    if (!isWeb || isMobile) setOpen(false);
    logout();
  }, [isMobile, logout]);

  const getCurrentTitle = useCallback(() => {
    const currentItem = menuItems.find(item => item.route === activeRoute);
    return currentItem?.title || 'Dashboard';
  }, [activeRoute, menuItems]);

  const SidebarContent = useMemo(() => (
    <View className="flex-1 bg-white border-r border-slate-200">
      {/* Added SafeAreaView and top padding for status bar */}
      <SafeAreaView style={{ flex: 0, backgroundColor: 'white' }} />
      <View className={`${isSidebarCollapsed ? 'px-4' : 'px-6'} pt-5 pb-1 border-b border-slate-100`}>
        <View className={`flex-row items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-teal-600 rounded-xl items-center justify-center shadow-sm">
                <Shield size={20} color="white" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold tracking-tight">EnergyTracker</Text>
                <Text className="text-teal-600 text-xs font-medium">Admin Console</Text>
              </View>
            </View>
          )}
          {isSidebarCollapsed && (
            <View className="w-10 h-10 bg-teal-600 rounded-xl items-center justify-center shadow-sm">
              <Shield size={20} color="white" />
            </View>
          )}
        </View>
        {!isSidebarCollapsed && user && (
          <View className="mt-4">
            <View className="flex-row items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <View className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 items-center justify-center">
                <Text className="text-white font-bold text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 text-sm font-semibold">{user?.name || 'Administrator'}</Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Crown size={10} color="#f59e0b" />
                  <Text className="text-amber-600 text-xs font-medium">Super Admin</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isSidebarCollapsed={isSidebarCollapsed} />

      <ScrollView className="flex-1 px-3 pt-2" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
        {!isSidebarCollapsed && (
          <View className="px-3 pt-2 pb-1">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Main Menu</Text>
          </View>
        )}
        <View className="gap-1">
          {filteredMenuItems.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <Pressable
                key={item.route}
                onPress={() => handleNavigation(item.route)}
                style={{
                  position: 'relative',
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                  paddingHorizontal: isSidebarCollapsed ? 8 : 12,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isActive ? '#0d9488' : 'transparent',
                  backgroundColor: isActive ? '#f0fdfa' : 'transparent',
                }}
              >
                {isActive && (
                  <View style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 5, backgroundColor: '#0d9488', borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />
                )}
                <View className={`flex-row items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <View style={{ width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? '#ccfbf1' : '#f1f5f9' }}>
                    <item.icon size={18} color={isActive ? item.color : '#94a3b8'} />
                  </View>
                  {!isSidebarCollapsed && (
                    <View className="flex-1 flex-row items-center justify-between">
                      <View>
                        <Text style={{ fontWeight: isActive ? '700' : '500', fontSize: 14, color: isActive ? '#0f766e' : '#475569' }}>
                          {item.title}
                        </Text>
                        {item.description && (
                          <Text style={{ fontSize: 12, color: isActive ? '#14b8a6' : '#94a3b8', marginTop: 2 }}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
        <View className="mt-4 pt-4 border-t border-slate-100">
          <Pressable
            onPress={handleLogout}
            className={`flex-row items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-3 rounded-xl transition-all duration-200 hover:bg-red-50 border border-transparent hover:border-red-200`}
          >
            <View className="w-9 h-9 rounded-lg items-center justify-center bg-red-50">
              <LogOut size={18} color="#ef4444" />
            </View>
            {!isSidebarCollapsed && (
              <View className="ml-3">
                <Text className="text-red-600 font-medium text-sm">Logout</Text>
                <Text className="text-slate-400 text-xs">End session</Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
      {!isSidebarCollapsed && (
        <View className="px-6 py-4 border-t border-slate-100">
          <Text className="text-slate-400 text-xs text-center">EnergyTracker v1.0.0</Text>
          <Text className="text-slate-400 text-xs text-center mt-1">© 2026 All rights reserved</Text>
        </View>
      )}
    </View>
  ), [isSidebarCollapsed, searchQuery, filteredMenuItems, activeRoute, user, handleNavigation, handleLogout]);

  // ========== AFTER ALL HOOKS, HANDLE UNAUTHORIZED STATE ==========
  // If user is not logged in or not admin, render nothing (the useEffect above will redirect)
  if (!user || !user.isLoggedIn || user.role !== 'admin') {
    return null;
  }

  // ========== RENDER BASED ON PLATFORM ==========
  if (isWeb && !isMobile) {
    return (
      <View className="flex-1 flex-row bg-slate-50">
        <Animated.View style={{ width: sidebarWidth, minWidth: 80, maxWidth: 280, zIndex: 20 }} className="relative shadow-lg">
          <Pressable
            onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ position: 'absolute', right: -14, top: 80, zIndex: 50, width: 28, height: 28, backgroundColor: 'white', borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 }}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} color="#64748b" /> : <ChevronLeft size={14} color="#64748b" />}
          </Pressable>
          {SidebarContent}
        </Animated.View>
        <View className="flex-1 flex-col min-w-0">
          <View className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-slate-900">{getCurrentTitle()}</Text>
                <Text className="text-sm text-slate-500">{menuItems.find(item => item.route === activeRoute)?.description || 'Management'}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Pressable className="relative w-10 h-10 rounded-xl bg-slate-100 items-center justify-center hover:bg-slate-200 transition-colors">
                  <Bell size={18} color="#64748b" />
                  <View className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </Pressable>
                <View className="flex-row items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100">
                  <View className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 items-center justify-center">
                    <Text className="text-white font-bold text-xs">{user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}</Text>
                  </View>
                  <View>
                    <Text className="text-slate-900 text-sm font-medium">{user?.name || 'Admin'}</Text>
                    <Text className="text-slate-400 text-xs">Administrator</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View className="flex-1 overflow-auto">
            <Slot />
          </View>
        </View>
      </View>
    );
  }

  // For mobile (Android/iOS) - Added proper status bar spacing
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerType="front"
        drawerStyle={{ width: '85%', maxWidth: 320, backgroundColor: 'white' }}
        renderDrawerContent={() => (
          <View className="flex-1" style={{ paddingTop: insets.top }}>
            {SidebarContent}
          </View>
        )}
      >
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
          <View className="bg-white border-b border-slate-200 pb-4 px-4 pt-3 flex-row items-center shadow-sm">
            <Pressable onPress={() => setOpen(true)} className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 active:bg-slate-200">
              <Menu size={20} color="#334155" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">{getCurrentTitle()}</Text>
              <Text className="text-xs text-slate-500">{menuItems.find(item => item.route === activeRoute)?.description || 'Management'}</Text>
            </View>
            <Pressable className="w-10 h-10 rounded-xl bg-teal-50 items-center justify-center relative">
              <Bell size={18} color="#0d9488" />
              <View className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
            </Pressable>
          </View>
          <Slot />
        </View>
      </Drawer>
    </>
  );
}