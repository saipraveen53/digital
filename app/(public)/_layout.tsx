import { Slot, usePathname } from 'expo-router';
import { ArrowUp } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import PublicFooter from '../components/PublicFooter';
import PublicNavbar from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
 
export default function PublicLayout() {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const pathname = usePathname();
  const [showTopButton, setShowTopButton] = useState(false);
 
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [pathname]);
 
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowTopButton(scrollY > 300);
  };
 
  return (
    <View className="flex-1 bg-white">
      <PublicNavbar user={user} />
 
      <ScrollView
        ref={scrollViewRef}
        contentContainerClassName="flex-grow"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
       
        <View className="flex-1">
          <Slot />
        </View>
 
        <PublicFooter />
      </ScrollView>
 
      {showTopButton && (
        <Pressable
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          className="absolute bottom-8 right-8 bg-[#3E7B6A] p-4 rounded-full shadow-lg z-50 hover:bg-[#326657]"
        >
          <ArrowUp size={24} color="white" />
        </Pressable>
      )}
     
    </View>
  );
}