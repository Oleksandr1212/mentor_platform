-- Таблиця бронювань
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    mentor_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    summary TEXT,
    description TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця відгуків
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    mentor_id TEXT NOT NULL,
    author_id TEXT,
    author_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Створення індексів для продуктивності
CREATE INDEX IF NOT EXISTS idx_bookings_mentor ON bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mentor ON reviews(mentor_id);
