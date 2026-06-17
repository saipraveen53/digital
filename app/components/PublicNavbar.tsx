import { usePathname, useRouter } from "expo-router";
import { Droplets, Menu, X } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, SafeAreaView, StatusBar, Text, View } from "react-native";
 
interface PublicNavbarProps {
  user?: any;
}
 
export default function PublicNavbar({ user }: PublicNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
 
  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Features", path: "/features" }, 
    { name: "Pricing", path: "/pricing" },
  ];
 
  const isHome = pathname === "/" || pathname === "";
 
  return (
    <>
      <View
        className="bg-white/95 border-b border-slate-200 z-50 absolute top-0 left-0 right-0"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        <SafeAreaView>
          <View className="w-full px-6 h-20 flex-row items-center justify-between">
           
            <Pressable onPress={() => router.push("/")} className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-[12px] bg-[#3E7B6A] items-center justify-center shadow-sm">
                <Droplets size={22} color="white" />
              </View>
              <View className="flex-col items-start justify-center">
                <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#111827', lineHeight: 28 }}>
                  Wellbeing
                </Text>
                <Text style={{ color: '#3E7B6A', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>
                  Gauge
                </Text>
              </View>
            </Pressable>
 
            <Pressable onPress={() => setMenuOpen(!menuOpen)} className="p-2">
              {menuOpen ? <X size={28} color="#111827" /> : <Menu size={28} color="#111827" />}
            </Pressable>
          </View>
 
          {menuOpen && (
            <View className="bg-white px-6 py-4 border-t border-slate-100 shadow-lg absolute top-[100%] left-0 right-0">
              {links.map((link) => {
                const isActive = pathname === link.path || (pathname === "" && link.path === "/");
                return (
                  <Pressable
                    key={link.name}
                    onPress={() => { router.push(link.path as any); setMenuOpen(false); }}
                    className={`py-4 px-5 rounded-xl mb-2 ${isActive ? 'bg-[#EBF4F1]' : ''}`}
                  >
                    <Text className={`text-base font-bold ${isActive ? 'text-[#3E7B6A]' : 'text-slate-600'}`}>
                      {link.name}
                    </Text>
                  </Pressable>
                );
              })}
             
              <Pressable
                onPress={() => { router.push("/login"); setMenuOpen(false); }}
                className="mt-4 py-4 rounded-full bg-[#3E7B6A] items-center shadow-sm"
              >
                <Text className="text-white text-base font-bold">Get Started Free</Text>
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </View>
 
      {!isHome && <View className="h-28 w-full" />}
      {isHome && <View className="h-24 w-full" />}
    </>
  );
}