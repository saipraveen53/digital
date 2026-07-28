import { usePathname, useRouter } from "expo-router";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Image } from "react-native";

interface PublicNavbarProps {
  user?: any;
}

export default function PublicNavbar({ user }: PublicNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const logoSource = require("../../assets/images/logo2.png");

  useEffect(() => {
    const handleScroll = (e: any) => {
      const scrollTop = e.target?.scrollTop || document.documentElement?.scrollTop || window.scrollY || 0;
      setScrolled(scrollTop > 20);
    };
    
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "User Guide", path: "/faq" },
  ];

  const isHome = pathname === "/" || pathname === "";

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-2 md:px-4 lg:px-24 h-24 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-3 group border-none bg-transparent cursor-pointer outline-none">
            <Image
              source={logoSource}
              style={{
                width: 96,
                height: 96,
                borderRadius: 12,
                objectFit: "cover"
              }}
            />
            
            <div className="flex flex-col items-start justify-center text-left">
              <span 
                style={{ fontFamily: "'DM Serif Display', serif" }} 
                className="text-gray-900 text-xl md:text-2xl font-normal leading-tight"
              >
                Wellbeing
              </span>
              <span className="text-[#3E7B6A] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] leading-none mt-0.5">
                Gauge
              </span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-3">
            {links.map((link) => {
              const isActive = pathname === link.path || (pathname === "" && link.path === "/");
              return (
                <button
                  key={link.name}
                  onClick={() => router.push(link.path as any)}
                  className={`relative px-6 py-3 rounded-full text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-[#3E7B6A] bg-[#EBF4F1]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3 rounded-full bg-[#3E7B6A] text-white text-base font-bold hover:bg-[#326657] hover:shadow-md transition-all duration-200"
            >
              Get Started Free
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-900">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200 px-6 py-4 flex flex-col gap-3 shadow-lg"
            >
              {links.map((link) => {
                const isActive = pathname === link.path || (pathname === "" && link.path === "/");
                return (
                  <button
                    key={link.name}
                    onClick={() => { router.push(link.path as any); setMenuOpen(false); }}
                    className={`text-left text-base py-3 px-5 rounded-xl font-bold ${
                      isActive ? "text-[#3E7B6A] bg-[#EBF4F1]" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
              <button
                onClick={() => { router.push("/login"); setMenuOpen(false); }}
                className="mt-3 px-5 py-4 rounded-full bg-[#3E7B6A] text-white text-base font-bold text-center"
              >
                Get Started Free
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      {/* ✅ FIXED: టైపో క్లియర్ చేయబడింది */}
      </motion.nav>

      {!isHome && <div className="h-24 w-full flex-shrink-0" />}
    </>
  );
}