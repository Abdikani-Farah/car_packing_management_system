import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService.js';
import { paymentService } from '../services/paymentService.js';
import { parkingSessionService } from '../services/parkingSessionService.js';
import DashboardCard from '../components/DashboardCard.jsx';
import Button from '../components/Button.jsx';
import { BarChart3, DollarSign, Calendar, RefreshCw, Car, SquareParking } from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dailyRev, setDailyRev] = useState(0);
  const [weeklyRev, setWeeklyRev] = useState(0);
  const [monthlyRev, setMonthlyRev] = useState(0);

  const [totalSessions, setTotalSessions] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);

  const [availableSpaces, setAvailableSpaces] = useState(0);
  const [occupiedSpaces, setOccupiedSpaces] = useState(0);

  const [spaceUsageList, setSpaceUsageList] = useState([]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashStats, paymentsData, sessionsData] = await Promise.all([
        dashboardService.getStats(),
        paymentService.getAll(),
        parkingSessionService.getAll(),
      ]);

      setAvailableSpaces(dashStats.availableSpaces || 0);
      setOccupiedSpaces(dashStats.occupiedSpaces || 0);
      setTotalVehicles(dashStats.totalVehicles || 0);
      setTotalSessions(sessionsData.length);

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      let dRev = 0;
      let wRev = 0;
      let mRev = 0;

      paymentsData.forEach((p) => {
        if (p.status === 'Paid' && p.createdAt) {
          const pTime = new Date(p.createdAt).getTime();
          const amt = p.amount || 0;

          if (pTime >= startOfDay) dRev += amt;
          if (pTime >= startOfWeek) wRev += amt;
          if (pTime >= startOfMonth) mRev += amt;
        }
      });

      setDailyRev(dRev);
      setWeeklyRev(wRev);
      setMonthlyRev(mRev);

      // Most used parking spaces calculation
      const spaceUsageMap = {};
      sessionsData.forEach((s) => {
        const sNum = s.parkingSpace?.spaceNumber;
        if (sNum) {
          spaceUsageMap[sNum] = (spaceUsageMap[sNum] || 0) + 1;
        }
      });

      const sortedSpaces = Object.keys(spaceUsageMap)
        .map((space) => ({ space, count: spaceUsageMap[space] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setSpaceUsageList(sortedSpaces);
    } catch (err) {
      setError(err.message || 'Failed to compile report metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const maxSpaceCount = spaceUsageList.length > 0 ? Math.max(...spaceUsageList.map((s) => s.count)) : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Comprehensive financial, usage, and space occupancy statistics.</p>
        </div>
        <Button onClick={fetchReports} variant="secondary" icon={RefreshCw} size="sm">
          Refresh Data
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Generating Report Visualizations...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-800 font-semibold mb-2">Error Generating Reports</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchReports} variant="danger">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Revenue Cards */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Revenue Breakdown</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCard
                title="Daily Revenue"
                value={`$${dailyRev.toFixed(2)}`}
                icon={Calendar}
                color="emerald"
                subtext="Earnings today"
              />
              <DashboardCard
                title="Weekly Revenue"
                value={`$${weeklyRev.toFixed(2)}`}
                icon={BarChart3}
                color="indigo"
                subtext="Earnings this week"
              />
              <DashboardCard
                title="Monthly Revenue"
                value={`$${monthlyRev.toFixed(2)}`}
                icon={DollarSign}
                color="amber"
                subtext="Earnings this month"
              />
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Sessions</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalSessions}</p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Registered Vehicles</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{totalVehicles}</p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Available Spaces</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{availableSpaces}</p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Occupied Spaces</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{occupiedSpaces}</p>
            </div>
          </div>

          {/* Visual Reports Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Used Parking Spaces - Visual Bar Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Top 5 Most-Used Parking Spaces</h3>
                <SquareParking className="w-5 h-5 text-indigo-600" />
              </div>

              {spaceUsageList.length === 0 ? (
                <p className="text-slate-400 text-xs italic py-6 text-center">No session usage recorded yet.</p>
              ) : (
                <div className="space-y-4 pt-2">
                  {spaceUsageList.map((item, idx) => {
                    const pct = Math.round((item.count / maxSpaceCount) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{item.space}</span>
                          <span>{item.count} sessions</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Occupancy Rate Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Occupancy Rate Visualizer</h3>
                <Car className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="pt-4 space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Space Utilization</span>
                    <span>
                      {availableSpaces + occupiedSpaces > 0
                        ? `${Math.round((occupiedSpaces / (availableSpaces + occupiedSpaces)) * 100)}% Occupied`
                        : '0% Occupied'}
                    </span>
                  </div>
                  <div className="w-full h-6 bg-emerald-100 rounded-xl overflow-hidden flex">
                    <div
                      className="bg-rose-500 h-full transition-all duration-500"
                      style={{
                        width: `${
                          availableSpaces + occupiedSpaces > 0
                            ? Math.round((occupiedSpaces / (availableSpaces + occupiedSpaces)) * 100)
                            : 0
                        }%`,
                      }}
                      title="Occupied Spaces"
                    />
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${
                          availableSpaces + occupiedSpaces > 0
                            ? Math.round((availableSpaces / (availableSpaces + occupiedSpaces)) * 100)
                            : 100
                        }%`,
                      }}
                      title="Available Spaces"
                    />
                  </div>
                </div>

                <div className="flex justify-around pt-2 text-xs font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span>Available ({availableSpaces})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span>Occupied ({occupiedSpaces})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
