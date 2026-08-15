import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService.js';
import VehicleTable from '../components/VehicleTable.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Modal from '../components/Modal.jsx';
import { Plus, Search, RefreshCw } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form state
  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState('Car');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setPlateNumber('');
    setType('Car');
    setModel('');
    setColor('');
    setOwnerName('');
    setOwnerPhone('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setPlateNumber(v.plateNumber);
    setType(v.type);
    setModel(v.model || '');
    setColor(v.color || '');
    setOwnerName(v.ownerName || '');
    setOwnerPhone(v.ownerPhone || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!plateNumber.trim()) {
      setFormError('Plate number is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle._id, {
          plateNumber: plateNumber.trim(),
          type,
          model,
          color,
          ownerName,
          ownerPhone,
        });
      } else {
        await vehicleService.create({
          plateNumber: plateNumber.trim(),
          type,
          model,
          color,
          ownerName,
          ownerPhone,
        });
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setFormError(err.message || 'Failed to save vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Are you sure you want to delete vehicle '${v.plateNumber}'?`)) {
      return;
    }

    try {
      await vehicleService.delete(v._id);
      fetchVehicles();
    } catch (err) {
      alert(err.message || 'Failed to delete vehicle');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v.ownerName && v.ownerName.toLowerCase().includes(search.toLowerCase())) ||
      (v.model && v.model.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'All' || v.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vehicles Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Register, update, and search vehicle details and owners.</p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus}>
          Add Vehicle
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search plate, owner, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={['All', 'Car', 'Motorcycle', 'Van', 'Truck']}
            className="w-36"
          />
          <Button onClick={fetchVehicles} variant="secondary" icon={RefreshCw} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Vehicle Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Vehicle Records...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center my-6">
          <p className="text-rose-800 font-semibold mb-2">Error Loading Vehicles</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchVehicles} variant="danger">
            Retry
          </Button>
        </div>
      ) : (
        <VehicleTable vehicles={filteredVehicles} onEdit={handleOpenEdit} onDelete={handleDelete} />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Plate Number"
            placeholder="e.g. KAB-1024"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            required
          />

          <Select
            label="Vehicle Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={['Car', 'Motorcycle', 'Van', 'Truck']}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Model"
              placeholder="e.g. Toyota Camry"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <Input
              label="Color"
              placeholder="e.g. Silver, Blue"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Owner Name"
              placeholder="e.g. John Doe"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
            <Input
              label="Owner Phone"
              placeholder="e.g. +1-555-0199"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
