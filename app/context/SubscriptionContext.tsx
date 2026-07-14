// app/context/SubscriptionContext.tsx
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "./AuthContext";

interface ExtendedJWTPayload {
  role: Array<{ authority: string }>;
  trialexpireDate?: string;      // "2026-06-20"
  trialStatus?: string;          // "EXPIRED" or "ACTIVE"
  trialUsed?: boolean;
  activePlanId?: string;         
  name?: string;
  activePlanName?: string;       // "Free Trial" or "Monthly Premium"
  planStatus?: string;           // "ACTIVE" or "EXPIRED"
  expireDate?: string;           
  userId: string;
  sub: string;
  iat: number;
  exp: number;
}

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionExpiry: Date | null;
  daysRemaining: number | null;
  activePlanName: string | null;
  trialStatus: string | null;
  planStatus: string | null;
  checkAndUpdateSubscription: () => Promise<void>;
  activateSubscription: (days: number) => Promise<void>; 
  activateFreeTrial: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); 
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [activePlanName, setActivePlanName] = useState<string | null>(null);
  const [trialStatus, setTrialStatus] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<string | null>(null);

  const calculateDaysRemaining = (expiryDate: Date): number => {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // ✅ నార్మల్ లాగిన్ అప్పుడు కేవలం టోకెన్ లో ఉన్న స్టేటస్ మాత్రమే చెక్ చేస్తుంది (ఆటో-ఆక్టివేట్ చేయదు)
  const checkAndUpdateSubscription = async () => {
    if (!user || !user.token) {
      setIsSubscribed(false);
      setSubscriptionExpiry(null);
      setDaysRemaining(null);
      setActivePlanName(null);
      setTrialStatus(null);
      setPlanStatus(null);
      return;
    }

    try {
      const decoded = jwtDecode<ExtendedJWTPayload>(user.token);
      const now = new Date();

      const tStatus = decoded.trialStatus || "EXPIRED";
      const pStatus = decoded.planStatus || "EXPIRED";
      const planName = decoded.activePlanName || null;

      setTrialStatus(tStatus);
      setPlanStatus(pStatus);
      setActivePlanName(planName);

      let targetExpiryDate: Date | null = null;
      let hasValidAccess = false;

      // 1. Paid Subscription యాక్టివ్‌గా ఉందో లేదో చెక్ చేస్తుంది
      if (pStatus === "ACTIVE" && decoded.expireDate) {
        const pExpiry = new Date(decoded.expireDate);
        if (pExpiry > now) {
          targetExpiryDate = pExpiry;
          hasValidAccess = true;
        }
      } 
      // 2. యూజర్ ప్లాన్స్ లో ఫ్రీ ట్రయల్ క్లిక్ చేసి ఆక్టివేట్ చేసుకుంటే ఇక్కడకు వస్తుంది
      else if (tStatus === "ACTIVE" && decoded.trialexpireDate) {
        const tExpiry = new Date(decoded.trialexpireDate);
        if (tExpiry > now) {
          targetExpiryDate = tExpiry;
          hasValidAccess = true;
        }
      }

      if (hasValidAccess && targetExpiryDate) {
        setIsSubscribed(true);
        setSubscriptionExpiry(targetExpiryDate);
        setDaysRemaining(calculateDaysRemaining(targetExpiryDate));
      } else {
        setIsSubscribed(false);
        setSubscriptionExpiry(null);
        setDaysRemaining(null);
      }
    } catch (error) {
      console.error("[SubscriptionContext] Error decoding token:", error);
      setIsSubscribed(false);
    }
  };

  // యూజర్ హోమ్ స్క్రీన్ ప్లాన్స్ నుండి మాన్యువల్‌గా పేమెంట్ లేదా ట్రయల్ బటన్ నొక్కినప్పుడు కాల్ అయ్యే మెథడ్స్
  const activateSubscription = async (days: number) => {
    await checkAndUpdateSubscription();
  };

  const activateFreeTrial = async () => {
    await checkAndUpdateSubscription();
  };

  useEffect(() => {
    checkAndUpdateSubscription();
  }, [user]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkAndUpdateSubscription();
      }
    });
    return () => appStateSubscription.remove();
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        subscriptionExpiry,
        daysRemaining,
        activePlanName,
        trialStatus,
        planStatus,
        checkAndUpdateSubscription,
        activateSubscription,
        activateFreeTrial,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};