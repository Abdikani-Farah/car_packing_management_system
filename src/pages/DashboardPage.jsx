import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService.js';
import { parkingSpaceService } from '../services/parkingSpaceService.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';
import {
  SquareParking,
  CheckCircle2,
  XCircle,
  Car,
  LogIn,
  LogOut,
  DollarSign,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashStats, allSpaces] = await Promise.all([
        dashboardService.getStats(),
        parkingSpaceService.getAll(),
      ]);
      setStats(dashStats);
      setSpaces(allSpaces);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center my-8">
        <p className="text-rose-800 font-semibold mb-2">Error Loading Dashboard</p>
        <p className="text-rose-600 text-sm mb-4">{error}</p>
        <Button onClick={fetchDashboardData} variant="danger">
          Try Again
        </Button>
      </div>
    );
  }

  const total = stats?.totalSpaces || 1;
  const avail = stats?.availableSpaces || 0;
  const occ = stats?.occupiedSpaces || 0;
  const availPct = Math.min(100, Math.round((avail / total) * 100));
  const occPct = Math.min(100, Math.round((occ / total) * 100));

  // Level 1 spaces preview
  const level1Spaces = spaces.filter((s) => s.floor === 'Level 1' || s.floor === 'Ground Floor' || !s.floor).slice(0, 15);
  const displaySpaces = level1Spaces.length > 0 ? level1Spaces : spaces.slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time facility occupancy, active sessions, and revenue stats.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchDashboardData} variant="secondary" icon={RefreshCw} size="sm">
            Refresh
          </Button>
          <Button onClick={() => onNavigate('entry')} variant="primary" icon={LogIn} size="sm">
            + New Entry
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards (Professional Polish Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Spaces */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">Total Spaces</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats?.totalSpaces ?? 0}</p>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-max border border-emerald-100">
            <span>Full capacity operational</span>
          </div>
        </div>

        {/* Available */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">Available</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats?.availableSpaces ?? 0}</p>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${availPct}%` }}></div>
          </div>
        </div>

        {/* Occupied */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">Occupied</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{stats?.occupiedSpaces ?? 0}</p>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${occPct}%` }}></div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">Today's Revenue</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">${(stats?.todayRevenue ?? 0).toFixed(2)}</p>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-3">+12% from yesterday</p>
        </div>
      </div>

      {/* Main Split Grid: Active Sessions + Floor Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Active Parking Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="font-extrabold text-slate-800 uppercase text-xs tracking-wider">Active Parking Sessions</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time list of parked vehicles</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Plate</th>
                  <th className="px-5 py-3">Space</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Entry Time</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                {!stats?.activeSessions || stats.activeSessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic">
                      No active parked vehicles right now.
                    </td>
                  </tr>
                ) : (
                  stats.activeSessions.map((session) => (
                    <tr key={session._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm">
                        {session.vehicle?.plateNumber || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-indigo-600">
                        {session.parkingSpace?.spaceNumber || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {session.vehicle?.type || 'Car'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(session.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onNavigate('exit', { spaceId: session.parkingSpace?._id })}
                          className="text-rose-600 font-bold hover:text-rose-700 hover:underline px-2 py-1 rounded transition-all"
                        >
                          EXIT
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Floor Map Visualizer - Level 1 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800 uppercase text-xs tracking-wider">Floor Map - Level 1</h2>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-4 grid grid-cols-5 gap-2.5 flex-1 items-center">
            {displaySpaces.map((space) => {
              const status = space.status || 'Available';
              let boxStyles = 'bg-emerald-100/80 border-emerald-300 text-emerald-900';
              let badgeText = 'OPEN';
              let badgeColor = 'text-emerald-700';

              if (status === 'Occupied') {
                boxStyles = 'bg-rose-100/80 border-rose-300 text-rose-900';
                badgeText = 'OCCUPIED';
                badgeColor = 'text-rose-700';
              } else if (status === 'Reserved') {
                boxStyles = 'bg-amber-100/80 border-amber-300 text-amber-900';
                badgeText = 'RESERVED';
                badgeColor = 'text-amber-700';
              } else if (status === 'Maintenance') {
                boxStyles = 'bg-slate-200 border-slate-300 text-slate-800';
                badgeText = 'MAINT.';
                badgeColor = 'text-slate-600';
              }

              return (
                <div
                  key={space._id}
                  onClick={() => onNavigate('spaces')}
                  className={`aspect-square border rounded-lg p-1.5 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform ${boxStyles}`}
                  title={`${space.spaceNumber} (${status})`}
                >
                  <span className="text-[11px] font-black tracking-tight">{space.spaceNumber}</span>
                  <span className={`text-[8px] font-extrabold uppercase mt-0.5 ${badgeColor}`}>{badgeText}</span>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> AVAILABLE
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> OCCUPIED
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> MAINTENANCE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

