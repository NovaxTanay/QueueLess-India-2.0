// ============================================
// QueueLess India 2.0 — AuthContext (Firebase)
// ============================================
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  onAuthChange,
} from '../services/auth.service';
import { subscribeToAdminServices } from '../services/service.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [initialLoading, setInitialLoading]   = useState(true);
  const [error, setError]                     = useState(null);

  const [adminServices, setAdminServices]         = useState([]);
  const [activeService, setActiveService]         = useState(null);
  const [activeServiceId, setActiveServiceId]     = useState(null);

  const servicesUnsub = useRef(null);

  const startServicesListener = useCallback((uid) => {
    if (servicesUnsub.current) {
      servicesUnsub.current();
      servicesUnsub.current = null;
    }
    const unsub = subscribeToAdminServices(uid, (services) => {
      setAdminServices(services);
      setActiveServiceId((currentId) => {
        const stillExists = services.find((s) => s.id === currentId);
        if (services.length === 0) {
          setActiveService(null);
          return null;
        }
        if (!currentId || !stillExists) {
          setActiveService(services[0]);
          return services[0].id;
        }
        setActiveService(stillExists);
        return currentId;
      });
    });
    servicesUnsub.current = unsub;
  }, []);

  const stopServicesListener = useCallback(() => {
    if (servicesUnsub.current) {
      servicesUnsub.current();
      servicesUnsub.current = null;
    }
    setAdminServices([]);
    setActiveService(null);
    setActiveServiceId(null);
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile?.name || firebaseUser.displayName || 'User',
            role: profile?.role || 'user',
            serviceId: profile?.serviceId || null,
            ...profile,
          });
          setIsAuthenticated(true);
          if (profile?.role === 'admin') {
            startServicesListener(firebaseUser.uid);
          } else {
            stopServicesListener();
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            role: 'user',
          });
          setIsAuthenticated(true);
          stopServicesListener();
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        stopServicesListener();
      }
      setInitialLoading(false);
    });
    return () => {
      unsubAuth();
      stopServicesListener();
    };
  }, [startServicesListener, stopServicesListener]);

  const switchService = useCallback((serviceId) => {
    const found = adminServices.find((s) => s.id === serviceId);
    if (found) {
      setActiveService(found);
      setActiveServiceId(found.id);
    }
  }, [adminServices]);

  const refreshAdminServices = useCallback(() => {
    // No-op — onSnapshot keeps adminServices fresh automatically
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      return await loginUser(email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, email, password, role = 'user') => {
    setLoading(true);
    setError(null);
    try {
      return await registerUser(email, password, name, role);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    loading,
    initialLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    adminServices,
    activeService,
    activeServiceId,
    serviceId: activeServiceId,
    switchService,
    refreshAdminServices,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
