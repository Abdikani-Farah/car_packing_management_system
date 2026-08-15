import React from 'react';
import Table from './Table.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function PaymentTable({ payments = [] }) {
  const headers = ['Payment ID', 'Vehicle', 'Customer', 'Space', 'Amount', 'Method', 'Date', 'Status'];

  return (
    <Table headers={headers} emptyMessage="No payment records found.">
      {payments.map((p) => {
        const vehiclePlate = p.vehicle?.plateNumber || p.parkingSession?.vehicle?.plateNumber || 'N/A';
        const customerName = p.customer?.name || p.parkingSession?.customer?.name || 'Walk-in Customer';
        const spaceNum = p.parkingSession?.parkingSpace?.spaceNumber || 'N/A';
        const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A';

        return (
          <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4 font-mono text-xs text-slate-500">#{p._id.substring(p._id.length - 8)}</td>
            <td className="px-6 py-4 font-bold text-slate-900">{vehiclePlate}</td>
            <td className="px-6 py-4 text-slate-700">{customerName}</td>
            <td className="px-6 py-4 text-slate-700">{spaceNum}</td>
            <td className="px-6 py-4 font-bold text-emerald-600">${p.amount?.toFixed(2) || '0.00'}</td>
            <td className="px-6 py-4 text-slate-700 font-medium">{p.paymentMethod}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{dateStr}</td>
            <td className="px-6 py-4">
              <StatusBadge status={p.status} />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
