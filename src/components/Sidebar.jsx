import React from 'react';
import {
  LayoutDashboard,
  SquareParking,
  Car,
  Users,
  LogIn,
  LogOut,
  CreditCard,
  History,
  BarChart3,
  DollarSign,
  UserCheck,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, setActivePage, isOpen, onClose, onOpenAuthModal }) {
  const { user, role, roleConfig, isPageAllowed, logout } = useAuth();

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portal', label: 'Driver Portal', icon: Sparkles },
    { id: 'spaces', label: 'Parking Spaces', icon: SquareParking },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'entry', label: 'Parking Entry', icon: LogIn },
    { id: 'exit', label: 'Parking Exit', icon: LogOut },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'pricing', label: 'Pricing Config', icon: DollarSign },
    { id: 'users', label: 'Roles & Staff', icon: UserCheck },
  ];

  const allowedItems = allNavItems.filter((item) => isPageAllowed(item.id));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white shadow-md text-base">
              P
            </div>
            <div>
              <span className="text-white font-extrabold text-sm tracking-tight uppercase block leading-none">
                ParkMaster Pro
              </span>
              <span className="text-[10px] font-semibold text-indigo-400">RBAC Secured System</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Role</span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleConfig.badgeColor}`}
          >
            {roleConfig.label}
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {role === 'customer' ? 'Driver Services' : 'Management Console'}
          </p>
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  onClose();
                }}
                className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 font-bold border-l-2 border-indigo-500 pl-2.5 shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Role Switcher Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center space-x-3 p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/50">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
              {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Not logged in'}</p>
            </div>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch Role / Login</span>
          </button>
        </div>
      </aside>
    </>
  );
}
