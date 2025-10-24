require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');   
const FormData = require('form-data'); 

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'VisionAid',
  password: process.env.PGPASSWORD || 'your_password',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});
console.log("🗄️ Connected to DB:", process.env.PGDATABASE);

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// test api
app.post("/analyze", async (req, res) => {
  const { image } = req.body; // ảnh base64 từ app

  try {
    const response = await fetch("http://192.168.1.9:7000/upload_base64", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });

    const result = await response.json();

    res.json({
      text: result.text_result,
      audioUrl: result.audio_url,
    });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🧭 Cập nhật vị trí hiện tại của người dùng (volunteer)
app.post('/api/volunteer/update-location', async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  if (!userId || !latitude || !longitude) {
    return res.status(400).json({ success: false, error: "Thiếu thông tin userId hoặc vị trí." });
  }

  try {
    await pool.query(`
      UPDATE users
      SET latitude = $1, longitude = $2
      WHERE id = $3
    `, [latitude, longitude, userId]);

    res.json({ success: true, message: "Cập nhật vị trí thành công" });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// 🧩 Hàm tính khoảng cách Haversine
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // bán kính trái đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


// 🚀 API tìm tình nguyện viên gần nhất
app.post('/api/volunteer/request', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, error: "Thiếu vị trí của người dùng." });
  }

  try {
    // Lấy danh sách volunteer có vị trí
    const { rows } = await pool.query(`
      SELECT id, email, latitude, longitude
      FROM users
      WHERE role IN ('member', 'vip') 
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND status = 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không có tình nguyện viên nào hoạt động." });
    }

    // Tìm volunteer gần nhất
    let nearest = null;
    let minDistance = Infinity;

    rows.forEach(v => {
      const dist = haversine(latitude, longitude, v.latitude, v.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = v;
      }
    });

    res.json({
      success: true,
      nearestVolunteer: {
        id: nearest.id,
        email: nearest.email,
        latitude: nearest.latitude,
        longitude: nearest.longitude,
        distance_km: minDistance
      }
    });

  } catch (err) {
    console.error("Volunteer request error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
