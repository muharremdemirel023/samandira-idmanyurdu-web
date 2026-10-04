"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { CookieBanner } from "@/components/cookie-consent/CookieBanner";
import { CookiePreferencesModal } from "@/components/cookie-consent/CookiePreferencesModal";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_MAX_AGE_SECONDS,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  type CookieConsentRecord,
} from "@/components/cookie-consent/constants";

type CookieConsentContextValue = {
  consent: CookieConsentRecord | null;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (choices: { analytics: boolean; marketing: boolean }) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function readStoredConsent(): CookieConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistConsent(record: CookieConsentRecord) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage kullanılamıyorsa tercih yalnızca bu sekme için geçerli olur.
  }

  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(record),
    )}; path=/; max-age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  } catch {
    // Çerez yazılamıyorsa tercih yalnızca localStorage'da kalır.
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isPreferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    // localStorage sadece istemcide okunabilir; SSR/hydration uyumsuzluğunu
    // önlemek için ilk değer kasıtlı olarak mount sonrası effect'te okunuyor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(readStoredConsent());
    setHydrated(true);
  }, []);

  const commit = useCallback((analytics: boolean, marketing: boolean) => {
    const record: CookieConsentRecord = {
      version: COOKIE_CONSENT_VERSION,
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
    };
    persistConsent(record);
    setConsent(record);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => commit(true, true), [commit]);
  const rejectAll = useCallback(() => commit(false, false), [commit]);
  const savePreferences = useCallback(
    (choices: { analytics: boolean; marketing: boolean }) =>
      commit(choices.analytics, choices.marketing),
    [commit],
  );
  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      isPreferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [consent, isPreferencesOpen, acceptAll, rejectAll, savePreferences, openPreferences, closePreferences],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {hydrated && !consent ? <CookieBanner /> : null}
      {isPreferencesOpen ? <CookiePreferencesModal /> : null}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent, CookieConsentProvider içinde kullanılmalıdır.");
  }
  return context;
}
