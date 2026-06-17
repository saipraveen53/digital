// app/(admin)/advertisements.tsx
import {
  Calendar,
  DollarSign,
  Edit2,
  Eye,
  Filter,
  Image,
  MoreVertical,
  MousePointer,
  Pause,
  Play,
  Plus,
  Search,
  Target,
  Trash2
} from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';

export default function Advertisements() {
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const isAndroid = Platform.OS === 'android';
  const isSmallScreen = width < 400;

  const statsCards = [
    {
      title: 'Active Ads',
      value: '12',
      icon: Play,
      change: '+3',
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'Total Clicks',
      value: '45.2K',
      icon: MousePointer,
      change: '+12.5%',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'CTR',
      value: '3.2%',
      icon: Target,
      change: '+0.5%',
      color: '#8b5cf6',
      bgColor: '#f3e8ff'
    },
    {
      title: 'Revenue',
      value: '$12,450',
      icon: DollarSign,
      change: '+18.3%',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    }
  ];

  const campaigns = [
    {
      id: 1,
      title: 'Premium Offer - 50% Off',
      description: 'Get 50% discount on yearly subscription',
      type: 'Banner',
      status: 'Active',
      impressions: 12500,
      clicks: 892,
      ctr: 7.14,
      budget: '$2,500',
      spent: '$1,234',
      startDate: 'Dec 1, 2026',
      endDate: 'Dec 31, 2026',
      imageColor: '#0d9488'
    },
    {
      id: 2,
      title: 'New Feature Launch',
      description: 'AI-powered energy tracking now available',
      type: 'Popup',
      status: 'Active',
      impressions: 8900,
      clicks: 456,
      ctr: 5.12,
      budget: '$1,800',
      spent: '$987',
      startDate: 'Dec 10, 2026',
      endDate: 'Jan 10, 2027',
      imageColor: '#8b5cf6'
    },
    {
      id: 3,
      title: 'Referral Program',
      description: 'Invite friends and earn rewards',
      type: 'Banner',
      status: 'Paused',
      impressions: 3400,
      clicks: 234,
      ctr: 6.88,
      budget: '$1,200',
      spent: '$567',
      startDate: 'Nov 15, 2026',
      endDate: 'Dec 15, 2026',
      imageColor: '#f59e0b'
    },
    {
      id: 4,
      title: 'Holiday Special',
      description: 'Limited time offer - 30% off all plans',
      type: 'Video',
      status: 'Draft',
      impressions: 0,
      clicks: 0,
      ctr: 0,
      budget: '$3,000',
      spent: '$0',
      startDate: 'Dec 20, 2026',
      endDate: 'Jan 5, 2027',
      imageColor: '#ec4899'
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return { bg: '#d1fae5', text: '#10b981' };
      case 'Paused': return { bg: '#fee2e2', text: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: isAndroid ? 20 : 0 }}
    >
      <View className={isSmallScreen ? "p-3" : "p-4"}>
        {/* Header */}
        <View className="flex-row flex-wrap justify-between items-center gap-3 mb-6">
          <View className="flex-1">
            <Text className="text-xl md:text-2xl font-bold text-slate-900">Advertisements</Text>
            <Text className="text-slate-600 text-sm mt-1">Manage platform advertising campaigns</Text>
          </View>
          <Pressable 
            className="bg-teal-600 px-3 md:px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-sm"
            style={{ minWidth: isSmallScreen ? 'auto' : undefined }}
          >
            <Plus size={isSmallScreen ? 16 : 18} color="white" />
            <Text className="text-white font-medium text-sm md:text-base">
              {isSmallScreen ? 'Create' : 'Create Campaign'}
            </Text>
          </Pressable>
        </View>

        {/* Stats Bento Grid */}
        <View className="flex-row flex-wrap -mx-2 mb-6">
          {statsCards.map((stat, index) => (
            <View key={index} className="w-1/2 px-2 mb-4">
              <View className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View className={`p-2 rounded-lg`} style={{ backgroundColor: stat.bgColor }}>
                    <stat.icon size={isSmallScreen ? 16 : 20} color={stat.color} />
                  </View>
                  <Text className="text-emerald-600 text-xs font-medium">{stat.change}</Text>
                </View>
                <Text className="text-slate-500 text-xs md:text-sm">{stat.title}</Text>
                <Text className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{stat.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Search and Filter */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-3 flex-row items-center gap-2">
            <Search size={18} color="#94a3b8" />
            <TextInput
              className="flex-1 text-slate-700 text-sm md:text-base"
              placeholder="Search campaigns..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
            />
          </View>
          <Pressable className="bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-3 items-center justify-center">
            <Filter size={18} color="#64748b" />
          </Pressable>
        </View>

        {/* Campaigns Bento Grid */}
        <View className="flex-row flex-wrap -mx-2">
          {campaigns.map((campaign) => {
            const statusColors = getStatusColor(campaign.status);
            return (
              <View key={campaign.id} className="w-full md:w-1/2 px-2 mb-4">
                <View className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Campaign Header with Color Bar */}
                  <View className="h-1" style={{ backgroundColor: campaign.imageColor }} />
                  
                  {/* Campaign Content */}
                  <View className="p-3 md:p-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center gap-2 flex-1">
                        <View className="bg-slate-100 p-2 rounded-lg">
                          <Image size={isSmallScreen ? 14 : 18} color={campaign.imageColor} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-slate-900 font-semibold text-sm md:text-base">{campaign.title}</Text>
                          <Text className="text-slate-500 text-xs">{campaign.type}</Text>
                        </View>
                      </View>
                      <Pressable hitSlop={10}>
                        <MoreVertical size={18} color="#94a3b8" />
                      </Pressable>
                    </View>

                    <Text className="text-slate-600 text-xs md:text-sm mb-4">{campaign.description}</Text>

                    {/* Status and Dates */}
                    <View className="flex-row flex-wrap justify-between items-center gap-2 mb-4">
                      <View className={`px-2 py-1 rounded-full`} style={{ backgroundColor: statusColors.bg }}>
                        <Text className="text-xs font-medium" style={{ color: statusColors.text }}>
                          {campaign.status}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Calendar size={12} color="#94a3b8" />
                        <Text className="text-slate-500 text-xs">{campaign.startDate} - {campaign.endDate}</Text>
                      </View>
                    </View>

                    {/* Performance Metrics */}
                    <View className="flex-row justify-between p-2 md:p-3 bg-slate-50 rounded-lg mb-4">
                      <View className="items-center flex-1">
                        <Eye size={14} color="#64748b" />
                        <Text className="text-slate-700 font-semibold text-xs md:text-sm mt-1">{campaign.impressions.toLocaleString()}</Text>
                        <Text className="text-slate-500 text-xs">Impressions</Text>
                      </View>
                      <View className="items-center flex-1">
                        <MousePointer size={14} color="#64748b" />
                        <Text className="text-slate-700 font-semibold text-xs md:text-sm mt-1">{campaign.clicks.toLocaleString()}</Text>
                        <Text className="text-slate-500 text-xs">Clicks</Text>
                      </View>
                      <View className="items-center flex-1">
                        <Target size={14} color="#64748b" />
                        <Text className="text-slate-700 font-semibold text-xs md:text-sm mt-1">{campaign.ctr}%</Text>
                        <Text className="text-slate-500 text-xs">CTR</Text>
                      </View>
                    </View>

                    {/* Budget Section */}
                    <View className="mb-4">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-slate-600 text-xs md:text-sm">Budget Progress</Text>
                        <Text className="text-slate-700 text-xs md:text-sm font-medium">{campaign.spent} / {campaign.budget}</Text>
                      </View>
                      <View className="bg-slate-100 h-2 rounded-full overflow-hidden">
                        <View 
                          className="bg-teal-600 h-full rounded-full" 
                          style={{ width: `${(parseInt(campaign.spent.replace('$', '').replace(',', '')) / parseInt(campaign.budget.replace('$', '').replace(',', ''))) * 100}%` }} 
                        />
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row flex-wrap gap-2">
                      <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-blue-50 rounded-lg">
                        <Edit2 size={14} color="#3b82f6" />
                        <Text className="text-blue-700 text-xs md:text-sm font-medium">Edit</Text>
                      </Pressable>
                      <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-green-50 rounded-lg">
                        {campaign.status === 'Active' ? <Pause size={14} color="#10b981" /> : <Play size={14} color="#10b981" />}
                        <Text className="text-green-700 text-xs md:text-sm font-medium">
                          {campaign.status === 'Active' ? 'Pause' : campaign.status === 'Paused' ? 'Resume' : 'Activate'}
                        </Text>
                      </Pressable>
                      <Pressable className="flex-row items-center justify-center gap-2 py-2 px-3 bg-red-50 rounded-lg">
                        <Trash2 size={14} color="#ef4444" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}