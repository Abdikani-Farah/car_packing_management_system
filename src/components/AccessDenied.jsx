import React from 'react';
import { ShieldAlert, Lock, UserCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessDenied({ pageName, requiredRole = 'Admin / Manager', onNavigate, onOpenAuthModal }) {
  const { role, roleConfig } = useAuth();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your current account role (<span className="font-bold text-slate-800">{roleConfig.label}</span>) does not have authorization to view <span className="font-bold text-indigo-600">{pageName || 'this page'}</span>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <span>Required Authorization:</span>
            <span className="text-indigo-600">{requiredRole}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Your Current Role:</span>
            <span className="font-semibold text-slate-800">{roleConfig.label}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          )}

          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Authorized Role</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
