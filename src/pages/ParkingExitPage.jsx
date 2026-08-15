import React, { useState, useEffect } from 'react';
import { parkingSessionService } from '../services/parkingSessionService.js';
import { pricingService } from '../services/pricingService.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LogOut, Search, Clock, DollarSign, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ParkingExitPage({ preselectedSpaceId, onNavigate }) {
  const [activeSessions, setActiveSessions] = useState([]);
  const [pricingMap, setPricingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Exit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [exitTime, setExitTime] = useState(new Date().toISOString().slice(0, 16));
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [calculatedFee, setCalculatedFee] = useState(0);
  const [calculatedDuration, setCalculatedDuration] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsData, pricingData] = await Promise.all([
        parkingSessionService.getAll({ status: 'Active' }),
        pricingService.getAll(),
      ]);
      setActiveSessions(sessionsData);

      const pMap = {};
      pricingData.forEach((p) => {
        pMap[p.vehicleType] = p.hourlyRate;
      });
      setPricingMap(pMap);

      if (preselectedSpaceId) {
        const found = sessionsData.find((s) => s.parkingSpace?._id === preselectedSpaceId);
        if (found) {
          handleOpenExitModal(found, pMap);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch active parking sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [preselectedSpaceId]);

  const handleOpenExitModal = (session, pMap = pricingMap) => {
    setSelectedSession(session);
    const nowStr = new Date().toISOString().slice(0, 16);
    setExitTime(nowStr);
    setPaymentMethod('Cash');
    setFormError('');
    calculateFeeAndDuration(session, nowStr, pMap);
    setModalOpen(true);
  };

  const calculateFeeAndDuration = (session, exitTimeStr, pMap = pricingMap) => {
    if (!session) return;
    const entry = new Date(session.entryTime).getTime();
    const exit = new Date(exitTimeStr).getTime();

    if (exit < entry) {
      setCalculatedDuration(0);
      setCalculatedFee(0);
      return;
    }

    const diffInMs = exit - entry;
    const hours = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60)));
    const vehicleType = session.vehicle?.type || 'Car';
    const rate = pMap[vehicleType] || 2;
    const total = hours * rate;

    setCalculatedDuration(hours);
    setCalculatedFee(total);
  };

  const handleExitTimeChange = (e) => {
    const val = e.target.value;
    setExitTime(val);
    calculateFeeAndDuration(selectedSession, val);
  };

  const handleProcessExit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!selectedSession) return;

    setSubmitting(true);
    try {
      const res = await parkingSessionService.registerExit(selectedSession._id, {
        exitTime: new Date(exitTime).toISOString(),
        paymentMethod,
      });

      setSuccessMsg(`Vehicle ${res.session?.vehicle?.plateNumber} successfully processed for exit! Total Fee: $${res.session?.amount?.toFixed(2)}`);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to process vehicle exit');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSessions = activeSessions.filter((s) => {
    const q = search.toLowerCase();
    const plate = s.vehicle?.plateNumber?.toLowerCase() || '';
    const space = s.parkingSpace?.spaceNumber?.toLowerCase() || '';
    const owner = s.customer?.name?.toLowerCase() || s.vehicle?.ownerName?.toLowerCase() || '';

    return plate.includes(q) || space.includes(q) || owner.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vehicle Parking Exit</h1>
          <p className="text-slate-500 text-sm mt-0.5">Process vehicle departures, compute automated fees, and release parking slots.</p>
        </div>
        <Button onClick={fetchData} variant="secondary" icon={RefreshCw} size="sm">
          Refresh List
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search plate number, space, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Active Parked Vehicles: <span className="text-indigo-600 font-bold">{activeSessions.length}</span>
        </div>
      </div>

      {/* Active Parked Vehicles List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Currently Parked Vehicles...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-800 font-semibold mb-2">Error Loading Sessions</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchData} variant="danger">
            Retry
          </Button>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <p className="text-slate-500 font-medium text-base mb-2">No currently parked vehicles match your search.</p>
          <p className="text-slate-400 text-xs">All parking slots may be available or try clearing your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const entryMs = new Date(session.entryTime).getTime();
            const currentMs = Date.now();
            const elapsedHours = Math.max(1, Math.ceil((currentMs - entryMs) / (1000 * 60 * 60)));
            const vType = session.vehicle?.type || 'Car';
            const rate = pricingMap[vType] || 2;
            const estimatedFee = elapsedHours * rate;

            return (
              <div
                key={session._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-xl text-slate-900">{session.vehicle?.plateNumber || 'N/A'}</span>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                      {session.parkingSpace?.spaceNumber || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-700">Vehicle Type:</span> {vType}</p>
                    <p><span className="font-semibold text-slate-700">Owner:</span> {session.customer?.name || session.vehicle?.ownerName || 'Walk-in'}</p>
                    <div className="flex items-center space-x-1.5 text-slate-500 pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Entry: {new Date(session.entryTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Est. Duration & Fee</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {elapsedHours} hrs (${estimatedFee.toFixed(2)})
                    </span>
                  </div>
                  <Button
                    onClick={() => handleOpenExitModal(session)}
                    variant="danger"
                    size="sm"
                    icon={LogOut}
                  >
                    Process Exit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exit Calculation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Process Exit — ${selectedSession?.vehicle?.plateNumber || ''}`}
      >
        <form onSubmit={handleProcessExit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Parking Space:</span>
              <span className="font-bold text-slate-900">{selectedSession?.parkingSpace?.spaceNumber} ({selectedSession?.parkingSpace?.floor})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle Type:</span>
              <span className="font-bold text-slate-900">{selectedSession?.vehicle?.type || 'Car'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entry Time:</span>
              <span className="font-medium text-slate-800">{selectedSession ? new Date(selectedSession.entryTime).toLocaleString() : ''}</span>
            </div>
          </div>

          <Input
            label="Exit Date & Time"
            type="datetime-local"
            value={exitTime}
            onChange={handleExitTimeChange}
            required
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={['Cash', 'Card', 'Mobile Money']}
          />

          {/* Fee Breakdown Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase block">Total Parking Duration</span>
              <span className="text-sm font-bold text-emerald-900">{calculatedDuration} Hour(s)</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-800 uppercase block">Calculated Total Fee</span>
              <span className="text-2xl font-black text-emerald-700">${calculatedFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" icon={LogOut} disabled={submitting}>
              {submitting ? 'Processing Exit...' : 'Confirm Exit & Collect Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
