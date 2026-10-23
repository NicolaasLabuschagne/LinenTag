import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, configureApi } from './api';
import { clearCache } from './cache';
import type { MePatch, Session, User } from './types';

const TOKEN_KEY = 'linentag.token';
const USER_KEY = 'linentag.user';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  /** Resolves false if the user dismissed the Google sheet. */
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  /** Save profile/setup changes and update the signed-in user. */
  updateMe: (patch: MePatch) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/** Users saved by older app versions lack the setup fields. */
function normalizeUser(u: Partial<User> & Pick<User, 'id' | 'email'>): User {
  return {
    name: null,
    ...u,
    onboarded: u.onboarded ?? false,
    settings: { multipleLocations: false, trackWashes: true, ...u.settings },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    configureApi({ token: null });
    setUser(null);
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      clearCache(),
      GoogleSignin.signOut().catch(() => {}),
    ]);
  }, []);

  const saveUser = useCallback(async (next: User) => {
    setUser(next);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(next));
  }, []);

  const startSession = useCallback(
    async ({ token, user }: Session) => {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      configureApi({ token });
      await saveUser(user);
    },
    [saveUser],
  );

  // Restore the stored session immediately (works offline); the API's 401 handler signs out if it's stale.
  useEffect(() => {
    configureApi({ token: null, onUnauthorized: () => void signOut() });
    (async () => {
      const [token, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && storedUser) {
        configureApi({ token });
        setUser(normalizeUser(JSON.parse(storedUser)));
        api.me().then(({ user }) => saveUser(user), () => {});
      }
      setLoading(false);
    })();
  }, [signOut, saveUser]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signOut,
      updateMe: async (patch) => saveUser(await api.updateMe(patch)),
      signIn: async (email, password) => startSession(await api.login(email, password)),
      signUp: async (email, password, name) => startSession(await api.register(email, password, name)),
      signInWithGoogle: async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const res = await GoogleSignin.signIn();
          if (res.type !== 'success') return false;
          if (!res.data.idToken) throw new Error('Google did not return an ID token. Check the web client ID.');
          await startSession(await api.google(res.data.idToken));
          return true;
        } catch (err) {
          if (isErrorWithCode(err) && err.code === statusCodes.IN_PROGRESS) return false;
          throw err;
        }
      },
    }),
    [user, loading, signOut, startSession, saveUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
