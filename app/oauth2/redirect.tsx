// app/oauth2/redirect.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function OAuth2RedirectHandler() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { loginWithGoogleToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function handleOAuthToken() {
      if (token) {
        try {
          // AuthContext లో ఉన్న మెథడ్ ద్వారా టోకెన్ ని సేవ్ చేస్తాము
          const result = await loginWithGoogleToken(token);
          if (result.success) {
            // సక్సెస్ అయ్యాక నేరుగా యూజర్ హోమ్ పేజీకి పంపుతుంది
            router.replace('/(user)/home');
          } else {
            router.replace('/(public)/login');
          }
        } catch (error) {
          console.error("OAuth Redirect Token Handling Error:", error);
          router.replace('/(public)/login');
        }
      } else {
        // ఒకవేళ టోకెన్ రాకపోతే లాగిన్ పేజీకి పంపేయాలి
        router.replace('/(public)/login');
      }
    }

    handleOAuthToken();
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F5' }}>
      <ActivityIndicator size="large" color="#336956" />
      <Text style={{ marginTop: 14, color: '#11231D', fontWeight: '600', fontSize: 16 }}>
        Authenticating Secure Session...
      </Text>
    </View>
  );
}