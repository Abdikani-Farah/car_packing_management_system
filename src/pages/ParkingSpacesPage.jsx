import React, { useState, useEffect } from 'react';
import { parkingSpaceService } from '../services/parkingSpaceService.js';
import ParkingSlotCard from '../components/ParkingSlotCard.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Modal from '../components/Modal.jsx';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';

export default function ParkingSpacesPage({ onNavigate }) {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  // Form State
  const [spaceNumber, setSpaceNumber] = useState('');
  const [floor, setFloor] = useState('Floor 1');
  const [type, setType] = useState('Car');
  const [status, setStatus] = useState('Available');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSpaces = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await parkingSpaceService.getAll();
      setSpaces(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch parking spaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleOpenAdd = () => {
    setEditingSpace(null);
    setSpaceNumber('');
    setFloor('Floor 1');
    setType('Car');
    setStatus('Available');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (space) => {
    setEditingSpace(space);
    setSpaceNumber(space.spaceNumber);
    setFloor(space.floor);
    setType(space.type);
    setStatus(space.status);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!spaceNumber.trim() || !floor.trim()) {
      setFormError('Space number and floor location are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSpace) {
        await parkingSpaceService.update(editingSpace._id, {
          spaceNumber: spaceNumber.trim(),
          floor: floor.trim(),
          type,
          status,
        });
      } else {
        await parkingSpaceService.create({
          spaceNumber: spaceNumber.trim(),
          floor: floor.trim(),
          type,
          status,
        });
      }
      setModalOpen(false);
      fetchSpaces();
    } catch (err) {
      setFormError(err.message || 'Failed to save parking space');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (space) => {
    if (space.status === 'Occupied') {
      alert('Cannot delete an occupied parking space. Process vehicle exit first.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete parking space '${space.spaceNumber}'?`)) {
      return;
    }

    try {
      await parkingSpaceService.delete(space._id);
      fetchSpaces();
    } catch (err) {
      alert(err.message || 'Failed to delete parking space');
    }
  };

  const handleSlotAction = (space, actionType) => {
    if (actionType === 'entry') {
      onNavigate('entry', { spaceId: space._id });
    } else if (actionType === 'exit') {
      onNavigate('exit', { spaceId: space._id });
    }
  };

  // Filtering
  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch =
      space.spaceNumber.toLowerCase().includes(search.toLowerCase()) ||
      space.floor.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || space.status === statusFilter;
    const matchesType = typeFilter === 'All' || space.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Parking Spaces</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage parking slots, availability, floors, and space types.</p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus}>
          Add Parking Space
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search space or floor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={['All', 'Available', 'Occupied', 'Reserved', 'Maintenance']}
            className="w-36"
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={['All', 'Car', 'Motorcycle', 'Van', 'Truck', 'VIP', 'Disabled']}
            className="w-36"
          />
          <Button onClick={fetchSpaces} variant="secondary" icon={RefreshCw} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Spaces Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Parking Spaces...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center my-6">
          <p className="text-rose-800 font-semibold mb-2">Error Loading Spaces</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchSpaces} variant="danger">
            Retry
          </Button>
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <p className="text-slate-500 font-medium text-base mb-2">No parking spaces found</p>
          <p className="text-slate-400 text-xs">Try adjusting your search or filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSpaces.map((space) => (
            <ParkingSlotCard
              key={space._id}
              space={space}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onAction={handleSlotAction}
            />
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSpace ? 'Edit Parking Space' : 'Add New Parking Space'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Space Number"
            placeholder="e.g. P-001, A-10"
            value={spaceNumber}
            onChange={(e) => setSpaceNumber(e.target.value)}
            required
          />

          <Input
            label="Location / Floor"
            placeholder="e.g. Floor 1, Basement B2"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            required
          />

          <Select
            label="Space Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={['Car', 'Motorcycle', 'Van', 'Truck', 'VIP', 'Disabled']}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={['Available', 'Occupied', 'Reserved', 'Maintenance']}
            disabled={editingSpace && editingSpace.status === 'Occupied'}
          />

          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingSpace ? 'Update Space' : 'Create Space'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
