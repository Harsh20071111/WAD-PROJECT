import { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import Loader from '../../components/ui/Loader';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';

const ResidentNotices = () => {
  const { subscribeToEvent } = useSocket();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notices');
      if (data.success) {
        setNotices(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch resident notices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    const unsubCreated = subscribeToEvent('itemCreated', (e) => {
      if (e?.data?.type === 'notice') fetchNotices();
    });
    const unsubUpdated = subscribeToEvent('itemUpdated', (e) => {
      if (e?.data?.type === 'notice') fetchNotices();
    });
    const unsubDeleted = subscribeToEvent('itemDeleted', (e) => {
      if (e?.data?.type === 'notice') fetchNotices();
    });
    const unsubData = subscribeToEvent('dataUpdated', (e) => {
      if (e?.data?.type === 'notice') fetchNotices();
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubData();
    };
  }, [subscribeToEvent, fetchNotices]);

  return (
    <div className="flex flex-col w-full space-y-space-lg max-w-3xl">
      <div>
        <h1 className="font-headline font-bold text-headline-xl text-on-surface">Notices & Announcements</h1>
        <p className="text-body-md text-on-surface-variant">Live updates and official announcements from management</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <Loader text="Loading notices..." />
        ) : notices.length > 0 ? (
          notices.map((n) => (
            <div key={n._id} className="section-card hover:shadow-card-hover transition-shadow">
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.isUrgent ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-primary'}`}>
                  <Icon name={n.isUrgent ? 'priority_high' : 'campaign'} size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-headline font-semibold text-headline-md text-on-surface">{n.title}</h3>
                    {n.isPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-semibold flex items-center gap-1">
                        <Icon name="push_pin" size={12}/>Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-body-md text-on-surface-variant">{n.body}</p>
                  <p className="text-label-sm text-outline mt-2 flex items-center gap-1">
                    <Icon name="schedule" size={12} />
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="section-card flex flex-col items-center py-16 text-on-surface-variant gap-3">
            <Icon name="campaign" size={48} className="opacity-30" />
            <p className="text-body-md">No notices at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentNotices;
