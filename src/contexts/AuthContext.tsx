import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AppUser, getAppUser, updateAppUserConsent } from '../lib/appService';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateConsent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          const profile = await getAppUser(firebaseUser.uid, firebaseUser.email!);
          setAppUser(profile);
        } else {
          setAppUser(null);
        }
      } catch (error: any) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateConsent = async () => {
    if (!user || !appUser) return;
    try {
      await updateAppUserConsent(user.uid);
      setAppUser({ ...appUser, hasConsented: true });
    } catch(err) {
      // El error ya se maneja en appService vía handleFirestoreError
      console.error("Error updating consent:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, login, logout, updateConsent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
