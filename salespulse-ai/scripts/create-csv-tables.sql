-- Create table for CSV upload metadata
CREATE TABLE IF NOT EXISTS csv_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  row_count INTEGER NOT NULL,
  columns TEXT[] NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'uploaded'
);

-- Create table for storing CSV data
CREATE TABLE IF NOT EXISTS csv_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES csv_uploads(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_csv_uploads_uploaded_at ON csv_uploads(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_status ON csv_uploads(status);
CREATE INDEX IF NOT EXISTS idx_csv_data_upload_id ON csv_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_csv_data_row_index ON csv_data(row_index);
CREATE INDEX IF NOT EXISTS idx_csv_data_data ON csv_data USING GIN(data);

-- Create table for storing analysis results
CREATE TABLE IF NOT EXISTS csv_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES csv_uploads(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  chart_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csv_analysis_upload_id ON csv_analysis(upload_id);
