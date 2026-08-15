import React, { useState, useEffect } from 'react';
import { customerService } from '../services/customerService.js';
import { vehicleService } from '../services/vehicleService.js';
import CustomerTable from '../components/CustomerTable.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Modal from '../components/Modal.jsx';
import { Plus, Search, RefreshCw } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [custData, vehData] = await Promise.all([
        customerService.getAll(),
        vehicleService.getAll(),
      ]);
      setCustomers(custData);
      setVehicles(vehData);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers or vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setSelectedVehicle('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setSelectedVehicle(c.vehicle?._id || c.vehicle || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !phone.trim()) {
      setFormError('Name and phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        vehicle: selectedVehicle || null,
      };

      if (editingCustomer) {
        await customerService.update(editingCustomer._id, payload);
      } else {
        await customerService.create(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Are you sure you want to delete customer '${c.name}'?`)) {
      return;
    }

    try {
      await customerService.delete(c._id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const vehicleOptions = [
    { value: '', label: '-- None / Select Vehicle --' },
    ...vehicles.map((v) => ({
      value: v._id,
      label: `${v.plateNumber} (${v.type}${v.model ? ` - ${v.model}` : ''})`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage customer profiles, contact info, and associated vehicles.</p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" icon={Plus}>
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <Button onClick={fetchData} variant="secondary" icon={RefreshCw} size="sm">
          Refresh
        </Button>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Customers...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center my-6">
          <p className="text-rose-800 font-semibold mb-2">Error Loading Customers</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchData} variant="danger">
            Retry
          </Button>
        </div>
      ) : (
        <CustomerTable customers={filteredCustomers} onEdit={handleOpenEdit} onDelete={handleDelete} />
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Profile' : 'Create New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Alice Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +1-555-0101"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. alice@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Address"
            placeholder="e.g. 123 Main St, Cityville"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Select
            label="Associated Vehicle"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            options={vehicleOptions}
          />

          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
