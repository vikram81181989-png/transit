import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard, Map, Bus, Clock, Users,
  Ticket, HardHat, ClipboardList, LogOut, Menu, Bus as BusIcon,
  Search, BookOpen, UserCircle
} from 'lucide-react';

const NAV_USER = [
  { to: '/book',        icon: <Search size={18}/>,       label: 'Book Ticket' },
  { to: '/my-bookings', icon: <BookOpen size={18}/>,     label: 'My Bookings' },
  { to: '/profile',     icon: <UserCircle size={18}/>,   label: 'My Profile' },
];

const NAV_ADMIN = [
  { to: '/',           icon: <LayoutDashboard size={18}/>, label: 'Dashboard',  exact: true },
  { to: '/routes',     icon: <Map size={18}/>,             label: 'Routes' },
  { to: '/vehicles',   icon: <Bus size={18}/>,             label: 'Vehicles' },
  { to: '/schedules',  icon: <Clock size={18}/>,           label: 'Schedules' },
  { to: '/passengers', icon: <Users size={18}/>,           label: 'Passengers' },
  { to: '/bookings',   icon: <Ticket size={18}/>,          label: 'Bookings' },
  { to: '/staff',      icon: <HardHat size={18}/>,         label: 'Staff' },
  { to: '/audit',      icon: <ClipboardList size={18}/>,   label: 'Audit Log' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: collapsed ? '60px 1fr' : '240px 1fr', gridTemplateRows: '58px 1fr', height: '100vh', transition: 'grid-template-columns .2s' }}>
      {/* Header */}
      <header style={{ gridColumn: '1/-1', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', boxShadow: 'var(--sh1)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', color: 'var(--text2)', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer', display:'flex', alignItems:'center' }}>
            <Menu size={20}/>
          </button>
          <div style={{ width: '30px', height: '30px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(37,99,235,.3)' }}>
            <BusIcon size={16} color="#fff"/>
          </div>
          {!collapsed && <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Transit<span style={{ color: 'var(--accent)' }}>DB</span></span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '.73rem', fontWeight: 600, color: 'var(--text2)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'blink 2s infinite' }}></span>
            MySQL Live
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.72rem', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '.78rem', fontWeight: 700, lineHeight: 1.2 }}>{user?.name}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--text2)' }}><span className={`chip ${user?.role}`}>{user?.role}</span></div>
            </div>
          </div>
          <button className="btn sm danger" onClick={handleLogout} style={{display:'flex', alignItems:'center', gap:'5px'}}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '1rem .75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {/* User section */}
        {!collapsed && <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', padding: '0 6px', marginBottom: '.4rem' }}>My Account</div>}
        {NAV_USER.map(n => (
          <NavLink key={n.to} to={n.to} end={n.exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: collapsed ? '10px' : '9px 10px',
              borderRadius: 'var(--r2)', transition: 'all .15s',
              fontSize: '.83rem', fontWeight: 600,
              background: isActive ? 'var(--accent-lite)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
            })}>
            <span style={{ flexShrink: 0 }}>{n.icon}</span>
            {!collapsed && <span>{n.label}</span>}
          </NavLink>
        ))}

        {/* Admin section */}
        {!collapsed && <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', padding: '0 6px', marginTop: '.75rem', marginBottom: '.4rem' }}>Management</div>}
        {collapsed && <div style={{ borderTop: '1px solid var(--border)', margin: '.5rem 0' }}/>}
        {NAV_ADMIN.map(n => (
          <NavLink key={n.to} to={n.to} end={n.exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: collapsed ? '10px' : '9px 10px',
              borderRadius: 'var(--r2)', transition: 'all .15s',
              fontSize: '.83rem', fontWeight: 600,
              background: isActive ? 'var(--accent-lite)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
            })}>
            <span style={{ flexShrink: 0 }}>{n.icon}</span>
            {!collapsed && <span>{n.label}</span>}
          </NavLink>
        ))}
      </aside>

      {/* Main */}
      <main style={{ overflow: 'auto', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <div className="page-enter" style={{ flex: 1, padding: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}