-- Database Schema for Citi LATAM RegInsight Dashboard

-- SVPs Table
CREATE TABLE svps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  budget_allocated DECIMAL(15,2) NOT NULL,
  budget_spent DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- VPs Table
CREATE TABLE vps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  svp_id INTEGER REFERENCES svps(id),
  department VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  svp_id INTEGER REFERENCES svps(id),
  vp_id INTEGER REFERENCES vps(id),
  status VARCHAR(50) NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  next_milestone VARCHAR(200),
  compliance_status VARCHAR(50) DEFAULT 'Pending',
  budget_allocated DECIMAL(15,2),
  budget_spent DECIMAL(15,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Metrics Table
CREATE TABLE compliance_metrics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  metric_type VARCHAR(100),
  status VARCHAR(50),
  last_audit_date DATE,
  next_audit_date DATE,
  findings TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activities Table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  svp_id INTEGER REFERENCES svps(id),
  project_id INTEGER REFERENCES projects(id),
  priority VARCHAR(20) DEFAULT 'Medium',
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Budget Sources Table
CREATE TABLE budget_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  source_type VARCHAR(50) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  allocated_amount DECIMAL(15,2) DEFAULT 0,
  remaining_amount DECIMAL(15,2) DEFAULT 0,
  fiscal_year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget Allocations Table
CREATE TABLE budget_allocations (
  id SERIAL PRIMARY KEY,
  budget_source_id INTEGER REFERENCES budget_sources(id),
  svp_id INTEGER REFERENCES svps(id),
  allocated_amount DECIMAL(15,2) NOT NULL,
  spent_amount DECIMAL(15,2) DEFAULT 0,
  allocation_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by VARCHAR(100) DEFAULT 'Alex Rodriguez',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Risk Issues Table
CREATE TABLE risk_issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  risk_level VARCHAR(20),
  impact_level VARCHAR(20),
  probability VARCHAR(20),
  svp_id INTEGER REFERENCES svps(id),
  project_id INTEGER REFERENCES projects(id),
  status VARCHAR(50) DEFAULT 'Open',
  owner VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Regulatory Calendar Table
CREATE TABLE regulatory_calendar (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline_date DATE NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pending',
  svp_id INTEGER REFERENCES svps(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_svp ON projects(svp_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_activities_svp ON activities(svp_id);
CREATE INDEX idx_activities_created ON activities(created_at);
CREATE INDEX idx_budget_allocations_svp ON budget_allocations(svp_id);

