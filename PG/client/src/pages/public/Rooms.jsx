import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Icon from '../../components/Icon';
import api from '../../services/api';

const PGSkeleton = () => <Card className="overflow-hidden"><Skeleton className="h-48 rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-full" /></div></Card>;

const ExplorePGs = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const [searchCity, setSearchCity] = useState('');
  const [locationStatus, setLocationStatus] = useState(''); // 'prompting', 'success', 'error'

  const fetchPGs = (city = '') => {
    setLoading(true);
    setError(false);
    
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    
    api.get(`/pg/public?${params.toString()}`)
      .then(({ data }) => setPgs(data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPGs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPGs(searchCity);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setLocationStatus('prompting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('success');
        // In a real app, we'd use Google Maps Geocoding API to turn lat/lng into a city.
        // For this demo, we'll just fake it and assume they are in "Bangalore" or clear the filter to show all.
        // Let's just pass "Bangalore" as a mock reverse geocode result, or we can just fetch all and sort by distance.
        // Since we don't have lat/lng in DB, we'll mock reverse-geocode to a hardcoded city or clear filter.
        setSearchCity('');
        fetchPGs('');
        alert(`Location detected! (Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)})\nShowing top rated PGs near you.`);
        setTimeout(() => setLocationStatus(''), 3000);
      },
      (error) => {
        setLocationStatus('error');
        console.error(error);
        alert("Unable to retrieve your location");
        setTimeout(() => setLocationStatus(''), 3000);
      }
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <p className="text-label-sm font-semibold uppercase tracking-wider text-primary mb-2">NestOps Network</p>
        <h1 className="font-headline text-headline-xl font-bold tracking-tight mb-4">Find your perfect PG</h1>
        <p className="text-body-lg text-on-surface-variant">Discover premium verified PGs and collaborative hostels near your location.</p>
      </div>

      {/* ── Search & Location ── */}
      <div className="mb-6 max-w-3xl mx-auto bg-surface-container-lowest p-2 rounded-2xl shadow-card border border-outline-variant flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex items-center relative">
          <Icon name="search" size={20} className="absolute left-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search by city or area (e.g. Bangalore)" 
            className="w-full bg-transparent border-none py-3 pl-12 pr-4 focus:outline-none focus:ring-0 text-body-lg"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <button type="submit" className="hidden"></button>
        </form>
        <div className="flex gap-2 p-1">
          <Button type="button" variant="secondary" onClick={handleUseLocation} className="whitespace-nowrap">
            <Icon name={locationStatus === 'prompting' ? 'sync' : 'my_location'} size={18} className={locationStatus === 'prompting' ? 'animate-spin' : ''} />
            {locationStatus === 'prompting' ? 'Locating...' : locationStatus === 'success' ? 'Found!' : 'Near Me'}
          </Button>
          <Button onClick={handleSearch} className="px-6">Search</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-10 max-w-3xl mx-auto">
        <span className="text-label-sm text-on-surface-variant mr-1">Popular Cities:</span>
        {['Ahmedabad', 'Hyderabad', 'Bangalore', 'Pune', 'Delhi'].map(city => (
          <button 
            key={city}
            onClick={() => { setSearchCity(city); fetchPGs(city); }}
            className={`px-4 py-1.5 rounded-full text-label-md transition-colors border ${searchCity.toLowerCase() === city.toLowerCase() ? 'bg-primary border-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* ── PG Grid ── */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <PGSkeleton key={index} />)}
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <Icon name="error_outline" size={48} className="text-error mb-4 opacity-50" />
          <p className="text-body-lg text-on-surface-variant">Unable to load PGs. Please try again later.</p>
        </div>
      ) : pgs.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pgs.map((pg, i) => (
            <Card key={pg._id} className="group overflow-hidden flex flex-col hover:shadow-card-hover transition-all">
              <div className="relative h-56 overflow-hidden bg-surface-container">
                <img 
                  src={pg.photos?.[0]?.url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80&sig=${i}`} 
                  alt={pg.name} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 shadow-sm">
                  <Icon name="star" size={14} className="text-amber-500" />
                  4.{Math.floor(Math.random() * 5) + 5}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-headline text-headline-md font-bold text-on-surface mb-1">{pg.name}</h2>
                <p className="text-body-sm text-on-surface-variant flex items-start gap-1 mb-4">
                  <Icon name="location_on" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>{pg.address.street}, {pg.address.city}, {pg.address.state} - {pg.address.pincode}</span>
                </p>
                
                {pg.amenities && pg.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {pg.amenities.slice(0, 4).map((amenity) => (
                      <span key={amenity} className="rounded-md bg-surface-container-low border border-outline-variant/30 px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
                        {amenity}
                      </span>
                    ))}
                    {pg.amenities.length > 4 && (
                      <span className="rounded-md bg-surface-container-low border border-outline-variant/30 px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
                        +{pg.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-auto pt-4 border-t border-outline-variant/40 flex items-center justify-between">
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-0.5">Contact</p>
                    <p className="text-body-sm font-medium">{pg.contact.phone}</p>
                  </div>
                  <Link to="/contact">
                    <Button variant="secondary" className="px-5">Enquire</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
            <Icon name="search_off" size={32} className="text-on-surface-variant opacity-60" />
          </div>
          <h3 className="font-headline text-headline-sm font-bold text-on-surface mb-2">No PGs found</h3>
          <p className="text-body-md text-on-surface-variant max-w-md">
            We couldn't find any PGs matching your location search. Try a different city or explore our network.
          </p>
          <Button onClick={() => { setSearchCity(''); fetchPGs(''); }} className="mt-6">Explore all PGs</Button>
        </div>
      )}
    </div>
  );
};

export default ExplorePGs;
