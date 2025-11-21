-- Create tables for Customer Intelligence System

-- Churn clients table
CREATE TABLE IF NOT EXISTS churn_clients (
  client_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  monthly_investment DECIMAL(15, 2) NOT NULL,
  months_as_client INTEGER NOT NULL,
  churn_probability DECIMAL(5, 4) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 1),
  potential_loss DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  service_type VARCHAR(100),
  budget DECIMAL(15, 2),
  urgency VARCHAR(50),
  city VARCHAR(100),
  channel VARCHAR(100),
  quality_label VARCHAR(50),
  quality_score DECIMAL(5, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client behavior table
CREATE TABLE IF NOT EXISTS client_behavior (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  client_name VARCHAR(255),
  dias_desde_ultima_interaccion INTEGER,
  interacciones_mes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client transactions table
CREATE TABLE IF NOT EXISTS client_transactions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  transaction_date DATE,
  valor_total DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_churn_probability ON churn_clients(churn_probability DESC);
CREATE INDEX IF NOT EXISTS idx_leads_quality ON leads(quality_label, quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_behavior_dias ON client_behavior(dias_desde_ultima_interaccion);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON client_transactions(transaction_date DESC);
