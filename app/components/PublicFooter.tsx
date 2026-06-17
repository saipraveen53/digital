import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Droplets } from 'lucide-react-native';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const { width } = useWindowDimensions();

  const isMobile = width < 768; 

  return (
    <View style={{ backgroundColor: '#1C2B2A', width: '100%', paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24 }}>
      <View style={{ maxWidth: 1280, alignSelf: 'center', width: '100%' }}>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 40, gap: 40 }}>
          
          <View style={{ width: isMobile ? '100%' : '40%', marginBottom: isMobile ? 20 : 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#3E7B6A', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={26} color="#ffffff" />
              </View>
              <View style={{ justifyContent: 'center' }}>
                <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: 'white', lineHeight: 30 }}>
                  Wellbeing
                </Text>
                <Text style={{ color: '#3E7B6A', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginLeft: 2, marginTop: 2 }}>
                  Gauge
                </Text>
              </View>
            </View>

            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 26, marginBottom: 24, maxWidth: 360 }}>
              Your daily companion for mental wellness. Track activities, fill your gauge, and grow every single day.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                {({ hovered }) => (
                  <FontAwesome name="twitter" size={20} color={hovered ? "#3E7B6A" : "#ffffff"} />
                )}
              </Pressable>
              <Pressable style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                {({ hovered }) => (
                  <FontAwesome name="instagram" size={20} color={hovered ? "#3E7B6A" : "#ffffff"} />
                )}
              </Pressable>
              <Pressable style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                {({ hovered }) => (
                  <FontAwesome name="linkedin" size={20} color={hovered ? "#3E7B6A" : "#ffffff"} />
                )}
              </Pressable>
            </View>
          </View>

          <View style={{ width: isMobile ? '100%' : '20%', marginBottom: isMobile ? 20 : 0 }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 24 }}>
              PRODUCT
            </Text>
            <View style={{ gap: 16 }}>
              {['Home', 'About', 'Features', 'Pricing'].map((item) => (
                <Link key={item} href={(item === 'Home' ? '/' : `/${item.toLowerCase()}`) as any} asChild>
                  <Pressable>
                    {({ hovered }) => (
                      <Text style={{ 
                        color: hovered ? '#ffffff' : 'rgba(255,255,255,0.7)', 
                        fontSize: 16, 
                        fontWeight: '600',
                        transitionDuration: '200ms'
                      }}>
                        {item}
                      </Text>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>

          <View style={{ width: isMobile ? '100%' : '20%' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 24 }}>
              COMPANY
            </Text>
            <View style={{ gap: 16 }}>
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' }
              ].map((item) => (
                <Link key={item.name} href={item.path as any} asChild>
                  <Pressable>
                    {({ hovered }) => (
                      <Text style={{ 
                        color: hovered ? '#ffffff' : 'rgba(255,255,255,0.7)', 
                        fontSize: 16, 
                        fontWeight: '600',
                        transitionDuration: '200ms'
                      }}>
                        {item.name}
                      </Text>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>

        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 24, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500' }}>
            © {currentYear} Wellbeing Gauge. All rights reserved.
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500' }}>
            Built for your mental wellness 🌿
          </Text>
        </View>

      </View>
    </View>
  );
}