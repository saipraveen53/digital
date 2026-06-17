import { Link } from 'expo-router';
import { Check, Star } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

export default function Pricing() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const features = [
    "Full access to all features",
    "AI-powered recovery suggestions",
    "Weekly trend analysis",
    "Private & encrypted data",
    "Priority support"
  ];

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 64 }}>
      <View style={{ maxWidth: 1000, alignSelf: 'center', width: '100%', paddingHorizontal: 24, paddingTop: 32 }}>
        
        <View style={{ alignItems: 'center', marginBottom: 64 }}>
           <Text style={{ color: '#3E7B6A', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: '700' }}>
             Pricing
           </Text>
           <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: isDesktop ? 56 : 40, lineHeight: isDesktop ? 64 : 48, color: '#111827', textAlign: 'center', marginBottom: 16 }}>
             Choose the plan that fits you
           </Text>
           <Text style={{ color: '#6B7280', fontSize: 18, textAlign: 'center', maxWidth: 600 }}>
             Every plan starts with a 14-day free trial. No credit card required upfront.
           </Text>
        </View>

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'center', gap: 32, width: '100%' }}>
          
          {/* Monthly Plan */}
          <View style={{ width: isDesktop ? '40%' : '100%', padding: 40, borderRadius: 32, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#374151', marginBottom: 8 }}>Monthly</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 32 }}>
                <Text style={{ fontSize: 44, fontWeight: '800', color: '#111827' }}>₹499</Text>
                <Text style={{ fontSize: 16, color: '#6B7280', marginLeft: 4 }}>/month</Text>
            </View>
            
            <View style={{ gap: 16, marginBottom: 40 }}>
                {features.map((f, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Check size={20} color="#3E7B6A" />
                        <Text style={{ fontSize: 16, color: '#4B5563' }}>{f}</Text>
                    </View>
                ))}
            </View>

            <Link href="/login" asChild>
              <Pressable style={{ backgroundColor: '#F8F6F0', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' }}>
                <Text style={{ color: '#3E7B6A', fontWeight: 'bold', fontSize: 18 }}>Start 14-Day Trial</Text>
              </Pressable>
            </Link>
          </View>

          {/* Yearly Plan - Popular */}
          <View style={{ width: isDesktop ? '40%' : '100%', padding: 40, borderRadius: 32, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#3E7B6A', shadowColor: '#3E7B6A', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 }}>
            <View style={{ position: 'absolute', top: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#3E7B6A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <Star size={12} color="white" fill="white" />
                <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>MOST POPULAR</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#3E7B6A', marginBottom: 8 }}>Yearly</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
                <Text style={{ fontSize: 44, fontWeight: '800', color: '#111827' }}>₹4,999</Text>
                <Text style={{ fontSize: 16, color: '#6B7280', marginLeft: 4 }}>/year</Text>
            </View>
            <Text style={{ color: '#059669', fontSize: 14, fontWeight: 'bold', marginBottom: 32 }}>Save 20% compared to monthly</Text>
            
            <View style={{ gap: 16, marginBottom: 40 }}>
                {features.map((f, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Check size={20} color="#3E7B6A" />
                        <Text style={{ fontSize: 16, color: '#4B5563' }}>{f}</Text>
                    </View>
                ))}
            </View>

            <Link href="/login" asChild>
              <Pressable style={{ backgroundColor: '#3E7B6A', paddingVertical: 18, borderRadius: 16, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Start 14-Day Trial</Text>
              </Pressable>
            </Link>
          </View>
          
        </View>

      </View>
    </ScrollView>
  );
}