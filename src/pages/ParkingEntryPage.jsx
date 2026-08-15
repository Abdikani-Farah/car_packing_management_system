import React, { useState, useEffect } from 'react';
import { parkingSpaceService } from '../services/parkingSpaceService.js';
import { vehicleService } from '../services/vehicleService.js';
import { customerService } from '../services/customerService.js';
import { parkingSessionService } from '../services/parkingSessionService.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LogIn, CheckCircle2, AlertCircle, RefreshCw, Car } from 'lucide-react';

export default function ParkingEntryPage({ preselectedSpaceId, onNavigate }) {
  const [spaces, setSpaces] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Mode: 'existing' or 'new'
  const [vehicleMode, setVehicleMode] = useState('new');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [selectedSpaceId, setSelectedSpaceId] = useState(preselectedSpaceId || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [entryTime, setEntryTime] = useState(new Date().toISOString().slice(0, 16));

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [spData, vData, cData] = await Promise.all([
        parkingSpaceService.getAll(),
        vehicleService.getAll(),
        customerService.getAll(),
      ]);
      setSpaces(spData);
      setVehicles(vData);
      setCustomers(cData);

      const availableSpaces = spData.filter((s) => s.status === 'Available');
      if (preselectedSpaceId) {
        setSelectedSpaceId(preselectedSpaceId);
      } else if (availableSpaces.length > 0) {
        setSelectedSpaceId(availableSpaces[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize entry form data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [preselectedSpaceId]);

  const handleVehicleSelect = (vId) => {
    setSelectedVehicleId(vId);
    const found = vehicles.find((v) => v._id === vId);
    if (found) {
      setVehicleType(found.type);
      setPlateNumber(found.plateNumber);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (vehicleMode === 'existing' && !selectedVehicleId) {
      setFormError('Please select a registered vehicle.');
      return;
    }

    if (vehicleMode === 'new' && !plateNumber.trim()) {
      setFormError('Plate number is required.');
      return;
    }

    if (!selectedSpaceId) {
      setFormError('Please select an available parking space.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleId: vehicleMode === 'existing' ? selectedVehicleId : undefined,
        plateNumber: vehicleMode === 'new' ? plateNumber.trim() : undefined,
        vehicleType,
        parkingSpaceId: selectedSpaceId,
        customerId: selectedCustomerId || undefined,
        entryTime: new Date(entryTime).toISOString(),
      };

      const session = await parkingSessionService.registerEntry(payload);
      setSuccessMsg(`Vehicle ${session.vehicle?.plateNumber} registered successfully in space ${session.parkingSpace?.spaceNumber}!`);

      // Reset form
      setPlateNumber('');
      setSelectedVehicleId('');
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Entry registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const availableSpaces = spaces.filter((s) => s.status === 'Available');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vehicle Parking Entry</h1>
        <p className="text-slate-500 text-sm mt-0.5">Register incoming vehicles and assign them to an available slot.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Available Spaces & Vehicles...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-800 font-semibold mb-2">Error Loading Data</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchData} variant="danger">
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {formError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Vehicle Selection Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Vehicle Registration Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleMode('new');
                      setSelectedVehicleId('');
                    }}
                    className={`py-2 px-4 text-xs font-bold rounded-lg border text-center transition-all ${
                      vehicleMode === 'new'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Enter Plate Number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleMode('existing');
                      setPlateNumber('');
                    }}
                    className={`py-2 px-4 text-xs font-bold rounded-lg border text-center transition-all ${
                      vehicleMode === 'existing'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Select Registered Vehicle
                  </button>
                </div>
              </div>

              {vehicleMode === 'new' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Plate Number"
                    placeholder="e.g. KAB-1024"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    required
                  />
                  <Select
                    label="Vehicle Type"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    options={['Car', 'Motorcycle', 'Van', 'Truck']}
                  />
                </div>
              ) : (
                <Select
                  label="Registered Vehicle"
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  options={[
                    { value: '', label: '-- Select Registered Vehicle --' },
                    ...vehicles.map((v) => ({
                      value: v._id,
                      label: `${v.plateNumber} (${v.type}${v.ownerName ? ` - ${v.ownerName}` : ''})`,
                    })),
                  ]}
                  required
                />
              )}

              {/* Parking Space Selection */}
              <div>
                <Select
                  label="Select Available Parking Space"
                  value={selectedSpaceId}
                  onChange={(e) => setSelectedSpaceId(e.target.value)}
                  options={[
                    { value: '', label: '-- Select Parking Space --' },
                    ...availableSpaces.map((s) => ({
                      value: s._id,
                      label: `${s.spaceNumber} (${s.floor} - ${s.type})`,
                    })),
                  ]}
                  required
                />
                {availableSpaces.length === 0 && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold">
                    No available parking spaces! All slots are currently occupied or under maintenance.
                  </p>
                )}
              </div>

              {/* Customer (Optional) */}
              <Select
                label="Customer / Owner (Optional)"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                options={[
                  { value: '', label: '-- Walk-in / Unregistered Customer --' },
                  ...customers.map((c) => ({
                    value: c._id,
                    label: `${c.name} (${c.phone})`,
                  })),
                ]}
              />

              {/* Entry Time */}
              <Input
                label="Entry Date & Time"
                type="datetime-local"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                required
              />

              <div className="pt-2 flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={LogIn}
                  disabled={submitting || availableSpaces.length === 0}
                >
                  {submitting ? 'Registering Entry...' : 'Register Vehicle Entry'}
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Availability Sidebar Summary */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 mb-4">
                <Car className="w-5 h-5" />
                <h3 className="font-bold text-base">Facility Status</h3>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Available Slots</p>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-1">{availableSpaces.length}</p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Total Capacity</p>
                  <p className="text-xl font-bold text-slate-200 mt-1">{spaces.length} Spaces</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <p className="font-semibold text-slate-300">Automated Rules:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Selected slot turns Occupied immediately.</li>
                <li>Multiple active entries for 1 vehicle are blocked.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
