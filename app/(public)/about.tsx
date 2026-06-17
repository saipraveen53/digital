import { Beaker, Leaf, Lock, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

export default function AboutPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; 

  const values = [
    { icon: <Leaf size={28} color="#3E7B6A" />, title: "Daily Growth", desc: "Small consistent steps create lasting transformation. Every single log matters." },
    { icon: <Lock size={28} color="#3E7B6A" />, title: "Total Privacy", desc: "Your data is yours. End-to-end encrypted. Never sold, never shared." },
    { icon: <Beaker size={28} color="#3E7B6A" />, title: "Science-Backed", desc: "Activity weights are built on research in positive psychology and behavioral science." },
    { icon: <Sparkles size={28} color="#3E7B6A" />, title: "Judgment-Free", desc: "Bad days are data, not failure. Wellbeing Gauge guides — never shames." },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 64 }}>
        
        <View style={{ alignItems: 'center', marginBottom: 64 }}>
          <Text style={{ color: '#3E7B6A', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: '700' }}>
            Our Story
          </Text>
          <Text 
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: isDesktop ? 64 : 44, lineHeight: isDesktop ? 76 : 52, color: '#111827', textAlign: 'center' }} 
            className="mb-8"
          >
            Mental wellness is a <Text style={{ color: '#3E7B6A', fontStyle: 'italic', fontFamily: "'DM Serif Display', serif" }}>daily practice</Text>,{"\n"}
            not a destination.
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 18, lineHeight: 28, textAlign: 'center', maxWidth: 800 }}>
            We built the tool we wished we had — a simple, visual way to see how your daily choices affect your mental state in real time.
          </Text>
        </View>

        <View style={{ width: '100%', height: 350, borderRadius: 24, overflow: 'hidden', marginBottom: 80 }}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=1200&h=400&fit=crop&auto=format" }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        <View style={{ width: '100%' }}>
          <Text 
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#111827', textAlign: 'center', marginBottom: 48 }} 
          >
            What we stand for
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 }}>
            {values.map((v, i) => (
              <Pressable 
                key={i} 
                style={{ width: isDesktop ? '48%' : '100%', padding: 32 }}
                className="bg-white rounded-3xl border border-gray-100 flex-row gap-6 shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
              >
                <View className="bg-[#EBF4F1] w-14 h-14 rounded-2xl items-center justify-center flex-shrink-0">
                  {v.icon}
                </View>

                <View style={{ flex: 1 }}>
                  <Text 
                    style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#111827', marginBottom: 12 }} 
                  >
                    {v.title}
                  </Text>
                  <Text style={{ color: '#6B7280', fontSize: 16, lineHeight: 24 }}>
                    {v.desc}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}