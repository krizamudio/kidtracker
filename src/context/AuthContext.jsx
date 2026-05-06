import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const p = await authService.getPerfil(firebaseUser.uid);
        setPerfil(p);
      } else {
        setUser(null);
        setPerfil(null);
      }
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const u = await authService.login(email, password);
    const p = await authService.getPerfil(u.uid);
    setPerfil(p);
    return { user: u, perfil: p };
  };

  const register = async (email, password, userData) => {
    const u = await authService.register(email, password, userData);
    const p = await authService.getPerfil(u.uid);
    setPerfil(p);
    return { user: u, perfil: p };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPerfil(null);
  };

  return (
    <AuthContext.Provider value={{
      user, perfil, loadingAuth,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};