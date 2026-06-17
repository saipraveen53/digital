import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';

export default function PrivacyPolicy() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <ScrollView className="flex-1 bg-white">
      <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 80 }}>
        
        <Text style={{ color: '#3E7B6A', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: '700', textAlign: 'center' }}>
          Legal
        </Text>
        <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: isDesktop ? 48 : 36, color: '#111827', textAlign: 'center', marginBottom: 48 }}>
          Privacy Policy
        </Text>

        <View style={{ gap: 32 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>1. Your Data is Yours</Text>
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 28 }}>
              At Wellbeing Gauge, we believe your mental health data is deeply personal. We do not sell, rent, or share your personal information or activity logs with third-party advertisers or data brokers.
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>2. Data Collection</Text>
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 28 }}>
              We only collect the information necessary to provide our service: your account details (email, name) and the activity logs you explicitly track within the app. Your data is encrypted in transit and at rest.
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>3. AI Insights</Text>
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 28 }}>
              Our AI recovery suggestions are generated based on your numeric gauge score and category patterns. We process this data anonymously to provide personalized tips without compromising your identity.
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>4. Your Rights</Text>
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 28 }}>
              You have the right to request a copy of your data or permanently delete your account and all associated logs at any time from your account settings.
            </Text>
          </View>

          <View style={{ marginTop: 24, padding: 24, backgroundColor: '#EBF4F1', borderRadius: 16 }}>
            <Text style={{ fontSize: 16, color: '#3E7B6A', fontWeight: '600' }}>
              Last updated: June 2026. For privacy inquiries, please contact privacy@wellbeinggauge.com
            </Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}