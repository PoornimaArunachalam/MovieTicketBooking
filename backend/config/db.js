// backend/config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const realPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'movie_booking_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// In-Memory Mock Store for zero-setup demo mode
const mockStore = {
  movies: [
    { id: 1, title: 'Leo (Bloody Sweet)', description: 'Parthi, a mild-mannered cafe owner in Himachal Pradesh, becomes a local hero after thwarting an armed robbery. Soon, dangerous ruthless gangsters arrive claiming he is Leo Das, a long-lost criminal mastermind.', duration_mins: 164, genre: 'Action', language: 'Tamil', rating: 8.4, poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800', banner_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200', release_date: '2023-10-19', director: 'Lokesh Kanagaraj', cast: 'Thalapathy Vijay, Trisha, Sanjay Dutt, Arjun Sarja', status: 'now_showing' },
    { id: 2, title: 'GOAT - The Greatest Of All Time', description: 'Gandhi, a elite operative for the Special Anti-Terrorist Squad (SATS), is called back for a critical mission that entangles his past and present, pitting him against an unstoppable threat.', duration_mins: 179, genre: 'Action', language: 'Tamil', rating: 8.6, poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800', banner_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200', release_date: '2024-09-05', director: 'Venkat Prabhu', cast: 'Thalapathy Vijay, Prashanth, Prabhu Deva, Sneha', status: 'now_showing' },
    { id: 3, title: 'Amaran', description: 'The heroic biopic of Major Mukund Varadarajan, an officer in the Indian Army\'s Rajput Regiment who was posthumously awarded the Ashok Chakra for courage in counter-terrorism ops.', duration_mins: 169, genre: 'Action', language: 'Tamil', rating: 8.9, poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', banner_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200', release_date: '2024-10-31', director: 'Rajkumar Periasamy', cast: 'Sivakarthikeyan, Sai Pallavi, Bhuvan Arora', status: 'now_showing' },
    { id: 4, title: 'Jailer', description: 'Muthuvel Pandian, a retired prison warden, embarks on a relentless quest to dismantle a criminal syndicate after his police officer son mysteriously vanishes while investigating idol smugglers.', duration_mins: 168, genre: 'Action', language: 'Tamil', rating: 8.5, poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', banner_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200', release_date: '2023-08-10', director: 'Nelson Dilipkumar', cast: 'Superstar Rajinikanth, Mohanlal, Shiva Rajkumar, Tamannaah', status: 'now_showing' },
    { id: 5, title: 'Oppenheimer', description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.', duration_mins: 180, genre: 'Drama', language: 'English', rating: 8.9, poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800', banner_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200', release_date: '2023-07-21', director: 'Christopher Nolan', cast: 'Cillian Murphy, Emily Blunt', status: 'now_showing' },
    { id: 6, title: 'Kanguva', description: 'A warrior in 1697 struggles to save his people from a dark force; centuries later, a modern shadow hunter uncovers a link to his ancient heroics.', duration_mins: 154, genre: 'Fantasy', language: 'Tamil', rating: 8.2, poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800', banner_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200', release_date: '2024-11-14', director: 'Siva', cast: 'Suriya, Bobby Deol, Disha Patani', status: 'coming_soon' },
    { id: 7, title: 'Coolie', description: 'A legendary gold smuggler operates under his own code of honor until a betrayal sparks an epic showdown.', duration_mins: 160, genre: 'Action', language: 'Tamil', rating: 9.0, poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800', banner_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200', release_date: '2025-05-01', director: 'Lokesh Kanagaraj', cast: 'Superstar Rajinikanth, Nagarjuna, Soubin Shahir, Shruti Haasan', status: 'coming_soon' }
  ],
  theatres: [
    { id: 1, name: 'PVR IMAX Horizon Mall', address: '4th Floor, Horizon City Mall, MG Road', city: 'Mumbai', total_screens: 6 },
    { id: 2, name: 'INOX Luxe Cinema', address: 'Phoenix Citadel, Lower Parel', city: 'Mumbai', total_screens: 8 },
    { id: 3, name: 'Cinepolis Grand Central', address: 'Vashi Station Building, Navi Mumbai', city: 'Mumbai', total_screens: 5 },
  ],
  screens: [
    { id: 1, theatre_id: 1, name: 'Screen 1 (IMAX 3D)', seat_capacity: 80, regular_price: 250, vip_price: 450 },
    { id: 2, theatre_id: 1, name: 'Screen 2 (4DX)', seat_capacity: 80, regular_price: 300, vip_price: 500 },
    { id: 3, theatre_id: 2, name: 'Screen 1 (Dolby Atmos)', seat_capacity: 80, regular_price: 220, vip_price: 400 },
  ],
  shows: [],
  users: [
    { id: 1, name: 'Admin User', email: 'admin@cinepulse.com', password: 'admin123', phone: '9876543210', role: 'admin', created_at: new Date() },
    { id: 2, name: 'John Doe', email: 'john@example.com', password: 'user123', phone: '9876543211', role: 'user', created_at: new Date() },
  ],
  bookings: [],
  reviews: [
    { id: 1, movie_id: 1, user_id: 2, user_name: 'John Doe', rating: 5, comment: 'Mindblowing visuals! Highly recommended in IMAX.', created_at: new Date() },
    { id: 2, movie_id: 2, user_id: 2, user_name: 'John Doe', rating: 5, comment: 'Cillian Murphy delivered a masterclass performance.', created_at: new Date() }
  ],
  coupons: [
    { id: 1, code: 'WELCOME50', discount_percentage: 15, max_discount: 100, min_booking_amount: 300, is_active: 1 },
    { id: 2, code: 'CINE200', discount_percentage: 20, max_discount: 200, min_booking_amount: 500, is_active: 1 },
  ],
  notifications: [
    { id: 1, user_id: 2, title: 'Welcome to CinePulse!', message: 'Use coupon WELCOME50 on your first ticket booking!', is_read: 0, created_at: new Date() }
  ]
};

// Generate shows for next 7 days for mock store
let showIdCounter = 1;
const times = ['10:30 AM', '02:15 PM', '06:45 PM', '09:45 PM'];

for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() + dayOffset);
  const showDate = dateObj.toISOString().split('T')[0];

  mockStore.movies.filter(m => m.status === 'now_showing').forEach(m => {
    mockStore.screens.forEach(scr => {
      times.slice(0, 2).forEach(t => {
        mockStore.shows.push({
          id: showIdCounter++,
          movie_id: m.id,
          screen_id: scr.id,
          theatre_id: scr.theatre_id,
          show_date: showDate,
          show_time: t,
          price_regular: scr.regular_price,
          price_vip: scr.vip_price,
          available_seats: 80,
          theatre_name: mockStore.theatres.find(th => th.id === scr.theatre_id).name,
          screen_name: scr.name,
          movie_title: m.title
        });
      });
    });
  });
}

let useMock = false;

const smartPool = {
  async query(sql, params = []) {
    if (!useMock) {
      try {
        const res = await realPool.query(sql, params);
        return res;
      } catch (err) {
        console.warn('⚠️ MySQL Connection / Query failed. Switching to In-Memory Demo Database:', err.message);
        useMock = true;
      }
    }
    return executeMockSql(sql, params);
  },
  async execute(sql, params = []) {
    if (!useMock) {
      try {
        const res = await realPool.execute(sql, params);
        return res;
      } catch (err) {
        console.warn('⚠️ MySQL Connection / Execute failed. Switching to In-Memory Demo Database:', err.message);
        useMock = true;
      }
    }
    return executeMockSql(sql, params);
  }
};

function executeMockSql(sql, params) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upperSql = cleanSql.toUpperCase();

  if (upperSql.includes('COUNT(*) AS TOTAL')) {
    return [[{ total: mockStore.movies.length }], []];
  }

  if (upperSql.includes('FROM MOVIES')) {
    let list = [...mockStore.movies];
    if (params[0] && typeof params[0] === 'string' && params[0].includes('%')) {
      const q = params[0].replace(/%/g, '').toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q));
    }
    if (upperSql.includes('WHERE STATUS =') || upperSql.includes('WHERE STATUS=')) {
      const statusMatch = cleanSql.match(/status\s*=\s*['"]?(\w+)['"]?/i) || [null, params[0] || 'now_showing'];
      if (statusMatch[1]) list = list.filter(m => m.status === statusMatch[1]);
    }
    if (upperSql.includes('WHERE M.ID =') || upperSql.includes('WHERE ID =')) {
      const idParam = params[0] || parseInt(cleanSql.match(/id\s*=\s*(\d+)/i)?.[1] || 1);
      const found = list.find(m => m.id == idParam);
      return [[found ? found : null].filter(Boolean), []];
    }
    return [list, []];
  }

  if (upperSql.includes('FROM THEATRES')) {
    if (upperSql.includes('WHERE ID =')) {
      const found = mockStore.theatres.find(t => t.id == params[0]);
      return [[found], []];
    }
    return [mockStore.theatres, []];
  }

  if (upperSql.includes('FROM SHOWS')) {
    let list = [...mockStore.shows];
    if (upperSql.includes('SHOW_DATE =')) {
      const dateVal = params.find(p => typeof p === 'string' && p.match(/^\d{4}-\d{2}-\d{2}$/));
      if (dateVal) list = list.filter(s => s.show_date === dateVal);
    }
    if (upperSql.includes('MOVIE_ID =')) {
      const mId = params.find(p => typeof p === 'number' || !isNaN(p));
      if (mId) list = list.filter(s => s.movie_id == mId);
    }
    if (upperSql.includes('S.ID =') || upperSql.includes('WHERE ID =')) {
      const sId = params[0];
      const found = list.find(s => s.id == sId);
      return [[found], []];
    }
    return [list, []];
  }

  if (upperSql.includes('FROM USERS')) {
    if (upperSql.includes('EMAIL =')) {
      const u = mockStore.users.find(usr => usr.email.toLowerCase() === (params[0] || '').toLowerCase());
      return [[u ? u : null].filter(Boolean), []];
    }
    if (upperSql.includes('ID =')) {
      const u = mockStore.users.find(usr => usr.id == params[0]);
      return [[u ? u : null].filter(Boolean), []];
    }
    return [mockStore.users, []];
  }

  if (upperSql.includes('FROM BOOKINGS')) {
    if (upperSql.includes('USER_ID =')) {
      const list = mockStore.bookings.filter(b => b.user_id == params[0]);
      return [list, []];
    }
    if (upperSql.includes('SHOW_ID =') && upperSql.includes('STATUS = \'CONFIRMED\'')) {
      const list = mockStore.bookings.filter(b => b.show_id == params[0] && b.status === 'CONFIRMED');
      return [list, []];
    }
    return [mockStore.bookings, []];
  }

  if (upperSql.includes('FROM REVIEWS')) {
    const mId = params[0];
    const list = mockStore.reviews.filter(r => r.movie_id == mId);
    return [list, []];
  }

  if (upperSql.includes('FROM COUPONS')) {
    if (upperSql.includes('CODE =')) {
      const c = mockStore.coupons.find(cp => cp.code.toUpperCase() === (params[0] || '').toUpperCase());
      return [[c ? c : null].filter(Boolean), []];
    }
    return [mockStore.coupons, []];
  }

  if (upperSql.includes('FROM NOTIFICATIONS')) {
    const list = mockStore.notifications.filter(n => n.user_id == params[0]);
    return [list, []];
  }

  if (upperSql.includes('INSERT INTO USERS')) {
    // auth.js inserts: [name, email, phone || null, hashed_password, 'user']
    const newUser = {
      id: mockStore.users.length + 1,
      name: params[0],
      email: params[1],
      phone: params[2],
      password: params[3],   // bcrypt hashed password is at index 3
      role: params[4] || 'user',
      created_at: new Date()
    };
    mockStore.users.push(newUser);
    return [{ insertId: newUser.id }, []];
  }

  if (upperSql.includes('INSERT INTO BOOKINGS')) {
    const newBooking = {
      id: mockStore.bookings.length + 1,
      booking_number: 'CP-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      user_id: params[0],
      show_id: params[1],
      seats: params[2],
      total_amount: params[3],
      discount_amount: params[4] || 0,
      final_amount: params[5],
      payment_method: params[6],
      qr_code: params[7],
      status: 'CONFIRMED',
      created_at: new Date()
    };
    mockStore.bookings.push(newBooking);
    return [{ insertId: newBooking.id }, []];
  }

  if (upperSql.includes('INSERT INTO REVIEWS')) {
    const newReview = { id: mockStore.reviews.length + 1, movie_id: params[0], user_id: params[1], rating: params[2], comment: params[3], created_at: new Date() };
    mockStore.reviews.push(newReview);
    return [{ insertId: newReview.id }, []];
  }

  if (upperSql.includes('UPDATE BOOKINGS SET STATUS = \'CANCELLED\'')) {
    const bId = params[0];
    const b = mockStore.bookings.find(bk => bk.id == bId);
    if (b) b.status = 'CANCELLED';
    return [{ affectedRows: 1 }, []];
  }

  return [[], []];
}

module.exports = smartPool;

