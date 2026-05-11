import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

interface AppUser {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  hasConsented?: boolean;
  hasFicha?: boolean;
}

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
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            let finalRole = data.role;
            if (firebaseUser.email === 'romenusabo3@gmail.com' && finalRole !== 'admin') {
               finalRole = 'admin';
               await updateDoc(userDocRef, { role: 'admin' });
            }

            // Check if user has a ficha
            const fichasQuery = query(collection(db, 'fichas'), where('userId', '==', firebaseUser.uid));
            const fichasSnapshot = await getDocs(fichasQuery);
            const hasFicha = !fichasSnapshot.empty;

            setAppUser({ uid: firebaseUser.uid, ...data, role: finalRole, hasFicha } as AppUser);
          } else {
            // Create user
            const role = firebaseUser.email === 'romenusabo3@gmail.com' ? 'admin' : 'user';
            const newUser = {
              email: firebaseUser.email!,
              role,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newUser);
            setAppUser({ uid: firebaseUser.uid, ...newUser, hasFicha: false } as AppUser);
          }
        } else {
          setAppUser(null);
        }
      } catch (error: any) {
        console.error("Auth error - code:", error?.code);
        console.error("Auth error - message:", error?.message);
        console.error("Auth error - full stack:", error);
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
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { hasConsented: true, updatedAt: serverTimestamp() });
      setAppUser({ ...appUser, hasConsented: true });
    } catch(err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, login, logout, updateConsent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
