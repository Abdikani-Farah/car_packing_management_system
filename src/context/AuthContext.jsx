import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  admin: {
    _id: 'usr-admin',
    name: 'John Doe',
    email: 'admin@parkmaster.com',
    role: 'admin',
    title: 'Head Administrator',
    phone: '+252 61 500 0001',
    avatar: 'AD',
  },
  manager: {
    _id: 'usr-manager',
    name: 'Sarah Connor',
    email: 'manager@parkmaster.com',
    role: 'manager',
    title: 'Operations Manager',
    phone: '+252 61 500 0002',
    avatar: 'SC',
  },
  attendant: {
    _id: 'usr-attendant',
    name: 'Mike Ross',
    email: 'attendant@parkmaster.com',
    role: 'attendant',
    title: 'Gate Attendant',
    phone: '+252 61 500 0003',
    avatar: 'MR',
  },
  customer: {
    _id: 'usr-customer',
    name: 'Amina Mohamed',
    email: 'customer@parkmaster.com',
    role: 'customer',
    title: 'VIP Member / Driver',
    phone: '+252 61 555 0101',
    avatar: 'AM',
  },
};

export const ROLE_PERMISSIONS = {
  admin: {
    label: 'Head Administrator',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-500',
    allowedPages: ['dashboard', 'spaces', 'vehicles', 'customers', 'entry', 'exit', 'payments', 'history', 'reports', 'pricing', 'users'],
    canEditPricing: true,
    canManageUsers: true,
    canDeleteRecords: true,
    canViewFinancials: true,
  },
  manager: {
    label: 'Operations Manager',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    allowedPages: ['dashboard', 'spaces', 'vehicles', 'customers', 'entry', 'exit', 'payments', 'history', 'reports'],
    canEditPricing: false,
    canManageUsers: false,
    canDeleteRecords: true,
    canViewFinancials: true,
  },
  attendant: {
    label: 'Gate Attendant',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    allowedPages: ['dashboard', 'spaces', 'vehicles', 'entry', 'exit', 'payments'],
    canEditPricing: false,
    canManageUsers: false,
    canDeleteRecords: false,
    canViewFinancials: false,
  },
  customer: {
    label: 'Customer / Driver',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
    allowedPages: ['portal', 'spaces', 'pricing', 'history'],
    canEditPricing: false,
    canManageUsers: false,
    canDeleteRecords: false,
    canViewFinancials: false,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('parkmaster_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_ACCOUNTS.admin;
      }
    }
    return DEMO_ACCOUNTS.admin; // Default to Admin
  });

  const [token, setToken] = useState(() => localStorage.getItem('parkmaster_token') || 'usr-admin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('parkmaster_user', JSON.stringify(user));
      localStorage.setItem('parkmaster_token', token || user._id);
    } else {
      localStorage.removeItem('parkmaster_user');
      localStorage.removeItem('parkmaster_token');
    }
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.user) {
        setUser(res.user);
        setToken(res.token);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      // Fallback check against demo accounts
      const cleanEmail = email.toLowerCase().trim();
      const matchedKey = Object.keys(DEMO_ACCOUNTS).find(
        (key) => DEMO_ACCOUNTS[key].email.toLowerCase() === cleanEmail
      );

      if (matchedKey) {
        const demoUser = DEMO_ACCOUNTS[matchedKey];
        setUser(demoUser);
        setToken(demoUser._id);
        return { success: true, user: demoUser };
      }

      return { success: false, error: err.message || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (roleKey) => {
    const demoUser = DEMO_ACCOUNTS[roleKey] || DEMO_ACCOUNTS.admin;
    setUser(demoUser);
    setToken(demoUser._id);
    return demoUser;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('parkmaster_user');
    localStorage.removeItem('parkmaster_token');
  };

  const currentRole = user?.role || 'admin';
  const roleConfig = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.admin;

  const isPageAllowed = (pageId) => {
    if (currentRole === 'admin') return true;
    return roleConfig.allowedPages.includes(pageId);
  };

  const hasPermission = (permissionKey) => {
    return !!roleConfig[permissionKey];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: currentRole,
        roleConfig,
        loading,
        login,
        loginAsDemo,
        logout,
        isPageAllowed,
        hasPermission,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
