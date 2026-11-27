import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, PRIMARY_ADMIN_EMAIL } from '../lib/firebase';
import { DEFAULT_SITE_SETTINGS } from '../config/defaults';
import {
  fetchPublicSiteSettings,
  savePublicSiteSettings,
} from '../services/firestoreService';
import type { SiteSettings } from '../types/site';

interface SiteContextValue {
  settings: SiteSettings;
  loadingSettings: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (next: SiteSettings) => Promise<void>;
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
  authError: string | null;
  signInAdmin: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const loaded = await fetchPublicSiteSettings();
      setSettings(loaded);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  // Inject Google Search Console verification meta tag when configured
  useEffect(() => {
    const token = settings.googleSiteVerification.trim();
    if (!token) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="google-site-verification"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      document.head.appendChild(meta);
    }
    meta.content = token;
  }, [settings.googleSiteVerification]);

  // Activate Google Analytics 4 (gtag.js) when a valid Measurement ID (G-XXXXXXXXXX) is configured
  useEffect(() => {
    const measurementId = settings.googleAnalyticsId.trim();
    if (!/^G-[A-Z0-9]{6,20}$/i.test(measurementId)) return;

    const scriptId = 'sgf-ga4-script';
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!existing || existing.dataset.measurementId !== measurementId) {
      existing?.remove();
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.dataset.measurementId = measurementId;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }

    const win = window as unknown as {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    win.dataLayer = win.dataLayer || [];
    if (!win.gtag) {
      win.gtag = (...args: unknown[]) => {
        win.dataLayer?.push(args);
      };
    }
    win.gtag('js', new Date());
    win.gtag('config', measurementId, { anonymize_ip: true });
  }, [settings.googleAnalyticsId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError(null);

      if (!currentUser || !currentUser.emailVerified) {
        setIsPrimaryAdmin(false);
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      const primary = currentUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
      if (primary) {
        setIsPrimaryAdmin(true);
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      try {
        const staffDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        setIsPrimaryAdmin(false);
        setIsAdmin(staffDoc.exists());
      } catch {
        setIsPrimaryAdmin(false);
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAdmin = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to sign in.';
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('Sign-in was cancelled. Please select an authorized Google account to continue.');
      } else {
        setAuthError('Authentication failed. Please ensure popups are allowed and try again.');
      }
    }
  }, []);

  const signOutAdmin = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const updateSettings = useCallback(async (next: SiteSettings) => {
    await savePublicSiteSettings(next);
    setSettings(next);
  }, []);

  return (
    <SiteContext.Provider
      value={{
        settings,
        loadingSettings,
        refreshSettings,
        updateSettings,
        user,
        authReady,
        isAdmin,
        isPrimaryAdmin,
        authError,
        signInAdmin,
        signOutAdmin,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite must be used inside SiteProvider');
  }
  return ctx;
}
