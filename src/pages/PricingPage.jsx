import React, { useState, useEffect } from 'react';
import { pricingService } from '../services/pricingService.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import { DollarSign, Edit3, RefreshCw, Car, Bike, Truck, ShieldAlert } from 'lucide-react';

export default function PricingPage() {
  const [pricingList, setPricingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [hourlyRate, setHourlyRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPricing = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await pricingService.getAll();
      setPricingList(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch pricing configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleOpenEdit = (p) => {
    setSelectedPricing(p);
    setHourlyRate(p.hourlyRate);
    setFormError('');
    setModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');

    const numRate = parseFloat(hourlyRate);
    if (isNaN(numRate) || numRate < 0) {
      setFormError('Please enter a valid non-negative rate.');
      return;
    }

    setSubmitting(true);
    try {
      await pricingService.update(selectedPricing._id, { hourlyRate: numRate });
      setModalOpen(false);
      fetchPricing();
    } catch (err) {
      setFormError(err.message || 'Failed to update pricing');
    } finally {
      setSubmitting(false);
    }
  };

  const getVehicleIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'motorcycle':
        return <Bike className="w-6 h-6 text-indigo-600" />;
      case 'truck':
      case 'van':
        return <Truck className="w-6 h-6 text-indigo-600" />;
      default:
        return <Car className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Parking Rates & Pricing</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure hourly billing rates per vehicle category.</p>
        </div>
        <Button onClick={fetchPricing} variant="secondary" icon={RefreshCw} size="sm">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Pricing Configurations...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-800 font-semibold mb-2">Error Loading Pricing</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchPricing} variant="danger">
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingList.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    {getVehicleIcon(p.vehicleType)}
                  </div>
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Rate"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-lg text-slate-900">{p.vehicleType}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hourly Billing Rate</p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-indigo-600">${p.hourlyRate.toFixed(2)}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ hour</span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <Button
                  onClick={() => handleOpenEdit(p)}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  icon={Edit3}
                >
                  Adjust Rate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Update Hourly Rate — ${selectedPricing?.vehicleType || ''}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Hourly Rate ($ USD)"
            type="number"
            step="0.5"
            min="0"
            placeholder="e.g. 2.00"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
          />

          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving Rate...' : 'Save New Rate'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
