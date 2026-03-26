import PropTypes from 'prop-types';

/**
 * SeatMap — interactive visual seat selection for a bus layout.
 *
 * Generates a seat grid based on vehicle capacity.
 * Each row has 4 seats (A window, B aisle | C aisle, D window).
 * Seat IDs: 1A, 1B, 1C, 1D, 2A, 2B, …
 */
const COLS = ['A', 'B', 'C', 'D'];

function generateSeats(capacity) {
  const rows = Math.ceil(capacity / 4);
  const seats = [];
  for (let row = 1; row <= rows; row++) {
    for (const col of COLS) {
      const seatId = `${row}${col}`;
      const seatNum = (row - 1) * 4 + COLS.indexOf(col) + 1;
      if (seatNum <= capacity) seats.push(seatId);
    }
  }
  return seats;
}

export default function SeatMap({ capacity, takenSeats = [], selectedSeat, onSelect }) {
  const seats = generateSeats(capacity);

  const getStatus = (seatId) => {
    if (seatId === selectedSeat) return 'selected';
    if (takenSeats.includes(seatId)) return 'taken';
    return 'available';
  };

  const seatStyle = (status) => {
    const base = {
      width: '44px',
      height: '44px',
      borderRadius: '8px',
      border: '2px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '.7rem',
      fontWeight: 700,
      cursor: status === 'taken' ? 'not-allowed' : 'pointer',
      transition: 'all .15s',
      userSelect: 'none',
      fontFamily: "'Fira Code', monospace",
    };
    if (status === 'selected')  return { ...base, background: '#2563eb', borderColor: '#1d4ed8', color: '#fff',     boxShadow: '0 2px 8px rgba(37,99,235,.4)' };
    if (status === 'taken')     return { ...base, background: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626',  opacity: .7 };
    return                             { ...base, background: '#f0fdf4', borderColor: '#86efac', color: '#15803d' };
  };

  const rowCount = Math.ceil(seats.length / 4);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Available', bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
          { label: 'Selected',  bg: '#2563eb', border: '#1d4ed8', color: '#fff' },
          { label: 'Taken',     bg: '#fee2e2', border: '#fca5a5', color: '#dc2626' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.76rem', color: 'var(--text2)' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: l.bg, border: `2px solid ${l.border}`, display: 'inline-block' }}/>
            {l.label}
          </div>
        ))}
      </div>

      {/* Driver area */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '.5rem' }}>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 14px', fontSize: '.72rem', color: 'var(--text3)', fontWeight: 600 }}>
          🚗 Driver
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '24px 44px 44px 20px 44px 44px', gap: '6px', marginBottom: '4px', paddingLeft: '4px' }}>
        <span/>
        {['A', 'B', '', 'C', 'D'].map((h, i) => (
          <span key={i} style={{ textAlign: 'center', fontSize: '.65rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</span>
        ))}
      </div>

      {/* Seat rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Array.from({ length: rowCount }, (_, rowIdx) => {
          const rowNum = rowIdx + 1;
          const rowSeats = COLS.map(col => `${rowNum}${col}`).filter(s => seats.includes(s));
          return (
            <div key={rowNum} style={{ display: 'grid', gridTemplateColumns: '24px 44px 44px 20px 44px 44px', gap: '6px', alignItems: 'center' }}>
              {/* Row number */}
              <span style={{ fontSize: '.68rem', color: 'var(--text3)', fontWeight: 600, textAlign: 'center' }}>{rowNum}</span>
              {/* Seats A, B */}
              {rowSeats.slice(0, 2).map(seatId => {
                const status = getStatus(seatId);
                return (
                  <div key={seatId}
                    style={seatStyle(status)}
                    onClick={() => status !== 'taken' && onSelect(seatId)}
                    title={status === 'taken' ? `Seat ${seatId} — Taken` : `Seat ${seatId} — Click to select`}>
                    {seatId}
                  </div>
                );
              })}
              {/* Aisle gap */}
              <span/>
              {/* Seats C, D */}
              {rowSeats.slice(2, 4).map(seatId => {
                const status = getStatus(seatId);
                return (
                  <div key={seatId}
                    style={seatStyle(status)}
                    onClick={() => status !== 'taken' && onSelect(seatId)}
                    title={status === 'taken' ? `Seat ${seatId} — Taken` : `Seat ${seatId} — Click to select`}>
                    {seatId}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {selectedSeat && (
        <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'var(--accent-lite)', border: '1px solid #bfdbfe', borderRadius: 'var(--r2)', fontSize: '.82rem', fontWeight: 600, color: 'var(--accent)' }}>
          ✅ Selected: Seat <strong>{selectedSeat}</strong>
        </div>
      )}
    </div>
  );
}

SeatMap.propTypes = {
  capacity:     PropTypes.number.isRequired,
  takenSeats:   PropTypes.arrayOf(PropTypes.string),
  selectedSeat: PropTypes.string,
  onSelect:     PropTypes.func.isRequired,
};
