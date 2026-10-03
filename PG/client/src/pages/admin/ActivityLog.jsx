import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import api from "../../services/api";

const ActivityLog = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/notifications');
        const acts = (data.data || []).map(n => {
          let tone = 'bg-sky-100';
          if (n.type === 'SLA_BREACH') tone = 'bg-rose-100';
          else if (n.type === 'PAYMENT') tone = 'bg-primary-fixed';
          else if (n.type === 'NOTICE') tone = 'bg-amber-100';
          return {
            name: n.title,
            action: n.message,
            time: new Date(n.createdAt).toLocaleString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            color: tone
          };
        });
        setActivity(acts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="All system alerts, payments, complaints, and notices"
      />
      <Card className="p-5 sm:p-6">
        {loading ? (
          <p className="text-body-sm text-on-surface-variant">Loading...</p>
        ) : activity.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {activity.map((item, idx) => (
              <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <Avatar name={item.name} size="md" className={item.color} />
                <div className="min-w-0 flex-1">
                  <p className="text-body-md">
                    <span className="font-semibold block">{item.name}</span>
                    <span className="text-on-surface-variant">{item.action}</span>
                  </p>
                  <p className="mt-1 text-label-sm text-outline">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant">No activity logs found.</p>
        )}
      </Card>
    </div>
  );
};

export default ActivityLog;
