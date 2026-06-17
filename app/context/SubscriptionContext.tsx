// context/SubscriptionContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionExpiry: Date | null;
  activateFreeTrial: () => Promise<void>;
  activateSubscription: (days: number) => Promise<void>;
  checkAndUpdateSubscription: () => Promise<void>;
  daysRemaining: number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "@subscription_expiry";

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(
    null,
  );
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const calculateDaysRemaining = (expiry: Date | null): number | null => {
    if (!expiry) return null;
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const checkAndUpdateSubscription = async () => {
    try {
      const expiryString = await AsyncStorage.getItem(STORAGE_KEY);
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
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } else {
        setIsSubscribed(false);
        setSubscriptionExpiry(null);
        setDaysRemaining(null);
      }
    } catch (error) {
      console.error("Failed to check subscription:", error);
      setIsSubscribed(false);
    }
  };

  const activateFreeTrial = async () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    await AsyncStorage.setItem(STORAGE_KEY, expiryDate.toISOString());
    setIsSubscribed(true);
    setSubscriptionExpiry(expiryDate);
    setDaysRemaining(7);
  };

  const activateSubscription = async (days: number) => {
    console.log(
      `[SubscriptionContext] Syncing state dynamically for: ${days} days`,
    );
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    await AsyncStorage.setItem(STORAGE_KEY, expiryDate.toISOString());
    setIsSubscribed(true);
    setSubscriptionExpiry(expiryDate);
    setDaysRemaining(days); // 👈 FIXED: Overrides zeroed out, accepts exact runtime parsed argument targets directly
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkAndUpdateSubscription();
        }
      },
    );
    checkAndUpdateSubscription();
    return () => subscription.remove();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        subscriptionExpiry,
        activateFreeTrial,
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
