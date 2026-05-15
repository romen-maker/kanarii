import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AppUser, getAppUser, updateAppUserConsent, guardarFichaPendiente } from '../lib/appService';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  login: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLinkLogin: (email: string, link: string) => Promise<void>;
  logout: () => Promise<void>;
  updateConsent: () => Promise<void>;
}

// Variable de módulo para persistir el email en memoria durante la sesión del navegador
// (Sandbox constraint: evitamos localStorage para el email)
let memoryEmail: string | null = null;
export const getMemoryEmail = () => memoryEmail;
export const setMemoryEmail = (email: string | null) => { memoryEmail = email; };

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

  const sendMagicLink = async (email: string, ficha?: any) => {
    const actionCodeSettings = {
      // TODO PRODUCCIÓN: cambiar por dominio real
      url: window.location.origin + '/auth/callback',
      handleCodeInApp: true,
    };
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    setMemoryEmail(email);

    if (ficha) {
      // Guardado silencioso en Firestore para recuperación cross-device
      await guardarFichaPendiente(email, ficha);
    }
  };

  const completeMagicLinkLogin = async (email: string, link: string) => {
    await signInWithEmailLink(auth, email, link);
    setMemoryEmail(null); // Limpiar tras éxito
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
    <AuthContext.Provider value={{ 
      user, 
      appUser, 
      loading, 
      login, 
      sendMagicLink,
      completeMagicLinkLogin,
      logout, 
      updateConsent 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
