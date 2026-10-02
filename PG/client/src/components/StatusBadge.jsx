import Icon from './Icon';

const STATUS_MAP = {
  // Payment statuses
  PAID: { label: 'Paid', cls: 'badge-success', icon: 'check_circle' },
  PENDING: { label: 'Pending', cls: 'badge-warning', icon: 'schedule' },
  OVERDUE: { label: 'Overdue', cls: 'badge-error', icon: 'warning' },
  PARTIALLY_PAID: { label: 'Partial', cls: 'badge-warning', icon: 'pending' },
  FAILED: { label: 'Failed', cls: 'badge-error', icon: 'cancel' },

  // Complaint statuses
  NEW: { label: 'New', cls: 'badge-info', icon: 'fiber_new' },
  ASSIGNED: { label: 'Assigned', cls: 'badge-info', icon: 'assignment_ind' },
  IN_PROGRESS: { label: 'In Progress', cls: 'badge-warning', icon: 'autorenew' },
  ON_HOLD: { label: 'On Hold', cls: 'badge-neutral', icon: 'pause_circle' },
  RESOLVED: { label: 'Resolved', cls: 'badge-success', icon: 'task_alt' },
  CLOSED: { label: 'Closed', cls: 'badge-neutral', icon: 'lock' },

  // Resident statuses
  ACTIVE: { label: 'Active', cls: 'badge-success', icon: 'how_to_reg' },
  NOTICE_PERIOD: { label: 'Notice Period', cls: 'badge-warning', icon: 'notification_important' },
  CHECKED_OUT: { label: 'Checked Out', cls: 'badge-neutral', icon: 'logout' },
  PENDING_VERIFICATION: { label: 'Pending KYC', cls: 'badge-warning', icon: 'pending' },

  // Priority
  LOW: { label: 'Low', cls: 'badge-neutral', icon: 'south' },
  MEDIUM: { label: 'Medium', cls: 'badge-info', icon: 'remove' },
  HIGH: { label: 'High', cls: 'badge-warning', icon: 'north' },
  URGENT: { label: 'Urgent', cls: 'badge-error', icon: 'priority_high' },

  // Enquiry
  CONTACTED: { label: 'Contacted', cls: 'badge-info', icon: 'call' },
  CONVERTED: { label: 'Converted', cls: 'badge-success', icon: 'person_add' },

  // Document
  UPLOADED: { label: 'Uploaded', cls: 'badge-info', icon: 'upload_file' },
  VERIFIED: { label: 'Verified', cls: 'badge-success', icon: 'verified' },
  REJECTED: { label: 'Rejected', cls: 'badge-error', icon: 'cancel' },

  // Bed
  AVAILABLE: { label: 'Available', cls: 'badge-success', icon: 'hotel' },
  OCCUPIED: { label: 'Occupied', cls: 'badge-neutral', icon: 'bed' },
};

const StatusBadge = ({ status, showIcon = true }) => {
  const cfg = STATUS_MAP[status] || { label: status, cls: 'badge-neutral', icon: 'info' };
  return (
    <span className={`badge ${cfg.cls}`}>
      {showIcon && (
        <Icon name={cfg.icon} size={12} />
      )}
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
