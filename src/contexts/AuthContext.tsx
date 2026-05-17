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
import { AppUser, getAppUser, listenAppUser, updateAppUserConsent, guardarFichaPendiente, migrarFichaPendiente } from '../lib/appService';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  login: () => Promise<void>;
  sendMagicLink: (email: string, ficha?: any, mode?: 'onboarding' | 'login') => Promise<void>;
  completeMagicLinkLogin: (email: string, link: string) => Promise<boolean>;
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
    let unsubscribeAppUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Limpiar suscripción previa a appUser si existía
      if (unsubscribeAppUser) {
        unsubscribeAppUser();
        unsubscribeAppUser = null;
      }

      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          // 1. Asegurar la creación/migración inicial en Firestore
          const profile = await getAppUser(firebaseUser.uid, firebaseUser.email!);
          setAppUser(profile);

          // 2. Suscribirse en tiempo real a los cambios del documento del usuario
          unsubscribeAppUser = listenAppUser(firebaseUser.uid, (updatedProfile) => {
            if (updatedProfile) {
              setAppUser(updatedProfile);
            }
          });
        } else {
          setAppUser(null);
        }
      } catch (error: any) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeAppUser) {
        unsubscribeAppUser();
      }
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const sendMagicLink = async (email: string, ficha?: any, mode?: 'onboarding' | 'login') => {
    const actionCodeSettings = {
      // TODO PRODUCCIÓN: cambiar por dominio real
      url: window.location.origin + '/auth/callback',
      handleCodeInApp: true,
    };
    
    // REGLA 1: Guard explícito. NO guardar en modo login.
    if (mode !== 'login' && ficha) {
      // FIX 2: Guardar ficha pendiente ANTES del Magic Link
      await guardarFichaPendiente(email, ficha);
    }

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    setMemoryEmail(email);
  };

  const completeMagicLinkLogin = async (email: string, link: string): Promise<boolean> => {
    const result = await signInWithEmailLink(auth, email, link);
    setMemoryEmail(null); // Limpiar tras éxito
    
    // REGLA 2: Siempre intentar migrar tras login exitoso por Magic Link
    let migrada = false;
    if (result.user && result.user.email) {
      migrada = await migrarFichaPendiente(result.user.email, result.user.uid);
    }
    return migrada;
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
