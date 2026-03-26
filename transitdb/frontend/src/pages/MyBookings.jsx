import { useState, useEffect, useCallback } from 'react';
import { Ticket, Clock, MapPin, ArrowRight, XCircle, RefreshCw, IndianRupee, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import ToastContainer, { useToast } from '../components/Toast';

const STATUS_FILTERS = ['all', 'confirmed', 'pending', 'cancelled'];

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/user/my-bookings');
      setBookings(r.data.data);
    } catch (_err) {
      toast('Failed to load your bookings', 'err');
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCancelConfirmed = async (bookingId) => {
    setConfirmId(null);
    setCancelling(bookingId);
    try {
      await api.put(`/user/bookings/${bookingId}/cancel`);
      toast('Booking cancelled. Your seat has been released.', 'ok');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Cancellation failed', 'err');
    } finally { setCancelling(null); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const counts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToastContainer/>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#059669,#0284c7)', borderRadius: 'var(--r)', padding: '1.25rem 1.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxShadow: '0 4px 20px rgba(5,150,105,.25)' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '.25rem' }}>🎫 My Bookings</h1>
          <p style={{ fontSize: '.83rem', opacity: .85 }}>View your travel history and manage cancellations.</p>
        </div>
        <button onClick={load} style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--r2)', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: '1.5px solid',
              borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
              background: filter === s ? 'var(--accent-lite)' : 'var(--surface)',
              color: filter === s ? 'var(--accent)' : 'var(--text2)',
              fontWeight: 600, fontSize: '.78rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{ background: filter === s ? 'var(--accent)' : 'var(--surface3)', color: filter === s ? '#fff' : 'var(--text3)', borderRadius: '10px', padding: '0 7px', fontSize: '.68rem', fontWeight: 700 }}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Booking list */}
      {loading ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4rem', textAlign: 'center', color: 'var(--text2)' }}>
          Loading your bookings…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '3rem', textAlign: 'center' }}>
          <Ticket size={40} style={{ color: 'var(--text3)', marginBottom: '1rem' }}/>
          <p style={{ fontWeight: 600, color: 'var(--text2)' }}>No bookings found</p>
          <p style={{ fontSize: '.82rem', color: 'var(--text3)', marginTop: '.4rem' }}>
            {filter === 'all' ? 'You haven\'t booked any tickets yet.' : `No ${filter} bookings.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(b => (
            <div key={b.booking_id}
              style={{ background: 'var(--surface)', border: `1.5px solid ${b.status === 'cancelled' ? '#fca5a5' : b.status === 'confirmed' ? '#bfdbfe' : 'var(--border)'}`, borderRadius: 'var(--r)', boxShadow: 'var(--sh1)', overflow: 'hidden', opacity: b.status === 'cancelled' ? 0.8 : 1 }}>

              {/* Ticket header */}
              <div style={{ padding: '12px 16px', background: b.status === 'cancelled' ? '#fef2f2' : b.status === 'confirmed' ? 'var(--accent-lite)' : 'var(--amber-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={16} color="var(--accent)"/>
                  <span style={{ fontFamily: "'Fira Code',monospace", fontWeight: 800, fontSize: '.88rem', color: 'var(--accent)' }}>
                    {b.ticket_id || `#${b.booking_id}`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`chip ${b.status}`}>{b.status}</span>
                  {(b.status === 'confirmed' || b.status === 'pending') && (
                    confirmId === b.booking_id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '.72rem', color: 'var(--text2)' }}>Confirm cancel?</span>
                        <button
                          className="btn sm danger"
                          onClick={() => handleCancelConfirmed(b.booking_id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '.72rem' }}>
                          Yes
                        </button>
                        <button
                          className="btn sm"
                          onClick={() => setConfirmId(null)}
                          style={{ fontSize: '.72rem' }}>
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn sm danger"
                        disabled={cancelling === b.booking_id}
                        onClick={() => setConfirmId(b.booking_id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '.72rem' }}>
                        {cancelling === b.booking_id ? <RefreshCw size={11}/> : <XCircle size={11}/>}
                        {cancelling === b.booking_id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Ticket body */}
              <div style={{ padding: '12px 16px' }}>
                {/* Route */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <MapPin size={14} color="var(--text3)"/>
                  <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{b.source}</span>
                  <ArrowRight size={14} color="var(--text3)"/>
                  <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{b.destination}</span>
                </div>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '8px 16px' }}>
                  {[
                    { label: 'Departure', value: b.departure, icon: <Clock size={12}/> },
                    { label: 'Seat No.',  value: b.seat_no },
                    { label: 'Vehicle',   value: `${b.vehicle_no} (${b.vehicle_type})` },
                    { label: 'Passenger', value: b.passenger_name },
                    { label: 'Amount',    value: `₹${b.amount}`, icon: <IndianRupee size={12}/> },
                    { label: 'Booked',    value: new Date(b.booked_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: '.64rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {item.icon}{item.label}
                      </div>
                      <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {b.status === 'cancelled' && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--red-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--r2)', fontSize: '.78rem', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={13}/> This booking has been cancelled.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
