import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
import { 
  AppUser, 
  getAppUser, 
  listenAppUser, 
  updateAppUserConsent, 
  guardarFichaPendiente, 
  migrarFichaPendiente 
} from '../lib/appService';

// 3 estados explícitos — elimina el booleano `loading` ambiguo
type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  status: AuthStatus;
  loading: boolean; // para compatibilidad
  login: () => Promise<void>;
  sendMagicLink: (email: string, ficha?: any, mode?: 'onboarding' | 'login') => Promise<void>;
  completeMagicLinkLogin: (email: string, link: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateConsent: () => Promise<void>;
}

// Variable de módulo para persistir el email en memoria durante la sesión del navegador
let memoryEmail: string | null = null;
export const getMemoryEmail = () => memoryEmail;
export const setMemoryEmail = (email: string | null) => { memoryEmail = email; };

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');

  // Ref para evitar setState en componente desmontado
  const unsubscribeAppUserRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Limpiar listener previo del appUser ANTES de cualquier setState
      if (unsubscribeAppUserRef.current) {
        unsubscribeAppUserRef.current();
        unsubscribeAppUserRef.current = null;
      }

      if (!firebaseUser) {
        // React 18 agrupa estos setters en un solo render
        setUser(null);
        setAppUser(null);
        setStatus('unauthenticated');
        return;
      }

      try {
        const profile = await getAppUser(firebaseUser.uid, firebaseUser.email!);
        
        setUser(firebaseUser);
        setAppUser(profile);
        setStatus('authenticated');

        // Suscripción en tiempo real
        unsubscribeAppUserRef.current = listenAppUser(firebaseUser.uid, (updatedProfile) => {
          if (updatedProfile) setAppUser(updatedProfile);
        });
      } catch (error) {
        console.error('Auth profile error:', error);
        setUser(null);
        setAppUser(null);
        setStatus('unauthenticated');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeAppUserRef.current) {
        unsubscribeAppUserRef.current();
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
      url: window.location.origin + '/auth/callback',
      handleCodeInApp: true,
    };
    
    if (mode !== 'login' && ficha) {
      await guardarFichaPendiente(email, ficha);
    }

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    setMemoryEmail(email);
  };

  const completeMagicLinkLogin = async (email: string, link: string): Promise<boolean> => {
    const result = await signInWithEmailLink(auth, email, link);
    setMemoryEmail(null);
    
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
    } catch (err) {
      console.error("Error updating consent:", err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      appUser,
      status,
      loading: status === 'checking',
      login,
      sendMagicLink,
      completeMagicLinkLogin,
      logout,
      updateConsent,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
