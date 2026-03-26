import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, MapPin, Bus, Clock, IndianRupee, ArrowRight, CheckCircle, Loader, RotateCcw, Ticket } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import ToastContainer, { useToast } from '../components/Toast';

const STEPS = ['Search', 'Select Schedule', 'Pick Seat', 'Passenger Details', 'Confirmation'];

// ── Step 1: Route search form ──────────────────────────────────────────────────
function StepSearch({ onResults }) {
  const [form, setForm] = useState({ source: '', destination: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (form.source)      params.append('source', form.source);
      if (form.destination) params.append('destination', form.destination);
      const r = await api.get(`/search/routes?${params}`);
      onResults(r.data.data, form);
    } catch (_err) {
      toast('Failed to search routes', 'err');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    padding: '10px 14px 10px 40px',
    background: 'var(--surface2)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r2)',
    fontSize: '.9rem',
    color: 'var(--text)',
    outline: 'none',
    width: '100%',
    transition: 'border-color .2s',
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Search size={22} color="var(--accent)"/> Find Your Route
      </h2>
      <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: '1.5rem' }}>
        Search available bus routes by source and destination.
      </p>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}/>
          <input
            type="text" placeholder="From (e.g. Hyderabad)"
            value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }}/>
          <input
            type="text" placeholder="To (e.g. Bangalore)"
            value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button type="submit" disabled={loading} className="btn primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', fontSize: '.92rem' }}>
          {loading ? <><Loader size={15}/> Searching…</> : <><Search size={15}/> Search Routes</>}
        </button>
      </form>
    </div>
  );
}

StepSearch.propTypes = {
  onResults: PropTypes.func.isRequired,
};

// ── Step 2: Route & schedule selection ────────────────────────────────────────
function StepSchedules({ routes, filters, onSelectSchedule }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fareFilter, setFareFilter] = useState({ min: '', max: '' });
  const toast = useToast();

  const loadSchedules = async (route) => {
    setSelectedRoute(route);
    setLoading(true);
    try {
      const params = new URLSearchParams({ route_id: route.route_id });
      if (fareFilter.min) params.append('min_fare', fareFilter.min);
      if (fareFilter.max) params.append('max_fare', fareFilter.max);
      const r = await api.get(`/search/schedules?${params}`);
      setSchedules(r.data.data);
    } catch (_err) {
      toast('Failed to load schedules', 'err');
    } finally { setLoading(false); }
  };

  if (!routes.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
        <Bus size={40} style={{ marginBottom: '1rem', opacity: .4 }}/>
        <p style={{ fontWeight: 600, marginBottom: '.5rem' }}>No routes found</p>
        <p style={{ fontSize: '.82rem' }}>Try different source or destination cities.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
          {routes.length} route{routes.length !== 1 ? 's' : ''} found
          {filters.source && filters.destination && <span style={{ color: 'var(--text2)', fontWeight: 500 }}> — {filters.source} → {filters.destination}</span>}
        </h2>
        {/* Fare filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.78rem', color: 'var(--text2)' }}>Fare filter:</span>
          <input type="number" placeholder="Min ₹" value={fareFilter.min}
            onChange={e => setFareFilter(f => ({ ...f, min: e.target.value }))}
            style={{ width: '80px', padding: '5px 8px', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', fontSize: '.82rem', background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}/>
          <input type="number" placeholder="Max ₹" value={fareFilter.max}
            onChange={e => setFareFilter(f => ({ ...f, max: e.target.value }))}
            style={{ width: '80px', padding: '5px 8px', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', fontSize: '.82rem', background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}/>
        </div>
      </div>

      {/* Route list */}
      {routes.map(route => (
        <div key={route.route_id}
          style={{ background: 'var(--surface)', border: `1.5px solid ${selectedRoute?.route_id === route.route_id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--r)', boxShadow: 'var(--sh1)', overflow: 'hidden' }}>
          {/* Route header */}
          <div style={{ padding: '12px 16px', background: selectedRoute?.route_id === route.route_id ? 'var(--accent-lite)' : 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', cursor: 'pointer' }}
            onClick={() => loadSchedules(route)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 800, fontSize: '.95rem' }}>{route.source}</span>
              <ArrowRight size={14} color="var(--text3)"/>
              <span style={{ fontWeight: 800, fontSize: '.95rem' }}>{route.destination}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '.78rem', color: 'var(--text2)' }}>
              <span>📍 {route.distance_km} km</span>
              <span>⏱ {route.duration_hrs} hrs</span>
              <span className={`chip ${route.status}`}>{route.status}</span>
            </div>
          </div>

          {/* Schedules for selected route */}
          {selectedRoute?.route_id === route.route_id && (
            <div style={{ padding: '12px 16px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text2)', fontSize: '.85rem' }}>
                  <Loader size={16}/> Loading schedules…
                </div>
              ) : schedules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text2)', fontSize: '.85rem' }}>
                  No available schedules for this route.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {schedules.map(s => (
                    <div key={s.schedule_id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'Fira Code',monospace", fontSize: '.82rem' }}>
                          <Clock size={13}/> {s.departure} → {s.arrival}
                        </div>
                        <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>
                          {s.vehicle_no} ({s.vehicle_type})
                        </div>
                        <span style={{ fontSize: '.75rem', color: s.seats_left > 5 ? 'var(--green)' : s.seats_left > 0 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>
                          {s.seats_left > 0 ? `${s.seats_left} seats left` : 'Full'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <IndianRupee size={14}/>{s.fare}
                        </span>
                        <button
                          className="btn primary"
                          disabled={s.seats_left <= 0}
                          style={{ fontSize: '.8rem', padding: '6px 14px' }}
                          onClick={() => onSelectSchedule(s, route)}>
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

StepSchedules.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.shape({
    route_id:     PropTypes.number.isRequired,
    source:       PropTypes.string,
    destination:  PropTypes.string,
    distance_km:  PropTypes.number,
    duration_hrs: PropTypes.number,
    status:       PropTypes.string,
  })).isRequired,
  filters:          PropTypes.shape({
    source:      PropTypes.string,
    destination: PropTypes.string,
  }),
  onSelectSchedule: PropTypes.func.isRequired,
};

// ── Step 3: Seat selection ─────────────────────────────────────────────────────
function StepSeat({ schedule, route, onSelectSeat }) {
  const [seatData, setSeatData] = useState(null);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get(`/search/seats/${schedule.schedule_id}`)
      .then(r => setSeatData(r.data))
      .catch(() => toast('Failed to load seat map', 'err'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule.schedule_id]);

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>Select Your Seat</h2>
      <p style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: '1rem' }}>
        {route.source} → {route.destination} &nbsp;·&nbsp; {schedule.departure} – {schedule.arrival} &nbsp;·&nbsp;
        <strong>₹{schedule.fare}</strong>
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}><Loader size={20}/></div>
      ) : seatData ? (
        <>
          <SeatMap
            capacity={seatData.capacity}
            takenSeats={seatData.takenSeats}
            selectedSeat={selected}
            onSelect={setSelected}
          />
          <button
            className="btn primary"
            disabled={!selected}
            style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', width: '100%', justifyContent: 'center' }}
            onClick={() => onSelectSeat(selected)}>
            Continue with Seat {selected} <ArrowRight size={14}/>
          </button>
        </>
      ) : null}
    </div>
  );
}

StepSeat.propTypes = {
  schedule: PropTypes.shape({
    schedule_id: PropTypes.number.isRequired,
    departure:   PropTypes.string,
    arrival:     PropTypes.string,
    fare:        PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  route: PropTypes.shape({
    source:      PropTypes.string,
    destination: PropTypes.string,
  }).isRequired,
  onSelectSeat: PropTypes.func.isRequired,
};

// ── Step 4: Passenger details form ────────────────────────────────────────────
function StepPassenger({ schedule, route, seat, user, onBook }) {
  const [form, setForm] = useState({
    passenger_name:  user?.name || '',
    passenger_phone: '',
    passenger_email: user?.email || '',
    passenger_city:  '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.passenger_name.trim()) { setError('Name is required.'); return; }
    if (!/^[6-9]\d{9}$/.test(form.passenger_phone)) { setError('Enter a valid 10-digit mobile number.'); return; }

    setLoading(true);
    try {
      const r = await api.post('/user/book', {
        schedule_id:      schedule.schedule_id,
        seat_no:          seat,
        passenger_name:   form.passenger_name.trim(),
        passenger_phone:  form.passenger_phone.trim(),
        passenger_email:  form.passenger_email.trim() || undefined,
        passenger_city:   form.passenger_city.trim() || undefined,
      });
      toast('🎉 Booking confirmed!', 'ok');
      onBook(r.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    padding: '9px 12px',
    background: 'var(--surface2)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r2)',
    fontSize: '.88rem',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color .2s',
    width: '100%',
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '.25rem' }}>Passenger Details</h2>
      <p style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>
        {route.source} → {route.destination} &nbsp;·&nbsp; Seat <strong>{seat}</strong> &nbsp;·&nbsp; <strong>₹{schedule.fare}</strong>
      </p>

      {error && (
        <div style={{ background: 'var(--red-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--r2)', padding: '10px 14px', marginBottom: '1rem', fontSize: '.82rem', color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
        {[
          { key: 'passenger_name',  label: 'Full Name',    type: 'text',  placeholder: 'e.g. Rahul Sharma', required: true },
          { key: 'passenger_phone', label: 'Mobile Number', type: 'tel',  placeholder: '10-digit mobile', required: true },
          { key: 'passenger_email', label: 'Email (optional)', type: 'email', placeholder: 'you@email.com' },
          { key: 'passenger_city',  label: 'City',         type: 'text',  placeholder: 'Your city' },
        ].map(f => (
          <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--text2)' }}>
              {f.label}{f.required && <span style={{ color: 'var(--red)' }}> *</span>}
            </label>
            <input
              type={f.type}
              value={form[f.key]}
              placeholder={f.placeholder}
              required={f.required}
              onChange={e => set(f.key)(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        ))}

        <button type="submit" disabled={loading} className="btn primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', fontSize: '.9rem', marginTop: '.25rem' }}>
          {loading ? <><Loader size={14}/> Booking…</> : <>Confirm Booking — ₹{schedule.fare} <ArrowRight size={14}/></>}
        </button>
      </form>
    </div>
  );
}

StepPassenger.propTypes = {
  schedule: PropTypes.shape({
    schedule_id: PropTypes.number.isRequired,
    fare:        PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  route: PropTypes.shape({
    source:      PropTypes.string,
    destination: PropTypes.string,
  }).isRequired,
  seat:   PropTypes.string.isRequired,
  user:   PropTypes.shape({
    name:  PropTypes.string,
    email: PropTypes.string,
  }),
  onBook: PropTypes.func.isRequired,
};

// ── Step 5: Booking confirmation ───────────────────────────────────────────────
function StepConfirmation({ booking, onBookAnother }) {
  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
        <CheckCircle size={32} color="var(--green)"/>
      </div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '.4rem' }}>Booking Confirmed! 🎉</h2>
      <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: '1.5rem' }}>Your ticket has been booked successfully.</p>

      {/* Ticket card */}
      <div style={{ background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: '14px', padding: '1.5rem', textAlign: 'left', boxShadow: 'var(--sh3)', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Ticket stripe */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent)' }}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingLeft: '8px' }}>
          <div>
            <div style={{ fontSize: '.68rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Ticket ID</div>
            <div style={{ fontFamily: "'Fira Code',monospace", fontWeight: 800, fontSize: '1rem', color: 'var(--accent)', marginTop: '2px' }}>
              <Ticket size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/>
              {booking.ticket_id || `#${booking.booking_id}`}
            </div>
          </div>
          <span className="chip confirmed">Confirmed</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingLeft: '8px' }}>
          {[
            { label: 'Passenger',  value: booking.passenger_name },
            { label: 'Phone',      value: booking.phone },
            { label: 'From',       value: booking.source },
            { label: 'To',         value: booking.destination },
            { label: 'Departure',  value: booking.departure },
            { label: 'Arrival',    value: booking.arrival },
            { label: 'Vehicle',    value: `${booking.vehicle_no} (${booking.vehicle_type})` },
            { label: 'Seat No.',   value: booking.seat_no },
            { label: 'Amount Paid', value: `₹${booking.amount}` },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '.67rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>{item.label}</div>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn" onClick={onBookAnother}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
        <RotateCcw size={14}/> Book Another Ticket
      </button>
    </div>
  );
}

StepConfirmation.propTypes = {
  booking: PropTypes.shape({
    ticket_id:      PropTypes.string,
    booking_id:     PropTypes.number,
    passenger_name: PropTypes.string,
    phone:          PropTypes.string,
    source:         PropTypes.string,
    destination:    PropTypes.string,
    departure:      PropTypes.string,
    arrival:        PropTypes.string,
    vehicle_no:     PropTypes.string,
    vehicle_type:   PropTypes.string,
    seat_no:        PropTypes.string,
    amount:         PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onBookAnother: PropTypes.func.isRequired,
};

// ── Main SearchBook page (wizard) ─────────────────────────────────────────────
export default function SearchBook() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [routes, setRoutes] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handleSearchResults = (data, searchFilters) => {
    setRoutes(data);
    setFilters(searchFilters);
    setStep(1);
  };

  const handleSelectSchedule = (schedule, route) => {
    setSelectedSchedule(schedule);
    setSelectedRoute(route);
    setStep(2);
  };

  const handleSelectSeat = (seat) => {
    setSelectedSeat(seat);
    setStep(3);
  };

  const handleBooking = (booking) => {
    setConfirmedBooking(booking);
    setStep(4);
  };

  const handleBookAnother = () => {
    setStep(0);
    setRoutes([]);
    setFilters({});
    setSelectedSchedule(null);
    setSelectedRoute(null);
    setSelectedSeat('');
    setConfirmedBooking(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToastContainer/>

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius: 'var(--r)', padding: '1.25rem 1.5rem', color: '#fff', boxShadow: '0 4px 20px rgba(37,99,235,.3)' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '.25rem' }}>🚌 Book a Ticket</h1>
        <p style={{ fontSize: '.83rem', opacity: .85 }}>Search routes, pick your seat, and confirm your booking in minutes.</p>
      </div>

      {/* Progress indicator */}
      {step < 4 && (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: i < STEPS.length - 1 ? '1' : undefined }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%', border: '2px solid',
                borderColor: i <= step ? 'var(--accent)' : 'var(--border)',
                background: i < step ? 'var(--accent)' : i === step ? 'var(--accent-lite)' : 'var(--surface)',
                color: i < step ? '#fff' : i === step ? 'var(--accent)' : 'var(--text3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.7rem', fontWeight: 700, flexShrink: 0,
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '.7rem', fontWeight: i === step ? 700 : 400, color: i === step ? 'var(--text)' : 'var(--text3)', whiteSpace: 'nowrap', display: 'none' }}
                className="step-label">
                {s}
              </span>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--accent)' : 'var(--border)', borderRadius: '2px', minWidth: '16px' }}/>}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1.5rem', boxShadow: 'var(--sh2)', minHeight: '300px' }}>
        {step === 0 && <StepSearch onResults={handleSearchResults}/>}
        {step === 1 && <StepSchedules routes={routes} filters={filters} onSelectSchedule={handleSelectSchedule}/>}
        {step === 2 && <StepSeat schedule={selectedSchedule} route={selectedRoute} onSelectSeat={handleSelectSeat}/>}
        {step === 3 && (
          <StepPassenger
            schedule={selectedSchedule}
            route={selectedRoute}
            seat={selectedSeat}
            user={user}
            onBook={handleBooking}
          />
        )}
        {step === 4 && <StepConfirmation booking={confirmedBooking} onBookAnother={handleBookAnother}/>}
      </div>

      {/* Back navigation */}
      {step > 0 && step < 4 && (
        <button className="btn" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setStep(s => s - 1)}>
          ← Back
        </button>
      )}
    </div>
  );
}
