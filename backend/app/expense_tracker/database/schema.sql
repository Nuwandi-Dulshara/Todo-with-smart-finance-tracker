CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category VARCHAR(80) NOT NULL,
    payment_method VARCHAR(80) NOT NULL,
    notes TEXT,
    predicted_category VARCHAR(80),
    prediction_confidence REAL,
    anomaly_status VARCHAR(24) NOT NULL DEFAULT 'normal',
    anomaly_score REAL,
    anomaly_explanation TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category VARCHAR(80),
    month VARCHAR(7) NOT NULL,
    budget_amount REAL NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT uq_user_month_category_budget UNIQUE (user_id, month, category)
);
