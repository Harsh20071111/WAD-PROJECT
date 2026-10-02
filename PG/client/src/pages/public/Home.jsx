import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Icon from '../../components/Icon';
import api from '../../services/api';

const highlights = [
  ['bed', 'Move-in ready rooms', 'Furnished single, double and triple sharing rooms.'],
  ['shield', 'Managed & secure', 'CCTV, support staff and verified resident access.'],
  ['wifi', 'Reliable essentials', 'Wi-Fi, backup power, housekeeping and hot water.'],
];

const Home = () => {
  const [stats, setStats] = useState(null); // null = loading
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/rooms/public')
      .then(({ data }) => {
        const rooms = data.data || [];
        const totalRooms = rooms.length;
        const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0);
        const availableBeds = rooms.reduce((sum, r) => sum + r.availableBeds, 0);
        const occupied = totalBeds - availableBeds;
        const cheapestAvailable = rooms
          .filter((r) => r.availableBeds > 0)
          .reduce((min, r) => Math.min(min, r.rent), Infinity);

        setStats({
          totalRooms,
          totalBeds,
          occupied,
          availableBeds,
          occupancyPct: totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0,
          cheapestRent: cheapestAvailable === Infinity ? null : cheapestAvailable,
        });
      })
      .catch(() => setError(true));
  }, []);

  const loading = !stats && !error;
  const dash = '—';

  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-surface-container-low px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-fixed/50 px-3 py-1 text-label-sm font-semibold text-on-primary-fixed-variant"><span className="h-2 w-2 rounded-full bg-primary" />Greenwood Luxury PG · Navrangpura</div>
            <h1 className="max-w-2xl font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl lg:text-6xl">A better managed place to call home.</h1>
            <p className="mt-5 max-w-xl text-body-lg text-on-surface-variant">Comfortable rooms, clear rent records and a resident experience that stays organised from move-in to move-out.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/rooms"><Button icon="search">Check Available Rooms</Button></Link><Link to="/contact"><Button variant="secondary" icon="phone">Talk to the property team</Button></Link></div>

            {/* ── Stats tiles ── */}
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-5">
              <div>
                {loading ? <Skeleton className="h-8 w-12" /> : <p className="font-headline text-2xl font-bold tabular-nums">{error ? dash : stats.totalRooms}</p>}
                <p className="text-label-sm text-on-surface-variant">Rooms managed</p>
              </div>
              <div>
                {loading ? <Skeleton className="h-8 w-12" /> : <p className="font-headline text-2xl font-bold tabular-nums">{error ? dash : stats.totalBeds}</p>}
                <p className="text-label-sm text-on-surface-variant">Total beds</p>
              </div>
              <div>
                {loading ? <Skeleton className="h-8 w-12" /> : <p className="font-headline text-2xl font-bold tabular-nums">{error ? dash : stats.occupied}</p>}
                <p className="text-label-sm text-on-surface-variant">Occupied today</p>
              </div>
            </div>
          </div>

          {/* ── Property snapshot card ── */}
          <Card className="overflow-hidden">
            <div className="flex h-64 flex-col justify-between bg-primary p-6 text-on-primary sm:h-72">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label-sm uppercase tracking-wider text-on-primary/70">Property snapshot</p>
                  <p className="mt-2 font-headline text-2xl font-bold">Greenwood Luxury PG</p>
                </div>
                <span className="rounded-lg bg-white/10 p-2"><Icon name="building" size={24} /></span>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-label-sm">
                  <span>Occupancy</span>
                  {loading ? <Skeleton className="h-4 w-16 bg-white/20" /> : <span className="font-semibold">{error ? dash : `${stats.occupancyPct}%`}</span>}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-primary-fixed transition-all duration-700"
                    style={{ width: loading || error ? '0%' : `${stats.occupancyPct}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/15 bg-white/10 p-3">
                    <p className="text-label-sm text-on-primary/70">From</p>
                    {loading ? <Skeleton className="mt-1 h-6 w-20 bg-white/20" /> : (
                      <p className="mt-1 font-headline text-xl font-bold">
                        {error || !stats.cheapestRent ? dash : (<>₹{stats.cheapestRent.toLocaleString('en-IN')}<span className="text-body-sm font-normal"> /mo</span></>)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg border border-white/15 bg-white/10 p-3">
                    <p className="text-label-sm text-on-primary/70">Availability</p>
                    {loading ? <Skeleton className="mt-1 h-6 w-20 bg-white/20" /> : (
                      <p className="mt-1 font-headline text-xl font-bold">
                        {error ? dash : `${stats.availableBeds} bed${stats.availableBeds !== 1 ? 's' : ''}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><div className="max-w-xl"><p className="text-label-sm font-semibold uppercase tracking-wider text-primary">Designed for everyday living</p><h2 className="mt-2 font-headline text-3xl font-bold tracking-tight">The essentials are handled.</h2><p className="mt-3 text-body-lg text-on-surface-variant">You get a well-maintained room and a simple way to stay on top of rent, notices and service requests.</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{highlights.map(([icon, title, desc]) => <Card key={title} className="p-5"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed/60 text-primary"><Icon name={icon} size={20} /></div><h3 className="font-headline text-headline-md font-semibold">{title}</h3><p className="mt-2 text-body-md text-on-surface-variant">{desc}</p></Card>)}</div></section>

      <section className="border-y border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><p className="font-headline text-xl font-semibold">Looking for a room this month?</p><p className="mt-1 text-body-md text-on-surface-variant">See live availability or send the team your move-in details.</p></div><Link to="/rooms"><Button icon="arrow_forward">View rooms</Button></Link></div></section>
    </div>
  );
};

export default Home;
