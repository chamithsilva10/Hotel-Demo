const { Pool } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hotel'

const pool = new Pool({ connectionString: DATABASE_URL })

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS guests (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150),
      phone VARCHAR(20),
      room_number VARCHAR(10) NOT NULL,
      check_in TIMESTAMP,
      check_out TIMESTAMP,
      fcm_token TEXT,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      employee_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL,
      position VARCHAR(50),
      email VARCHAR(150),
      phone VARCHAR(20),
      password_hash TEXT NOT NULL,
      fcm_token TEXT,
      is_on_duty BOOLEAN DEFAULT false,
      current_task_count INT DEFAULT 0,
      role VARCHAR(20) DEFAULT 'staff',
      start_date DATE,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id SERIAL PRIMARY KEY,
      guest_id INT REFERENCES guests(id) ON DELETE SET NULL,
      room_number VARCHAR(10) NOT NULL,
      guest_name VARCHAR(100),
      guest_phone VARCHAR(20),
      type VARCHAR(50) NOT NULL,
      description TEXT,
      priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      assigned_to INT REFERENCES staff(id) ON DELETE SET NULL,
      estimated_time INT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      request_id INT REFERENCES service_requests(id) ON DELETE CASCADE,
      staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
      room VARCHAR(10),
      service VARCHAR(50),
      scheduled_time TIME,
      scheduled_date DATE,
      priority VARCHAR(20),
      status VARCHAR(20) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      request_id INT REFERENCES service_requests(id) ON DELETE CASCADE,
      conversation_id INT,
      sender_role VARCHAR(20) NOT NULL,
      sender_id INT,
      sender_name VARCHAR(100),
      text TEXT NOT NULL,
      priority VARCHAR(20),
      is_quick_option BOOLEAN DEFAULT false,
      is_read BOOLEAN DEFAULT false,
      timestamp TIMESTAMP DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      recipient_type VARCHAR(20),
      recipient_id INT,
      type VARCHAR(20) NOT NULL,
      title VARCHAR(200),
      message TEXT,
      icon VARCHAR(50),
      priority VARCHAR(20),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      actor_type VARCHAR(20),
      actor_id INT,
      guest_id INT,
      request_id INT,
      staff_id INT,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
}

module.exports = {
  pool,
  initDatabase,
}
