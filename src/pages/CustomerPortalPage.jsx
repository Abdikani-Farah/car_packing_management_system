import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  SquareParking,
  Clock,
  CreditCard,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  ShieldCheck,
  User,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { parkingSpaceService } from '../services/parkingSpaceService';
import { parkingSessionService } from '../services/parkingSessionService';
import { pricingService } from '../services/pricingService';
import { useAuth } from '../context/AuthContext';

export default function CustomerPortalPage({ onNavigate }) {
  const { user, loginAsDemo } = useAuth();

  // Search State
  const [ticketSearch, setTicketSearch] = useState('');
  const [foundSession, setFoundSession] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Spaces & Rates
  const [spaces, setSpaces] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const [spacesData, pricingData] = await Promise.all([
        parkingSpaceService.getAll(),
        pricingService.getAll(),
      ]);
      setSpaces(spacesData || []);
      setPricing(pricingData || {});
    } catch (err) {
      console.error('Error loading portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const handleTicketSearch = async (e) => {
    e.preventDefault();
    if (!ticketSearch.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setFoundSession(null);

    try {
      const results = await parkingSessionService.getAllSessions({ search: ticketSearch.trim() });
      if (results && results.length > 0) {
        setFoundSession(results[0]);
      } else {
        setSearchError('No active or historical parking session found for this ticket number / plate.');
      }
    } catch (err) {
      setSearchError('Failed to search parking session.');
    } finally {
      setSearchLoading(false);
    }
  };

  const totalSpaces = spaces.length;
  const availableCount = spaces.filter((s) => s.status === 'available').length;
  const occupiedCount = spaces.filter((s) => s.status === 'occupied').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl border border-indigo-800/50 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Car className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Driver & Self-Service Portal</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Valued Guest'}
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Check space availability in real time, lookup your active parking ticket status, or view transparent hourly rates.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => loginAsDemo('admin')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-300" />
              <span>Switch to Staff/Admin View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Lookup Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Check Your Ticket & Parking Status</h3>
            <p className="text-xs text-slate-500">Enter your Ticket Number (e.g. TKT-1001) or Vehicle Plate Number</p>
          </div>
        </div>

        <form onSubmit={handleTicketSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              placeholder="e.g. TKT-1001 or SL-7892-A"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center space-x-2 shrink-0"
          >
            {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify Ticket</span>}
          </button>
        </form>

        {searchError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {foundSession && (
          <div className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <span className="text-xs font-extrabold text-indigo-900 font-mono">
                Ticket #{foundSession.ticketNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  foundSession.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {foundSession.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Parking Space</span>
                <span className="font-bold text-slate-900">
                  {foundSession.spaceId?.spaceNumber || 'Assigned Space'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Vehicle Plate</span>
                <span className="font-bold text-slate-900 font-mono">
                  {foundSession.vehicleId?.plateNumber || 'Reg Plate'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Entry Time</span>
                <span className="font-medium text-slate-800">
                  {new Date(foundSession.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Current Status</span>
                <span className="font-bold text-emerald-700">Parked & Active</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Availability Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Live Parking Lot Availability</h3>
          <span className="text-xs text-slate-500 font-semibold">
            {availableCount} / {totalSpaces} Spaces Free
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Available Spaces</p>
              <p className="text-2xl font-black text-slate-900">{availableCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Occupied Spaces</p>
              <p className="text-2xl font-black text-slate-900">{occupiedCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">EV Charging Spots</p>
              <p className="text-2xl font-black text-slate-900">
                {spaces.filter((s) => s.type === 'ev').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Standard Rate</p>
              <p className="text-2xl font-black text-slate-900">${pricing?.hourlyRate || 5}/hr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Rates Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800">Parking Fee Schedule</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Hourly Rate</p>
            <p className="text-3xl font-black text-indigo-600 my-1">${pricing?.hourlyRate || 5}</p>
            <p className="text-[11px] text-slate-400">First hour & subsequent hours</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Daily Maximum</p>
            <p className="text-3xl font-black text-indigo-600 my-1">${pricing?.dailyRate || 35}</p>
            <p className="text-[11px] text-slate-400">Cap per 24-hour window</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Monthly Membership</p>
            <p className="text-3xl font-black text-indigo-600 my-1">${pricing?.monthlyRate || 250}</p>
            <p className="text-[11px] text-slate-400">Unlimited VIP access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
