-- Seed Data for Citi LATAM RegInsight Dashboard

-- Insert SVPs under Alex (Director)
INSERT INTO svps (name, department, email, budget_allocated, budget_spent) VALUES
('Vinod Kumar', 'Regulatory Compliance', 'vinod.kumar@citi.com', 3200000.00, 2240000.00),
('Sandeep Sharma', 'Risk Management', 'sandeep.sharma@citi.com', 3800000.00, 2660000.00),
('Manju Patel', 'AML Operations', 'manju.patel@citi.com', 2900000.00, 2030000.00),
('Raj Mehta', 'KYC Compliance', 'raj.mehta@citi.com', 2600000.00, 1820000.00),
('Priya Singh', 'Technology Risk', 'priya.singh@citi.com', 4200000.00, 2940000.00),
('Amit Gupta', 'Operational Risk', 'amit.gupta@citi.com', 2800000.00, 1960000.00);

-- Insert VPs under each SVP
INSERT INTO vps (name, svp_id, department, email) VALUES
('Ravi Joshi', 1, 'Regulatory Compliance', 'ravi.joshi@citi.com'),
('Neha Agarwal', 1, 'Regulatory Compliance', 'neha.agarwal@citi.com'),
('Suresh Reddy', 2, 'Risk Management', 'suresh.reddy@citi.com'),
('Kavita Nair', 2, 'Risk Management', 'kavita.nair@citi.com'),
('Deepak Jain', 3, 'AML Operations', 'deepak.jain@citi.com'),
('Sneha Kapoor', 3, 'AML Operations', 'sneha.kapoor@citi.com'),
('Vikram Rao', 4, 'KYC Compliance', 'vikram.rao@citi.com'),
('Pooja Verma', 4, 'KYC Compliance', 'pooja.verma@citi.com'),
('Arjun Malhotra', 5, 'Technology Risk', 'arjun.malhotra@citi.com'),
('Divya Iyer', 5, 'Technology Risk', 'divya.iyer@citi.com'),
('Rohit Bansal', 6, 'Operational Risk', 'rohit.bansal@citi.com'),
('Anjali Saxena', 6, 'Operational Risk', 'anjali.saxena@citi.com');

-- Insert budget sources
INSERT INTO budget_sources (name, description, source_type, total_amount, allocated_amount, remaining_amount, fiscal_year) VALUES
('Corporate Risk Budget', 'Annual corporate risk management budget allocation', 'Corporate', 8000000.00, 6500000.00, 1500000.00, 2024),
('Regulatory Compliance Fund', 'Budget for regulatory compliance initiatives', 'Regulatory', 5000000.00, 4200000.00, 800000.00, 2024),
('Technology Infrastructure', 'IT infrastructure and security budget', 'Technology', 6500000.00, 5100000.00, 1400000.00, 2024),
('AML Enhancement Program', 'Dedicated AML system enhancement budget', 'AML', 3500000.00, 2900000.00, 600000.00, 2024),
('Emergency Response Fund', 'Emergency budget for critical compliance issues', 'Emergency', 2000000.00, 400000.00, 1600000.00, 2024);

-- Insert a few sample projects
INSERT INTO projects (name, description, svp_id, vp_id, status, completion_percentage, next_milestone, compliance_status, budget_allocated, budget_spent, start_date, end_date) VALUES
('LATAM Regulatory Framework', 'Implementation of unified regulatory framework across LATAM', 1, 1, 'On Track', 72, 'Phase 3 Implementation', 'Compliant', 950000.00, 684000.00, '2024-01-15', '2024-12-31'),
('Enterprise Risk Dashboard', 'Comprehensive risk monitoring and reporting system', 2, 3, 'On Track', 68, 'User Acceptance Testing', 'Compliant', 1200000.00, 816000.00, '2024-01-01', '2024-12-15'),
('AML Transaction Monitoring', 'Enhanced AML transaction monitoring system', 3, 5, 'On Track', 75, 'Phase 2 Deployment', 'Compliant', 1100000.00, 825000.00, '2024-01-01', '2024-11-30'),
('KYC Digital Transformation', 'End-to-end KYC process digitization', 4, 7, 'On Track', 54, 'Phase 1 Testing', 'Compliant', 890000.00, 480600.00, '2024-01-15', '2025-01-31'),
('Cybersecurity Enhancement', 'Advanced cybersecurity monitoring and response', 5, 9, 'At Risk', 45, 'Security Assessment', 'Non-Compliant', 1800000.00, 810000.00, '2024-01-01', '2024-12-31'),
('Operational Risk Framework', 'Comprehensive operational risk management system', 6, 11, 'On Track', 61, 'Framework Testing', 'Compliant', 740000.00, 451400.00, '2024-01-01', '2024-12-15');

-- Insert sample activities
INSERT INTO activities (type, description, svp_id, project_id, priority, status, created_at) VALUES
('Budget Review', 'Q4 budget reallocation approved for regulatory compliance', 1, 1, 'high', 'Completed', NOW() - INTERVAL '2 hours'),
('Risk Assessment', 'New vendor risk evaluation completed', 2, 2, 'medium', 'Completed', NOW() - INTERVAL '4 hours'),
('Project Update', 'Monthly status report submitted', 3, 3, 'low', 'Completed', NOW() - INTERVAL '6 hours'),
('Compliance Audit', 'Annual compliance audit initiated', 1, 1, 'high', 'In Progress', NOW() - INTERVAL '1 day'),
('System Deployment', 'AML monitoring system deployed to production', 3, 3, 'high', 'Completed', NOW() - INTERVAL '2 days'),
('Training Session', 'KYC team training on new processes', 4, 4, 'medium', 'Completed', NOW() - INTERVAL '3 days'),
('Security Review', 'Cybersecurity assessment completed', 5, 5, 'high', 'Completed', NOW() - INTERVAL '5 days'),
('Framework Update', 'Operational risk framework updated', 6, 6, 'medium', 'In Progress', NOW() - INTERVAL '1 week'),
('Policy Review', 'Regulatory policy review and updates', 1, 1, 'low', 'Pending', NOW() - INTERVAL '1 week'),
('Data Migration', 'Legacy system data migration completed', 2, 2, 'high', 'Completed', NOW() - INTERVAL '10 days');

-- Insert sample compliance metrics
INSERT INTO compliance_metrics (project_id, metric_type, status, last_audit_date, next_audit_date, findings) VALUES
(1, 'Regulatory Compliance', 'Compliant', '2024-01-15', '2024-04-15', 'All regulatory requirements met'),
(2, 'Risk Management', 'Compliant', '2024-01-20', '2024-04-20', 'Risk controls operating effectively'),
(3, 'AML Compliance', 'Compliant', '2024-01-25', '2024-04-25', 'AML procedures fully implemented'),
(4, 'KYC Compliance', 'Under Review', '2024-02-01', '2024-05-01', 'Minor documentation updates required'),
(5, 'Technology Risk', 'Non-Compliant', '2024-02-05', '2024-05-05', 'Security vulnerabilities identified'),
(6, 'Operational Risk', 'Compliant', '2024-02-10', '2024-05-10', 'Operational controls adequate');

-- Insert sample risk issues
INSERT INTO risk_issues (title, description, risk_level, impact_level, probability, svp_id, project_id, status, owner) VALUES
('Cybersecurity', 'Potential data breach vulnerabilities in legacy systems', 'High', 'High', 'Medium', 5, 5, 'Open', 'Priya Singh'),
('Regulatory Compliance', 'New regulatory requirements may impact current processes', 'Medium', 'High', 'Low', 1, 1, 'Open', 'Vinod Kumar'),
('Data Governance', 'Inconsistent data quality across reporting systems', 'Medium', 'Medium', 'Medium', 2, 2, 'Open', 'Sandeep Sharma'),
('Operational', 'Manual processes creating operational inefficiencies', 'Low', 'Medium', 'High', 6, 6, 'Open', 'Amit Gupta'),
('Financial', 'Budget overruns in technology infrastructure projects', 'Medium', 'High', 'Medium', 5, 5, 'Open', 'Priya Singh');
