import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';
import { Star } from 'lucide-react';

const MOCK = [
  { _id: '1', resident: 'Priya Sharma', type: 'COMPLAINT_FEEDBACK', rating: 5, comment: 'Issue was resolved very quickly. Happy with the service!', createdAt: '2026-10-01' },
  { _id: '2', resident: 'Arjun Mehta', type: 'GENERAL', rating: 4, comment: 'PG is clean and well maintained. WiFi could be better.', createdAt: '2026-09-28' },
  { _id: '3', resident: 'Priya Sharma', type: 'GENERAL', rating: 3, comment: 'Common area needs more attention from staff.', createdAt: '2026-09-20' },
];

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} fill={i < rating ? 'currentColor' : 'none'} className={i < rating ? 'text-secondary' : 'text-outline-variant'} />
    ))}
    <span className="text-numeric text-on-surface font-bold ml-1">{rating}</span>
  </div>
);

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching feedback data
    const timer = setTimeout(() => {
      setFeedback(MOCK);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const avgRating = feedback.length 
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : "0.0";

  const columns = [
    {
      key: 'resident', label: 'Resident',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-label-sm font-bold">{v.charAt(0)}</div>
          <span className="font-medium text-on-surface text-body-sm">{v}</span>
        </div>
      ),
    },
    {
      key: 'type', label: 'Type',
      render: (v) => (
        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm font-medium">
          {v === 'COMPLAINT_FEEDBACK' ? 'Complaint' : 'General'}
        </span>
      ),
    },
    { key: 'rating', label: 'Rating', render: (v) => <Stars rating={v} /> },
    { key: 'comment', label: 'Comment', render: (v) => <span className="text-on-surface-variant text-body-sm italic">"{v}"</span> },
    {
      key: 'createdAt', label: 'Date',
      render: (v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div>
        <h1 className="font-headline font-bold text-headline-xl text-on-surface">Resident Feedback</h1>
        <p className="text-body-md text-on-surface-variant">Ratings and comments from residents</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-space-md">
        <StatCard title="Average Rating" value={<span className="flex items-center gap-2">{avgRating} <Stars rating={Math.round(Number(avgRating))} /></span>} icon="star" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-fixed" />
        <StatCard title="Total Feedback" value={feedback.length} icon="reviews" iconBg="bg-surface-container" iconColor="text-primary" />
        <StatCard title="5-Star Reviews" value={feedback.filter((f) => f.rating === 5).length} icon="sentiment_very_satisfied" iconBg="bg-primary-fixed" iconColor="text-on-primary-fixed-variant" />
      </div>

      <div className="section-card">
        <DataTable columns={columns} data={feedback} loading={loading} emptyMessage="No feedback yet" emptyIcon="reviews" />
      </div>
    </div>
  );
};

export default Feedback;
