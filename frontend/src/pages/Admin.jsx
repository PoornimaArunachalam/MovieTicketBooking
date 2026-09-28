// frontend/src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import './Admin.css';

const TABS = ['Dashboard', 'Movies', 'Theatres', 'Screens', 'Shows', 'Users', 'Bookings', 'Revenue'];

export default function Admin() {
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // { type, data }
  const { addToast } = useToast();

  const fetch = async (t) => {
    setLoading(true);
    try {
      if (t === 'Dashboard') { const r = await api.get('/admin/stats'); setStats(r.data); }
      else if (t === 'Movies') { const r = await api.get('/admin/movies'); setMovies(r.data); }
      else if (t === 'Theatres') { const r = await api.get('/admin/theatres'); setTheatres(r.data); }
      else if (t === 'Screens') { const r = await api.get('/admin/screens'); setScreens(r.data); }
      else if (t === 'Shows') { const r = await api.get('/admin/shows'); setShows(r.data); }
      else if (t === 'Users') { const r = await api.get('/admin/users'); setUsers(r.data); }
      else if (t === 'Bookings') { const r = await api.get('/admin/bookings'); setBookings(r.data); }
      else if (t === 'Revenue') { const r = await api.get('/admin/revenue'); setRevenue(r.data); }
    } catch { addToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(tab); }, [tab]);

  const del = async (url, msg) => {
    if (!confirm('Are you sure?')) return;
    try { await api.delete(url); addToast(msg, 'success'); fetch(tab); }
    catch (e) { addToast(e.response?.data?.message || 'Error', 'error'); }
  };

  const openAdd = (type) => setModal({ type, data: {} });

  const saveMovie = async (data) => {
    try {
      if (data.id) await api.put(`/admin/movies/${data.id}`, data);
      else await api.post('/admin/movies', data);
      addToast('Movie saved!', 'success'); setModal(null); fetch('Movies');
    } catch (e) { addToast(e.response?.data?.message || 'Error', 'error'); }
  };

  const saveTheatre = async (data) => {
    try {
      if (data.id) await api.put(`/admin/theatres/${data.id}`, data);
      else await api.post('/admin/theatres', data);
      addToast('Theatre saved!', 'success'); setModal(null); fetch('Theatres');
    } catch (e) { addToast(e.response?.data?.message || 'Error', 'error'); }
  };

  const saveScreen = async (data) => {
    try {
      await api.post('/admin/screens', data);
      addToast('Screen added!', 'success'); setModal(null); fetch('Screens');
    } catch (e) { addToast(e.response?.data?.message || 'Error', 'error'); }
  };

  const saveShow = async (data) => {
    try {
      await api.post('/admin/shows', data);
      addToast('Show added!', 'success'); setModal(null); fetch('Shows');
    } catch (e) { addToast(e.response?.data?.message || 'Error', 'error'); }
  };

  return (
    <div className="admin-page" style={{ paddingTop: 70 }}>
      <div className="admin-sidebar">
        <div className="admin-logo">⚙️ Admin Panel</div>
        {TABS.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'Dashboard' ? '📊' : t === 'Movies' ? '🎬' : t === 'Theatres' ? '🏛' : t === 'Screens' ? '🖥' : t === 'Shows' ? '🎭' : t === 'Users' ? '👥' : t === 'Bookings' ? '🎟️' : '💰'} {t}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {loading && <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>}

        {/* DASHBOARD */}
        {tab === 'Dashboard' && stats && (
          <div className="animate-fadeIn">
            <h2 className="admin-page-title">Dashboard Overview</h2>
            <div className="stats-grid">
              {[
                { label: 'Total Movies', value: stats.totalMovies, icon: '🎬', color: '#e63946' },
                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3b82f6' },
                { label: 'Total Bookings', value: stats.totalBookings, icon: '🎟️', color: '#10b981' },
                { label: 'Revenue', value: `₹${parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#f59e0b' },
                { label: 'Theatres', value: stats.totalTheatres, icon: '🏛', color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} className="stat-card glass-card">
                  <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <h3 style={{ margin: '32px 0 16px', fontSize: 18, fontWeight: 700 }}>Recent Bookings</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Code</th><th>User</th><th>Movie</th><th>Seats</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                  {(stats.recentBookings || []).map(b => (
                    <tr key={b.booking_code}>
                      <td><span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>{b.booking_code}</span></td>
                      <td>{b.user_name}</td>
                      <td>{b.movie_title}</td>
                      <td>{b.seats}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{b.final_amount}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(b.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MOVIES */}
        {tab === 'Movies' && (
          <div className="animate-fadeIn">
            <div className="admin-table-header">
              <h2 className="admin-page-title">Manage Movies</h2>
              <button className="btn btn-primary btn-sm" onClick={() => openAdd('movie')}>+ Add Movie</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Genre</th><th>Language</th><th>Duration</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {movies.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.title}</strong></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{m.genre}</td>
                      <td>{m.language}</td>
                      <td>{m.duration_mins}m</td>
                      <td><span className="badge badge-primary">{m.rating}</span></td>
                      <td><span className={`badge ${m.status === 'now_showing' ? 'badge-success' : 'badge-warning'}`}>{m.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setModal({ type: 'movie', data: m })}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(`/admin/movies/${m.id}`, 'Movie deleted')}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* THEATRES */}
        {tab === 'Theatres' && (
          <div className="animate-fadeIn">
            <div className="admin-table-header">
              <h2 className="admin-page-title">Manage Theatres</h2>
              <button className="btn btn-primary btn-sm" onClick={() => openAdd('theatre')}>+ Add Theatre</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>City</th><th>Location</th><th>Facilities</th><th>Actions</th></tr></thead>
                <tbody>
                  {theatres.map(t => (
                    <tr key={t.id}>
                      <td><strong>{t.name}</strong></td>
                      <td>{t.city}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 180 }} className="truncate">{t.location}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12, maxWidth: 200 }} className="truncate">{t.facilities}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setModal({ type: 'theatre', data: t })}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(`/admin/theatres/${t.id}`, 'Theatre deleted')}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCREENS */}
        {tab === 'Screens' && (
          <div className="animate-fadeIn">
            <div className="admin-table-header">
              <h2 className="admin-page-title">Manage Screens</h2>
              <button className="btn btn-primary btn-sm" onClick={() => openAdd('screen')}>+ Add Screen</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Screen Name</th><th>Theatre</th><th>Total Seats</th><th>Actions</th></tr></thead>
                <tbody>
                  {screens.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.screen_name}</strong></td>
                      <td>{s.theatre_name}</td>
                      <td>{s.total_seats}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => del(`/admin/screens/${s.id}`, 'Screen deleted')}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SHOWS */}
        {tab === 'Shows' && (
          <div className="animate-fadeIn">
            <div className="admin-table-header">
              <h2 className="admin-page-title">Manage Shows</h2>
              <button className="btn btn-primary btn-sm" onClick={() => openAdd('show')}>+ Add Show</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Movie</th><th>Theatre</th><th>Screen</th><th>Date</th><th>Time</th><th>Regular</th><th>VIP</th><th>Actions</th></tr></thead>
                <tbody>
                  {shows.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.movie_title}</strong></td>
                      <td>{s.theatre_name}</td>
                      <td>{s.screen_name}</td>
                      <td>{new Date(s.show_date).toLocaleDateString('en-IN')}</td>
                      <td>{s.show_time}</td>
                      <td style={{ color: 'var(--success)' }}>₹{s.price_regular}</td>
                      <td style={{ color: 'var(--gold)' }}>₹{s.price_vip}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => del(`/admin/shows/${s.id}`, 'Show deleted')}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'Users' && (
          <div className="animate-fadeIn">
            <h2 className="admin-page-title">Manage Users</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.phone || '-'}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab === 'Bookings' && (
          <div className="animate-fadeIn">
            <h2 className="admin-page-title">All Bookings</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Code</th><th>User</th><th>Movie</th><th>Date</th><th>Seats</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td><span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>{b.booking_code}</span></td>
                      <td><div>{b.user_name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.user_email}</div></td>
                      <td>{b.movie_title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{b.show_date} {b.show_time?.substring(0, 5)}</td>
                      <td>{b.seats}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{b.final_amount}</td>
                      <td><span className={`badge ${b.booking_status === 'confirmed' ? 'badge-success' : 'badge-primary'}`}>{b.booking_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REVENUE */}
        {tab === 'Revenue' && revenue && (
          <div className="animate-fadeIn">
            <h2 className="admin-page-title">Revenue Reports</h2>
            <div className="grid-2" style={{ gap: 32 }}>
              <div>
                <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Monthly Revenue</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Month</th><th>Bookings</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {revenue.monthly.map(r => (
                        <tr key={r.month}>
                          <td>{r.month}</td>
                          <td>{r.bookings}</td>
                          <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{parseFloat(r.revenue).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Top Movies by Revenue</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Movie</th><th>Bookings</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {revenue.byMovie.map(r => (
                        <tr key={r.title}>
                          <td><strong>{r.title}</strong></td>
                          <td>{r.bookings}</td>
                          <td style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{parseFloat(r.revenue).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'movie' && <MovieModal data={modal.data} onSave={saveMovie} onClose={() => setModal(null)} theatres={theatres} />}
      {modal?.type === 'theatre' && <TheatreModal data={modal.data} onSave={saveTheatre} onClose={() => setModal(null)} />}
      {modal?.type === 'screen' && <ScreenModal data={modal.data} onSave={saveScreen} onClose={() => setModal(null)} theatres={theatres} fetchTheatres={() => api.get('/admin/theatres').then(r => setTheatres(r.data))} />}
      {modal?.type === 'show' && <ShowModal data={modal.data} onSave={saveShow} onClose={() => setModal(null)} movies={movies} theatres={theatres} screens={screens} />}
    </div>
  );
}

// --- Sub-modals ---
function MovieModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', genre: '', language: 'English', duration_mins: '', rating: 'UA', poster_url: '', banner_url: '', release_date: '', status: 'now_showing', ...data });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>{data.id ? 'Edit' : 'Add'} Movie</h3><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['title','Title','text'],['description','Description','text'],['genre','Genre','text'],['poster_url','Poster URL','text'],['banner_url','Banner URL','text']].map(([k,l,t]) => (
            <div className="input-group" key={k}>
              <label className="input-label">{l}</label>
              <input className="input" type={t} value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="grid-2">
            <div className="input-group"><label className="input-label">Language</label>
              <select className="input" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                {['English','Hindi','Tamil','Telugu'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Rating</label>
              <select className="input" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}>
                {['U','UA','A'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Duration (mins)</label>
              <input className="input" type="number" value={form.duration_mins || ''} onChange={e => setForm(f => ({ ...f, duration_mins: e.target.value }))} />
            </div>
            <div className="input-group"><label className="input-label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Release Date</label>
              <input className="input" type="date" value={form.release_date || ''} onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}

function TheatreModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', city: '', location: '', facilities: '', ...data });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>{data.id ? 'Edit' : 'Add'} Theatre</h3><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['name','Name'],['city','City'],['location','Location'],['facilities','Facilities']].map(([k,l]) => (
            <div className="input-group" key={k}>
              <label className="input-label">{l}</label>
              <input className="input" value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}

function ScreenModal({ data, onSave, onClose, theatres, fetchTheatres }) {
  const [form, setForm] = useState({ theatre_id: '', screen_name: '', total_seats: 60, ...data });
  useEffect(() => { fetchTheatres(); }, []);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Add Screen</h3><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group"><label className="input-label">Theatre</label>
            <select className="input" value={form.theatre_id} onChange={e => setForm(f => ({ ...f, theatre_id: e.target.value }))}>
              <option value="">Select Theatre</option>
              {theatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="input-group"><label className="input-label">Screen Name</label>
            <input className="input" value={form.screen_name} onChange={e => setForm(f => ({ ...f, screen_name: e.target.value }))} />
          </div>
          <div className="input-group"><label className="input-label">Total Seats</label>
            <input className="input" type="number" value={form.total_seats} onChange={e => setForm(f => ({ ...f, total_seats: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Add Screen</button>
        </div>
      </div>
    </div>
  );
}

function ShowModal({ data, onSave, onClose, movies, theatres, screens }) {
  const [form, setForm] = useState({ movie_id: '', theatre_id: '', screen_id: '', show_date: '', show_time: '', price_regular: 200, price_vip: 350, ...data });
  const filteredScreens = screens.filter(s => s.theatre_id == form.theatre_id || !form.theatre_id);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Add Show</h3><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="grid-2" style={{ gap: 14 }}>
            <div className="input-group" style={{ gridColumn: '1/-1' }}><label className="input-label">Movie</label>
              <select className="input" value={form.movie_id} onChange={e => setForm(f => ({ ...f, movie_id: e.target.value }))}>
                <option value="">Select Movie</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Theatre</label>
              <select className="input" value={form.theatre_id} onChange={e => setForm(f => ({ ...f, theatre_id: e.target.value, screen_id: '' }))}>
                <option value="">Select Theatre</option>
                {theatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Screen</label>
              <select className="input" value={form.screen_id} onChange={e => setForm(f => ({ ...f, screen_id: e.target.value }))}>
                <option value="">Select Screen</option>
                {filteredScreens.map(s => <option key={s.id} value={s.id}>{s.screen_name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Date</label>
              <input className="input" type="date" value={form.show_date} onChange={e => setForm(f => ({ ...f, show_date: e.target.value }))} />
            </div>
            <div className="input-group"><label className="input-label">Time</label>
              <input className="input" type="time" value={form.show_time} onChange={e => setForm(f => ({ ...f, show_time: e.target.value }))} />
            </div>
            <div className="input-group"><label className="input-label">Regular Price (₹)</label>
              <input className="input" type="number" value={form.price_regular} onChange={e => setForm(f => ({ ...f, price_regular: e.target.value }))} />
            </div>
            <div className="input-group"><label className="input-label">VIP Price (₹)</label>
              <input className="input" type="number" value={form.price_vip} onChange={e => setForm(f => ({ ...f, price_vip: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Add Show</button>
        </div>
      </div>
    </div>
  );
}
