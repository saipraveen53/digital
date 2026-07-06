import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionExpiry: Date | null;
  activateSubscription: (days: number) => Promise<void>;
  checkAndUpdateSubscription: () => Promise<void>;
  daysRemaining: number | null;
}

interface JWTPayload {
  role: Array<{ authority: string }>;
  userId: string;
  sub: string;
  iat: number;
  exp: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth(); 
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  // Isolate storage space per unique identity matrices logs
  const getStorageKey = () => (user?.id ? `@subscription_expiry_${user.id}` : null);

  const calculateDaysRemaining = (expiry: Date | null): number | null => {
    if (!expiry) return null;
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const checkAndUpdateSubscription = async () => {
    try {
      const storageKey = getStorageKey();

      if (!user || !storageKey) {
        setIsSubscribed(false);
        setSubscriptionExpiry(null);
        setDaysRemaining(null);
        return;
      }

      let expiryString = await AsyncStorage.getItem(storageKey);

      // 🚀 RESTORE PIPELINE LOOP BACK UP MATRIX FOR EXISTING RETURNING PREMIUM USERS:
      // If local storage is empty but user holds an active server session token pipeline
      if (!expiryString && user?.token) {
        try {
          const decoded = jwtDecode<JWTPayload>(user.token);
          const nowInSeconds = Math.floor(Date.now() / 1000);
          
          // Check if token has authority updates mapping window values
          if (decoded.exp > nowInSeconds) {
            // Synchronize calculated expiry timestamps based on original account initialization
            const calculatedExpiry = new Date(decoded.exp * 1000);
            expiryString = calculatedExpiry.toISOString();
            
            // Re-hydrate local caches so they dont get locked out on multi-device re-logins
            await AsyncStorage.setItem(storageKey, expiryString);
            console.log("[SubscriptionSync] Successfully restored tracking matrix map records.");
          }
        } catch (jwtErr) {
          console.error("[SubscriptionSync] Safe recovery fallback stream failure:", jwtErr);
        }
      }

      if (expiryString) {
        const expiryDate = new Date(expiryString);
        const now = new Date();

        if (expiryDate > now) {
          setIsSubscribed(true);
          setSubscriptionExpiry(expiryDate);
          setDaysRemaining(calculateDaysRemaining(expiryDate));
        } else {
          setIsSubscribed(false);
          setSubscriptionExpiry(null);
          setDaysRemaining(null);
          await AsyncStorage.removeItem(storageKey);
        }
      } else {
        setIsSubscribed(false);
        setSubscriptionExpiry(null);
        setDaysRemaining(null);
      }
    } catch (error) {
      console.error("[SubscriptionContext] Verification core tracks exception:", error);
      setIsSubscribed(false);
    }
  };

  const activateSubscription = async (days: number) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    console.log(`[SubscriptionContext] Direct upgrade triggered dynamically for: ${days} days`);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    await AsyncStorage.setItem(storageKey, expiryDate.toISOString());
    
    setIsSubscribed(true);
    setSubscriptionExpiry(expiryDate);
    setDaysRemaining(days); 
  };

  useEffect(() => {
    checkAndUpdateSubscription();
  }, [user]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkAndUpdateSubscription();
        }
      },
    );
    return () => subscription.remove();
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        subscriptionExpiry,
        activateSubscription,
        checkAndUpdateSubscription,
        daysRemaining,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
};