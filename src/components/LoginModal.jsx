import React, { useState } from 'react';
import { Shield, KeyRound, Mail, Lock, UserCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Failed to log in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (roleKey) => {
    loginAsDemo(roleKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg"
          >
            ✕
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md">
              P
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">ParkMaster Pro Auth</h2>
              <p className="text-xs text-indigo-300">Role-Based Access Control System</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Demo Quick Select Chips */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
              <span>⚡ One-Click Demo Role Switch</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Instant Test</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('admin')}
                className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-left transition-colors flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-indigo-900">👑 Admin</p>
                  <p className="text-[10px] text-indigo-600">Full Access</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('manager')}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-left transition-colors flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">👔 Manager</p>
                  <p className="text-[10px] text-emerald-600">Reports & Ops</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('attendant')}
                className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-left transition-colors flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">🚧 Attendant</p>
                  <p className="text-[10px] text-amber-600">Gate & Entry</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('customer')}
                className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900">🚗 Customer</p>
                  <p className="text-[10px] text-blue-600">Self-Service</p>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or Login with Credentials
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@parkmaster.com"
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
