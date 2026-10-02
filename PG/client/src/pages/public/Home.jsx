import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Icon from '../../components/Icon';

const highlights = [
  ['bed', 'Move-in ready rooms', 'Furnished single, double and triple sharing rooms.'],
  ['shield', 'Managed & secure', 'CCTV, support staff and verified resident access.'],
  ['wifi', 'Reliable essentials', 'Wi-Fi, backup power, housekeeping and hot water.'],
];

const Home = () => (
  <div className="bg-background">
    <section className="border-b border-slate-200 bg-surface-container-low px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-fixed/50 px-3 py-1 text-label-sm font-semibold text-on-primary-fixed-variant"><span className="h-2 w-2 rounded-full bg-primary" />Greenwood Luxury PG · Navrangpura</div>
          <h1 className="max-w-2xl font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl lg:text-6xl">A better managed place to call home.</h1>
          <p className="mt-5 max-w-xl text-body-lg text-on-surface-variant">Comfortable rooms, clear rent records and a resident experience that stays organised from move-in to move-out.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/rooms"><Button icon="search">Check Available Rooms</Button></Link><Link to="/contact"><Button variant="secondary" icon="phone">Talk to the property team</Button></Link></div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-5"><div><p className="font-headline text-2xl font-bold tabular-nums">Live</p><p className="text-label-sm text-on-surface-variant">Rooms managed</p></div><div><p className="font-headline text-2xl font-bold tabular-nums">Live</p><p className="text-label-sm text-on-surface-variant">Total beds</p></div><div><p className="font-headline text-2xl font-bold tabular-nums">Live</p><p className="text-label-sm text-on-surface-variant">Occupied today</p></div></div>
        </div>
        <Card className="overflow-hidden">
          <div className="flex h-64 flex-col justify-between bg-primary p-6 text-on-primary sm:h-72"><div className="flex items-start justify-between"><div><p className="text-label-sm uppercase tracking-wider text-on-primary/70">Property snapshot</p><p className="mt-2 font-headline text-2xl font-bold">Greenwood Luxury PG</p></div><span className="rounded-lg bg-white/10 p-2"><Icon name="building" size={24} /></span></div><div><div className="mb-2 flex items-center justify-between text-label-sm"><span>Occupancy</span><span className="font-semibold">Live inventory after sign in</span></div><div className="h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full w-1/2 rounded-full bg-primary-fixed" /></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg border border-white/15 bg-white/10 p-3"><p className="text-label-sm text-on-primary/70">From</p><p className="mt-1 font-headline text-xl font-bold">Contact<span className="text-body-sm font-normal"> admin</span></p></div><div className="rounded-lg border border-white/15 bg-white/10 p-3"><p className="text-label-sm text-on-primary/70">Availability</p><p className="mt-1 font-headline text-xl font-bold">Live</p></div></div></div></div>
        </Card>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><div className="max-w-xl"><p className="text-label-sm font-semibold uppercase tracking-wider text-primary">Designed for everyday living</p><h2 className="mt-2 font-headline text-3xl font-bold tracking-tight">The essentials are handled.</h2><p className="mt-3 text-body-lg text-on-surface-variant">You get a well-maintained room and a simple way to stay on top of rent, notices and service requests.</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{highlights.map(([icon, title, desc]) => <Card key={title} className="p-5"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed/60 text-primary"><Icon name={icon} size={20} /></div><h3 className="font-headline text-headline-md font-semibold">{title}</h3><p className="mt-2 text-body-md text-on-surface-variant">{desc}</p></Card>)}</div></section>

    <section className="border-y border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><p className="font-headline text-xl font-semibold">Looking for a room this month?</p><p className="mt-1 text-body-md text-on-surface-variant">See live availability or send the team your move-in details.</p></div><Link to="/rooms"><Button icon="arrow_forward">View rooms</Button></Link></div></section>
  </div>
);

export default Home;
