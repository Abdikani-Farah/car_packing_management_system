import React, { useState, useEffect } from 'react';
import { parkingSessionService } from '../services/parkingSessionService.js';
import Table from '../components/Table.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';
import Select from '../components/Select.jsx';
import { Search, RefreshCw, History, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await parkingSessionService.getAll();
      setSessions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch parking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const q = search.toLowerCase();
    const plate = s.vehicle?.plateNumber?.toLowerCase() || '';
    const space = s.parkingSpace?.spaceNumber?.toLowerCase() || '';
    const customer = s.customer?.name?.toLowerCase() || '';

    const matchesSearch = plate.includes(q) || space.includes(q) || customer.includes(q);
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const headers = [
    'Plate Number',
    'Parking Space',
    'Vehicle Type',
    'Entry Time',
    'Exit Time',
    'Duration',
    'Amount',
    'Session Status',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Parking History</h1>
          <p className="text-slate-500 text-sm mt-0.5">Complete historical log of active and completed parking sessions.</p>
        </div>
        <Button onClick={fetchHistory} variant="secondary" icon={RefreshCw} size="sm">
          Refresh History
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search plate, space, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={['All', 'Active', 'Completed']}
            className="w-36"
          />
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Parking Session History...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center my-6">
          <p className="text-rose-800 font-semibold mb-2">Error Loading History</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchHistory} variant="danger">
            Retry
          </Button>
        </div>
      ) : (
        <Table headers={headers} emptyMessage="No parking session history found.">
          {filteredSessions.map((s) => (
            <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-900">{s.vehicle?.plateNumber || 'N/A'}</td>
              <td className="px-6 py-4 font-medium text-indigo-600">{s.parkingSpace?.spaceNumber || 'N/A'}</td>
              <td className="px-6 py-4 text-slate-700">{s.vehicle?.type || 'Car'}</td>
              <td className="px-6 py-4 text-xs text-slate-500">
                {s.entryTime ? new Date(s.entryTime).toLocaleString() : 'N/A'}
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">
                {s.exitTime ? new Date(s.exitTime).toLocaleString() : <span className="text-amber-600 font-medium">Still Parked</span>}
              </td>
              <td className="px-6 py-4 text-slate-800 font-semibold">
                {s.duration ? `${s.duration} hrs` : '-'}
              </td>
              <td className="px-6 py-4 font-bold text-emerald-600">
                ${s.amount ? s.amount.toFixed(2) : '0.00'}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={s.status} />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
