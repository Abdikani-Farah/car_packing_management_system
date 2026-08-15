import React from 'react';
import { Menu, Search, LogIn, Shield, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar, activePage, onNavigate, onOpenAuthModal }) {
  const { user, role, roleConfig, isPageAllowed } = useAuth();

  const pageTitles = {
    dashboard: 'Overview Dashboard',
    portal: 'Driver & Self-Service Portal',
    spaces: 'Parking Space Directory',
    vehicles: 'Vehicle Directory',
    customers: 'Customer Management',
    entry: 'Register Vehicle Entry',
    exit: 'Process Vehicle Exit',
    payments: 'Payments Ledger',
    history: 'Parking Session History',
    reports: 'Analytics & Financial Reports',
    pricing: 'Parking Rates Config',
    users: 'Role & Staff Management',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-8 backdrop-blur">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight">
            {pageTitles[activePage] || 'ParkMaster Pro'}
          </h1>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
            Role: <span className="font-bold text-slate-700">{roleConfig.label}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Role Pill Badge */}
        <button
          onClick={onOpenAuthModal}
          className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-all shadow-2xs hover:opacity-90 ${roleConfig.badgeColor}`}
          title="Click to Switch Role or Log In"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{roleConfig.label}</span>
        </button>

        {/* Action Button for Entry */}
        {onNavigate && isPageAllowed('entry') && (
          <button
            onClick={() => onNavigate('entry')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ New Entry</span>
          </button>
        )}
      </div>
    </header>
  );
}
