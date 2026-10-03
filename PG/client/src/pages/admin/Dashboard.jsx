import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Avatar from "../../components/ui/Avatar";
import Icon from "../../components/Icon";

const activity = [
  {
    name: "Jay Shah",
    action: "paid October rent of ₹11,500",
    time: "12 min ago",
    color: "bg-primary-fixed",
  },
  {
    name: "Ramesh Patel",
    action: "updated REQ-1042 to In Progress",
    time: "34 min ago",
    color: "bg-sky-100",
  },
  {
    name: "Priya Mehta",
    action: "uploaded KYC documents",
    time: "1 hr ago",
    color: "bg-amber-100",
  },
  {
    name: "Anand Verma",
    action: "published Wi-Fi downtime notice",
    time: "3 hrs ago",
    color: "bg-violet-100",
  },
];

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
  return (
  <div className="space-y-6">
    <PageHeader
      eyebrow="Hub operations center · Live sync 12:44 PM IST"
      title="Property Overview & Operations"
      description="Greenwood Residency · Navrangpura, Ahmedabad · 4 floors · 32 rooms · 84 total beds"
      actions={
        <>
          <Button variant="secondary" icon="wallet">
            Collect rent
          </Button>
          <Button icon="person_add" onClick={() => navigate('/admin/residents?action=addResident')}>Add resident</Button>
        </>
      }
    />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric
        label="Total occupancy"
        value="76 / 84"
        trend="4.2%"
        detail="8 beds available across Floors 2 and 3"
        icon="bed"
        tone="bg-primary-fixed/60 text-primary"
      />
      <Metric
        label="Rent collection"
        value="₹6,48,000"
        trend="8.4%"
        detail="₹66,000 pending · 8 defaulters"
        icon="wallet"
        tone="bg-amber-100 text-amber-700"
      />
      <Metric
        label="Active complaints"
        value="5"
        detail="2 high priority · Avg. response 38m"
        icon="support_agent"
        tone="bg-sky-100 text-sky-700"
      />
      <Metric
        label="KYC verification"
        value="4"
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
              Latest actions from residents and staff
            </p>
          </div>
          <button className="text-label-md font-semibold text-primary">
            View all →
          </button>
        </div>
        <div className="mt-5 divide-y divide-slate-200">
          {activity.map((item) => (
            <div
              key={item.name + item.action}
              className="flex gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar name={item.name} size="sm" className={item.color} />
              <div className="min-w-0 flex-1">
                <p className="text-body-sm">
                  <span className="font-semibold">{item.name}</span>{" "}
                  {item.action}
                </p>
                <p className="mt-1 text-label-sm text-outline">{item.time}</p>
              </div>
            </div>
          ))}
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
  </div>
  );
};

export default Dashboard;
