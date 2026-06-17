// app/(admin)/settings.tsx
import { Bell, ChevronRight, Globe, Lock, Moon, Shield } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function AdminSettings() {
  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900">Settings</Text>
          <Text className="text-slate-600 mt-1">Configure system settings</Text>
        </View>

        <View className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <Pressable className="flex-row items-center p-4 border-b border-slate-100">
            <View className="w-10 h-10 bg-teal-50 rounded-full items-center justify-center mr-3">
              <Shield size={18} color="#0d9488" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Security</Text>
              <Text className="text-slate-500 text-xs">Manage security settings</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </Pressable>

          <Pressable className="flex-row items-center p-4 border-b border-slate-100">
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
              <Bell size={18} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Notifications</Text>
              <Text className="text-slate-500 text-xs">Configure notification preferences</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </Pressable>

          <Pressable className="flex-row items-center p-4 border-b border-slate-100">
            <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
              <Lock size={18} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Privacy</Text>
              <Text className="text-slate-500 text-xs">Manage privacy settings</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </Pressable>

          <Pressable className="flex-row items-center p-4 border-b border-slate-100">
            <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
              <Globe size={18} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Language & Region</Text>
              <Text className="text-slate-500 text-xs">Change language and region</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </Pressable>

          <Pressable className="flex-row items-center p-4">
            <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
              <Moon size={18} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Appearance</Text>
              <Text className="text-slate-500 text-xs">Dark mode, theme settings</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}