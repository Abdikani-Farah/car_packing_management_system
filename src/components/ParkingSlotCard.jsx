import React from 'react';
import StatusBadge from './StatusBadge.jsx';
import { Car, Bike, Truck, ShieldCheck, Accessibility, Edit3, Trash2 } from 'lucide-react';

export default function ParkingSlotCard({ space, onEdit, onDelete, onAction }) {
  const getTypeIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'motorcycle':
        return <Bike className="w-5 h-5 text-indigo-600" />;
      case 'truck':
      case 'van':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'vip':
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
      case 'disabled':
        return <Accessibility className="w-5 h-5 text-blue-500" />;
      default:
        return <Car className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getCardBorder = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'available':
        return 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300';
      case 'occupied':
        return 'border-rose-200 bg-rose-50/20 hover:border-rose-300';
      case 'reserved':
        return 'border-amber-200 bg-amber-50/20 hover:border-amber-300';
      default:
        return 'border-slate-200 bg-slate-50/40 hover:border-slate-300';
    }
  };

  return (
    <div className={`rounded-xl border ${getCardBorder(space.status)} p-4 shadow-sm transition-all flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getTypeIcon(space.type)}
            <span className="font-bold text-lg text-slate-900">{space.spaceNumber}</span>
          </div>
          <StatusBadge status={space.status} />
        </div>

        <div className="text-xs text-slate-500 space-y-1 mb-4">
          <p><span className="font-semibold text-slate-700">Location:</span> {space.floor}</p>
          <p><span className="font-semibold text-slate-700">Type:</span> {space.type}</p>
          {space.currentVehicle && (
            <p className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 inline-block">
              Parked: {space.currentVehicle.plateNumber || 'Occupied'}
            </p>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {onEdit && (
            <button
              onClick={() => onEdit(space)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Edit Space"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(space)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Delete Space"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {onAction && space.status === 'Available' && (
          <button
            onClick={() => onAction(space, 'entry')}
            className="text-xs font-semibold px-2.5 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Park Here
          </button>
        )}

        {onAction && space.status === 'Occupied' && (
          <button
            onClick={() => onAction(space, 'exit')}
            className="text-xs font-semibold px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors shadow-sm"
          >
            Exit Vehicle
          </button>
        )}
      </div>
    </div>
  );
}
