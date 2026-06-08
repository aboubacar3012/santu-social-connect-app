import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_TOKEN = '@santu/access_token';
const STORAGE_USER = '@santu/user';

export type UserRole = 'user' | 'driver' | 'admin';

export type AuthUser = {
  id: string;
  phoneE164: string;
  email?: string | null;
  role?: UserRole;
};

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  signIn: (accessToken: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [rawToken, rawUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_TOKEN),
          AsyncStorage.getItem(STORAGE_USER),
        ]);
        if (cancelled) return;
        setToken(rawToken);
        if (rawUser) {
          try {
            setUser(JSON.parse(rawUser) as AuthUser);
          } catch {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [isReady]);

  const signIn = useCallback(async (accessToken: string, nextUser: AuthUser) => {
    await AsyncStorage.multiSet([
      [STORAGE_TOKEN, accessToken],
      [STORAGE_USER, JSON.stringify(nextUser)],
    ]);
    setToken(accessToken);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USER]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: Boolean(token),
      token,
      user,
      signIn,
      signOut,
    }),
    [isReady, token, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return ctx;
}
