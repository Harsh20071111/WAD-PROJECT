import React from 'react';
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle } from 'lucide-react';

const statusConfig = {
  placed: {
    label: 'Placed',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: CheckCircle2,
  },
  shipped: {
    label: 'Shipped',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: PackageCheck,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
};

const OrderStatusBadge = ({ status = 'placed' }) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig.placed;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
