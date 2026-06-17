import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';

export default function TermsOfService() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <ScrollView className="flex-1 bg-white">
      <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 80 }}>
        
        <Text style={{ color: '#3E7B6A', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: '700', textAlign: 'center' }}>
          Legal
        </Text>
        <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: isDesktop ? 48 : 36, color: '#111827', textAlign: 'center', marginBottom: 48 }}>
          Terms of Service
        </Text>

        <View style={{ gap: 32 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>1. Not Medical Advice</Text>
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 28 }}>
              Wellbeing Gauge is a self-care and tracking tool. It is not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing a mental health crisis, please contact your local emergency services or a mental health professional immediately.
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>2. Account Responsibilities</Text>
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 28 }}>
              You are responsible for maintaining the confidentiality of your login credentials. You must provide accurate and complete information when creating an account.
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>3. Subscriptions</Text>
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 28 }}>
              We offer a 14-day free trial. After the trial, continued access requires a paid subscription. You can cancel your subscription at any time, but refunds are not provided for partial billing periods.
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>4. Acceptable Use</Text>
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 28 }}>
              You agree not to misuse the app or help anyone else do so. This includes attempting to reverse engineer the software, trying to access data that does not belong to you, or using the app for any illegal purposes.
            </Text>
          </View>

        </View>

      </View>
    </ScrollView>
  );
}