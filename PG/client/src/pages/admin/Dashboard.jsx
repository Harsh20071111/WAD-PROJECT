import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Avatar from "../../components/ui/Avatar";
import Icon from "../../components/Icon";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";

const Metric = ({ label, value, detail, trend, icon, tone }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <p className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <span className={`rounded-lg p-2 ${tone}`}>
        <Icon name={icon} size={18} />
      </span>
    </div>
    <div className="mt-4 flex items-end gap-2">
      <p className="font-headline text-2xl font-bold tabular-nums">{value}</p>
      {trend && (
        <span className="mb-1 flex items-center gap-1 text-label-sm font-semibold text-emerald-700">
          <Icon name="arrow_upward" size={13} />
          {trend}
        </span>
      )}
    </div>
    <p className="mt-2 text-label-sm text-on-surface-variant">{detail}</p>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [sumRes, actRes] = await Promise.all([
          api.get('/pg/summary'),
          api.get('/notifications')
        ]);
        setSummary(sumRes.data.data);
        
        // Map notifications to activity feed format
        const acts = (actRes.data.data || []).slice(0, 5).map(n => {
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
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hub operations center · Live sync"
        title="Property Overview & Operations"
        description="Greenwood Residency · Navrangpura, Ahmedabad"
        actions={
          <Button icon="person_add" onClick={() => navigate('/admin/residents?action=addResident')}>Add resident</Button>
        }
      />
      {loading ? (
        <Loader text="Loading dashboard..." className="py-12" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total occupancy"
          value={summary ? `${summary.occupancy.occupiedBeds} / ${summary.occupancy.totalBeds}` : "..."}
          trend={summary ? `${Math.round((summary.occupancy.occupiedBeds/summary.occupancy.totalBeds)*100 || 0)}%` : null}
          detail={summary ? `${summary.occupancy.availableBeds} beds available` : ""}
          icon="bed"
          tone="bg-primary-fixed/60 text-primary"
        />
        <Metric
          label="Rent collection"
          value={summary ? `₹${summary.collection.collected.toLocaleString()}` : "..."}
          trend={summary ? `${summary.collection.percent}%` : null}
          detail={summary ? `₹${(summary.collection.billed - summary.collection.collected).toLocaleString()} pending` : ""}
          icon="wallet"
          tone="bg-amber-100 text-amber-700"
        />
        <Metric
          label="Active complaints"
          value={summary ? summary.openComplaints : "..."}
          detail="Pending resolution"
          icon="support_agent"
          tone="bg-sky-100 text-sky-700"
        />
        <Metric
          label="KYC verification"
          value={summary ? summary.pendingKyc : "..."}
          detail="Pending document approval"
          icon="shield"
          tone="bg-violet-100 text-violet-700"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_.85fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-headline-md font-semibold">
                Recent activity
              </h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Latest actions and alerts in your PG
              </p>
            </div>
            <button className="text-label-md font-semibold text-primary" onClick={() => navigate('/admin/activity')}>
              View all →
            </button>
          </div>
          <div className="mt-5 divide-y divide-slate-200">
            {activity.length > 0 ? activity.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Avatar name={item.name} size="sm" className={item.color} />
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm">
                    <span className="font-semibold block">{item.name}</span>
                    <span className="text-on-surface-variant">{item.action}</span>
                  </p>
                  <p className="mt-1 text-label-sm text-outline">{item.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-body-sm text-on-surface-variant py-4">No recent activities.</p>
            )}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-headline-md font-semibold">
                Quick actions
              </h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Common operations for today
              </p>
            </div>
            <Icon name="bolt" size={20} className="text-secondary" />
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            <Link
              to="/admin/residents"
              className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-label-md transition-colors hover:bg-surface-container-low"
            >
              <span className="rounded-lg bg-primary-fixed/60 p-2 text-primary">
                <Icon name="person_add" size={17} />
              </span>
              Add resident
            </Link>
            <Link
              to="/admin/rooms"
              className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-label-md transition-colors hover:bg-surface-container-low"
            >
              <span className="rounded-lg bg-sky-100 p-2 text-sky-700">
                <Icon name="bed" size={17} />
              </span>
              Assign bed
            </Link>
            <Link
              to="/admin/notices"
              className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-label-md transition-colors hover:bg-surface-container-low"
            >
              <span className="rounded-lg bg-amber-100 p-2 text-amber-700">
                <Icon name="campaign" size={17} />
              </span>
              New notice
            </Link>
          </div>
        </Card>
      </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
