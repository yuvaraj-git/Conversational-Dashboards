-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  current_value DECIMAL(15,2) NOT NULL,
  previous_value DECIMAL(15,2) NOT NULL,
  change DECIMAL(8,2) NOT NULL,
  trend VARCHAR(10) CHECK (trend IN ('up', 'down')) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create historical_metrics table
CREATE TABLE IF NOT EXISTS historical_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_name, month, year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(name);
CREATE INDEX IF NOT EXISTS idx_metrics_category ON metrics(category);
CREATE INDEX IF NOT EXISTS idx_metrics_updated_at ON metrics(updated_at);
CREATE INDEX IF NOT EXISTS idx_historical_metrics_name ON historical_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_historical_metrics_date ON historical_metrics(year, month);

-- Insert sample data
INSERT INTO metrics (name, current_value, previous_value, change, trend, category) VALUES
('Revenue', 125000, 118000, 5.9, 'up', 'financial'),
('Gross Profit', 75000, 70000, 7.1, 'up', 'financial'),
('Conversion Rate', 3.2, 4.1, -22.0, 'down', 'performance'),
('Customer Retention Rate', 87.5, 89.2, -1.9, 'down', 'customer'),
('Cost Per Acquisition', 45, 38, 18.4, 'down', 'marketing'),
('Customer Satisfaction Score', 4.6, 4.4, 4.5, 'up', 'customer'),
('Average Order Value', 89.5, 82.3, 8.7, 'up', 'financial')
ON CONFLICT (name) DO NOTHING;

-- Insert sample historical data
INSERT INTO historical_metrics (metric_name, value, month, year) VALUES
('Revenue', 98000, 'Jan', 2024),
('Revenue', 105000, 'Feb', 2024),
('Revenue', 112000, 'Mar', 2024),
('Revenue', 118000, 'Apr', 2024),
('Revenue', 125000, 'May', 2024),
('Revenue', 132000, 'Jun', 2024),
('Gross Profit', 58000, 'Jan', 2024),
('Gross Profit', 62000, 'Feb', 2024),
('Gross Profit', 65000, 'Mar', 2024),
('Gross Profit', 70000, 'Apr', 2024),
('Gross Profit', 75000, 'May', 2024),
('Gross Profit', 78000, 'Jun', 2024),
('Conversion Rate', 4.2, 'Jan', 2024),
('Conversion Rate', 4.0, 'Feb', 2024),
('Conversion Rate', 3.8, 'Mar', 2024),
('Conversion Rate', 4.1, 'Apr', 2024),
('Conversion Rate', 3.2, 'May', 2024),
('Conversion Rate', 3.5, 'Jun', 2024)
ON CONFLICT (metric_name, month, year) DO NOTHING;
