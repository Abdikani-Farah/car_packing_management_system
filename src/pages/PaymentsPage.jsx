import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService.js';
import PaymentTable from '../components/PaymentTable.jsx';
import Button from '../components/Button.jsx';
import Select from '../components/Select.jsx';
import { Search, DollarSign, RefreshCw } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paymentService.getAll();
      setPayments(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch payment records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    const plate = p.vehicle?.plateNumber?.toLowerCase() || p.parkingSession?.vehicle?.plateNumber?.toLowerCase() || '';
    const cust = p.customer?.name?.toLowerCase() || p.parkingSession?.customer?.name?.toLowerCase() || '';
    const id = p._id?.toLowerCase() || '';

    const matchesSearch = plate.includes(q) || cust.includes(q) || id.includes(q);
    const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalCollected = filteredPayments
    .filter((p) => p.status === 'Paid')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments Ledger</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track financial transactions, payment channels, and receipts.</p>
        </div>
        <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-900 font-bold text-sm">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <span>Total Filtered Revenue: ${totalCollected.toFixed(2)}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search plate, customer, or payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            options={['All', 'Cash', 'Card', 'Mobile Money']}
            className="w-36"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={['All', 'Paid', 'Pending']}
            className="w-32"
          />
          <Button onClick={fetchPayments} variant="secondary" icon={RefreshCw} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Payment Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Payments Ledger...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center my-6">
          <p className="text-rose-800 font-semibold mb-2">Error Loading Payments</p>
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchPayments} variant="danger">
            Retry
          </Button>
        </div>
      ) : (
        <PaymentTable payments={filteredPayments} />
      )}
    </div>
  );
}
