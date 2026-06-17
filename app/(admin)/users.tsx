// app/(admin)/users.tsx
import {
    Calendar,
    Crown,
    Edit2,
    Filter,
    Mail,
    MoreVertical,
    Phone,
    Search,
    Star,
    Trash2,
    TrendingUp,
    UserCheck,
    UserPlus,
    Users as UsersIcon,
    UserX
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const statsCards = [
    {
      title: 'Total Users',
      value: '2,847',
      icon: UsersIcon,
      change: '+12.5%',
      color: '#0d9488',
      bgColor: '#ccfbf1'
    },
    {
      title: 'Active Users',
      value: '2,341',
      icon: UserCheck,
      change: '+8.2%',
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'New This Month',
      value: '345',
      icon: TrendingUp,
      change: '+24.5%',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Inactive Users',
      value: '506',
      icon: UserX,
      change: '-5.1%',
      color: '#ef4444',
      bgColor: '#fee2e2'
    }
  ];

  const users = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 234 567 8900',
      role: 'Premium User',
      status: 'Active',
      joinDate: 'Jan 15, 2026',
      avatar: 'SJ',
      color: '#0d9488',
      activities: 245,
      rating: 4.8
    },
    {
      id: 2,
      name: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1 234 567 8901',
      role: 'Monthly Plan',
      status: 'Active',
      joinDate: 'Feb 03, 2026',
      avatar: 'DC',
      color: '#3b82f6',
      activities: 198,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      phone: '+1 234 567 8902',
      role: 'Yearly Plan',
      status: 'Active',
      joinDate: 'Jan 28, 2026',
      avatar: 'EW',
      color: '#8b5cf6',
      activities: 167,
      rating: 4.9
    },
    {
      id: 4,
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '+1 234 567 8903',
      role: 'Free User',
      status: 'Inactive',
      joinDate: 'Dec 10, 2025',
      avatar: 'MB',
      color: '#94a3b8',
      activities: 45,
      rating: 3.2
    }
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Users Management</Text>
            <Text className="text-slate-600 mt-1">Manage and monitor platform users</Text>
          </View>
          <Pressable className="bg-teal-600 px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-sm">
            <UserPlus size={18} color="white" />
            <Text className="text-white font-medium">Add User</Text>
          </Pressable>
        </View>

        {/* Stats Bento Grid */}
        <View className="flex-row flex-wrap -mx-2 mb-6">
          {statsCards.map((stat, index) => (
            <View key={index} className="w-1/2 lg:w-1/4 px-2 mb-4">
              <View className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View className={`p-2 rounded-lg`} style={{ backgroundColor: stat.bgColor }}>
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <Text className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.change}
                  </Text>
                </View>
                <Text className="text-slate-500 text-sm">{stat.title}</Text>
                <Text className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Search and Filter Bar */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-xl border border-slate-200 px-4 py-3 flex-row items-center gap-2">
            <Search size={18} color="#94a3b8" />
            <TextInput
              className="flex-1 text-slate-700"
              placeholder="Search users by name or email..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable className="bg-white rounded-xl border border-slate-200 px-4 py-3 items-center justify-center">
            <Filter size={18} color="#64748b" />
          </Pressable>
        </View>

        {/* Users Bento Grid */}
        <View className="flex-row flex-wrap -mx-2">
          {users.map((user) => (
            <View key={user.id} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
              <View className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Color Accent Bar */}
                <View className="h-1" style={{ backgroundColor: user.color }} />
                
                {/* User Header */}
                <View className="p-4 border-b border-slate-100">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row items-center gap-3">
                      <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: `${user.color}15` }}>
                        <Text className="font-bold text-lg" style={{ color: user.color }}>{user.avatar}</Text>
                      </View>
                      <View>
                        <Text className="text-slate-900 font-semibold text-lg">{user.name}</Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <View className={`px-2 py-0.5 rounded-full ${user.status === 'Active' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-xs ${user.status === 'Active' ? 'text-green-700' : 'text-red-700'}`}>
                              {user.status}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Star size={12} color="#f59e0b" />
                            <Text className="text-xs text-slate-600">{user.rating}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <Pressable>
                      <MoreVertical size={18} color="#94a3b8" />
                    </Pressable>
                  </View>
                </View>

                {/* User Details */}
                <View className="p-4 gap-3">
                  <View className="flex-row items-center gap-2">
                    <Mail size={14} color="#94a3b8" />
                    <Text className="text-sm text-slate-600 flex-1">{user.email}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Phone size={14} color="#94a3b8" />
                    <Text className="text-sm text-slate-600">{user.phone}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#94a3b8" />
                    <Text className="text-sm text-slate-600">Joined {user.joinDate}</Text>
                  </View>
                </View>

                {/* User Stats */}
                <View className="flex-row justify-between p-4 bg-slate-50 border-t border-slate-100">
                  <View className="items-center flex-1">
                    <Text className="text-lg font-bold text-slate-900">{user.activities}</Text>
                    <Text className="text-xs text-slate-500">Activities</Text>
                  </View>
                  <View className="w-px bg-slate-200" />
                  <View className="items-center flex-1">
                    <View className="flex-row items-center gap-1">
                      <Crown size={14} color="#f59e0b" />
                      <Text className="text-sm font-medium text-slate-900">{user.role}</Text>
                    </View>
                    <Text className="text-xs text-slate-500">Plan</Text>
                  </View>
                  <View className="w-px bg-slate-200" />
                  <View className="items-center flex-1">
                    <Pressable className="bg-teal-50 px-3 py-1.5 rounded-lg">
                      <Text className="text-teal-700 text-xs font-medium">View</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row p-2 gap-2">
                  <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-blue-50 rounded-lg">
                    <Edit2 size={14} color="#3b82f6" />
                    <Text className="text-blue-700 text-sm font-medium">Edit</Text>
                  </Pressable>
                  <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-red-50 rounded-lg">
                    <Trash2 size={14} color="#ef4444" />
                    <Text className="text-red-700 text-sm font-medium">Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}