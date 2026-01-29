-- SQL untuk membuat akun Admin RT testing
-- Jalankan di Supabase SQL Editor

-- Password: admin123 (sudah di-hash dengan bcrypt)
-- Email: admin.rt@test.com

INSERT INTO admin_users (nama, email, password, role, rt_id, is_active, created_at, updated_at)
SELECT 
    'Admin RT Test',
    'admin.rt@test.com',
    '$2a$10$rQnM1yjmxR3JjMf1xzuHBeKJhvG5GpCzU9U3v7EKqKLU.K6RqVKZK', -- admin123
    'ADMIN_RT',
    id,
    true,
    NOW(),
    NOW()
FROM rt_units
WHERE is_active = true
LIMIT 1;

-- Verifikasi akun berhasil dibuat
SELECT id, nama, email, role, is_active FROM admin_users WHERE email = 'admin.rt@test.com';
