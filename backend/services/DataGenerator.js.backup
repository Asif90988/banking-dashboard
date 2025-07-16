class DataGenerator {
  constructor() {
    this.departments = [
      'Technology', 'Operations', 'Risk Management', 'Compliance', 'Finance',
      'Human Resources', 'Legal', 'Marketing', 'Sales', 'Customer Service',
      'Internal Audit', 'Treasury', 'Credit Risk', 'Market Risk', 'Operational Risk',
      'Regulatory Affairs', 'Data Analytics', 'Cybersecurity', 'Digital Banking',
      'Corporate Banking', 'Retail Banking', 'Investment Banking', 'Wealth Management'
    ];

    this.svpNames = [
      'Maria Rodriguez', 'James Chen', 'Sarah Johnson', 'Carlos Santos', 'Ana Gutierrez',
      'Michael Thompson', 'Elena Vasquez', 'David Kim', 'Isabella Martinez', 'Robert Wilson',
      'Lucia Fernandez', 'Ahmed Hassan', 'Priya Patel', 'Giovanni Rossi', 'Fatima Al-Zahra',
      'Jean-Pierre Dubois', 'Yuki Tanaka', 'Olumide Adebayo', 'Ingrid Larsson', 'Raj Sharma',
      'Carmen Delgado', 'Dmitri Volkov', 'Aisha Okonkwo', 'Lars Nielsen', 'Mei-Lin Wang'
    ];

    this.projectNames = [
      'BCRA Compliance Update', 'KYC Enhancement', 'AML System Upgrade', 'Digital Transformation',
      'Risk Management Platform', 'Customer Onboarding Automation', 'Regulatory Reporting System',
      'Data Lake Implementation', 'Mobile Banking App', 'API Gateway Modernization',
      'Cybersecurity Framework', 'Cloud Migration Initiative', 'AI-Powered Analytics',
      'Blockchain Integration', 'Open Banking Platform', 'Credit Scoring Model',
      'Fraud Detection System', 'Customer Experience Portal', 'Regulatory Capital Management',
      'Stress Testing Framework', 'ESG Reporting Platform', 'Digital Identity Verification',
      'Real-time Payment Processing', 'Trade Finance Digitization', 'Wealth Management Portal'
    ];

    this.regulations = [
      'BCRA Capital Requirements', 'AML/CFT Regulations', 'GDPR Compliance', 'Basel III Framework',
      'IFRS 9 Implementation', 'Sarbanes-Oxley Act', 'Dodd-Frank Act', 'MiFID II Directive',
      'PCI DSS Standards', 'ISO 27001 Security', 'COSO Framework', 'FATCA Reporting',
      'CRS Implementation', 'EMIR Regulation', 'SFTR Reporting', 'FRTB Implementation',
      'CECL Standards', 'LIBOR Transition', 'ESG Disclosure Rules', 'Operational Resilience'
    ];

    this.statuses = ['Active', 'In Progress', 'Completed', 'On Hold', 'At Risk', 'Cancelled'];
    this.riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    this.complianceStatuses = ['Compliant', 'Non-Compliant', 'Review Required', 'In Progress'];
  }

  // Generate large-scale budget data
  generateBudgetData(count = 1000) {
    console.log(`🏭 Generating ${count} budget records...`);
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const department = this.getRandomElement(this.departments);
      const svpName = this.getRandomElement(this.svpNames);
      const allocatedBudget = this.getRandomBudget(100000, 10000000);
      const spentAmount = this.getRandomNumber(allocatedBudget * 0.1, allocatedBudget * 0.95);
      const remainingBudget = allocatedBudget - spentAmount;
      const utilizationRate = (spentAmount / allocatedBudget) * 100;
      
      data.push({
        'SVP ID': `SVP${String(i + 1).padStart(4, '0')}`,
        'SVP Name': svpName,
        'Department': department,
        'Allocated Budget': allocatedBudget,
        'Spent Amount': spentAmount,
        'Remaining Budget': remainingBudget,
        'Utilization Rate': Math.round(utilizationRate * 100) / 100,
        'Active Projects': this.getRandomNumber(1, 15),
        'Budget Status': utilizationRate > 90 ? 'Over Budget' : utilizationRate > 75 ? 'High Utilization' : 'Normal',
        'Last Updated': this.getRandomDate(new Date(2024, 0, 1), new Date()),
        'Fiscal Year': 2024,
        'Quarter': Math.ceil((new Date().getMonth() + 1) / 3),
        'Region': 'LATAM',
        'Cost Center': `CC${String(i + 1).padStart(4, '0')}`,
        'Budget Category': this.getRandomElement(['OPEX', 'CAPEX', 'Technology', 'Personnel', 'Infrastructure'])
      });
    }
    
    console.log(`✅ Generated ${data.length} budget records`);
    return data;
  }

  // Generate large-scale project data
  generateProjectData(count = 1000) {
    console.log(`🏭 Generating ${count} project records...`);
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const projectName = this.getRandomElement(this.projectNames);
      const status = this.getRandomElement(this.statuses);
      const startDate = this.getRandomDate(new Date(2023, 0, 1), new Date(2024, 6, 1));
      const endDate = new Date(startDate.getTime() + this.getRandomNumber(30, 365) * 24 * 60 * 60 * 1000);
      const budgetAllocated = this.getRandomBudget(50000, 2000000);
      const budgetSpent = this.getRandomNumber(budgetAllocated * 0.1, budgetAllocated * 0.9);
      const progressPercent = status === 'Completed' ? 100 : 
                             status === 'Cancelled' ? this.getRandomNumber(10, 50) :
                             this.getRandomNumber(5, 95);
      
      data.push({
        'Project ID': `PROJ${String(i + 1).padStart(4, '0')}`,
        'Project Name': `${projectName} ${i + 1}`,
        'Status': status,
        'Progress %': progressPercent,
        'Budget Allocated': budgetAllocated,
        'Budget Spent': budgetSpent,
        'Budget Remaining': budgetAllocated - budgetSpent,
        'Budget Utilization': Math.round((budgetSpent / budgetAllocated) * 100 * 100) / 100,
        'Start Date': startDate,
        'End Date': endDate,
        'Duration Days': Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        'Days Remaining': Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))),
        'SVP Owner': this.getRandomElement(this.svpNames),
        'Department': this.getRandomElement(this.departments),
        'Risk Level': this.getRandomElement(this.riskLevels),
        'Compliance Status': this.getRandomElement(this.complianceStatuses),
        'Team Size': this.getRandomNumber(3, 25),
        'Priority': this.getRandomElement(['Low', 'Medium', 'High', 'Critical']),
        'Project Type': this.getRandomElement(['Regulatory', 'Technology', 'Process Improvement', 'Infrastructure', 'Compliance']),
        'Last Milestone': this.getRandomElement(['Requirements Gathering', 'Design Phase', 'Development', 'Testing', 'Deployment', 'Go-Live']),
        'Next Milestone Date': this.getRandomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
      });
    }
    
    console.log(`✅ Generated ${data.length} project records`);
    return data;
  }

  // Generate large-scale compliance data
  generateComplianceData(count = 1000) {
    console.log(`🏭 Generating ${count} compliance records...`);
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const regulationName = this.getRandomElement(this.regulations);
      const lastAuditDate = this.getRandomDate(new Date(2023, 0, 1), new Date());
      const nextAuditDate = new Date(lastAuditDate.getTime() + this.getRandomNumber(180, 365) * 24 * 60 * 60 * 1000);
      const riskScore = this.getRandomNumber(1, 100);
      const findingsCount = riskScore > 80 ? this.getRandomNumber(3, 10) : 
                           riskScore > 60 ? this.getRandomNumber(1, 5) : 
                           this.getRandomNumber(0, 2);
      
      data.push({
        'Regulation ID': `REG${String(i + 1).padStart(4, '0')}`,
        'Regulation Name': `${regulationName} ${i + 1}`,
        'Compliance Status': this.getRandomElement(this.complianceStatuses),
        'Last Audit Date': lastAuditDate,
        'Next Audit Date': nextAuditDate,
        'Days to Audit': Math.ceil((nextAuditDate - new Date()) / (1000 * 60 * 60 * 24)),
        'Risk Score': riskScore,
        'Risk Level': riskScore > 80 ? 'High' : riskScore > 60 ? 'Medium' : 'Low',
        'Responsible Department': this.getRandomElement(this.departments),
        'Findings Count': findingsCount,
        'Open Findings': Math.floor(findingsCount * this.getRandomNumber(0.2, 0.8)),
        'Remediation Status': findingsCount > 0 ? this.getRandomElement(['In Progress', 'Planned', 'Completed']) : 'N/A',
        'Auditor': this.getRandomElement(['Internal Audit', 'External Auditor', 'Regulatory Body', 'Third Party']),
        'Regulation Type': this.getRandomElement(['Financial', 'Operational', 'Technology', 'Data Privacy', 'Environmental']),
        'Jurisdiction': this.getRandomElement(['Argentina', 'Brazil', 'Chile', 'Colombia', 'Mexico', 'Peru', 'Uruguay']),
        'Criticality': this.getRandomElement(['Low', 'Medium', 'High', 'Critical']),
        'Last Review Date': this.getRandomDate(new Date(2024, 0, 1), new Date()),
        'Review Frequency': this.getRandomElement(['Monthly', 'Quarterly', 'Semi-Annual', 'Annual']),
        'Compliance Officer': this.getRandomElement(this.svpNames)
      });
    }
    
    console.log(`✅ Generated ${data.length} compliance records`);
    return data;
  }

  // Generate mixed data (combination of all types)
  generateMixedData(count = 1000) {
    console.log(`🏭 Generating ${count} mixed records...`);
    
    const budgetCount = Math.floor(count * 0.4);
    const projectCount = Math.floor(count * 0.4);
    const complianceCount = count - budgetCount - projectCount;
    
    const data = {
      budget: this.generateBudgetData(budgetCount),
      projects: this.generateProjectData(projectCount),
      compliance: this.generateComplianceData(complianceCount),
      metadata: {
        totalRecords: count,
        budgetRecords: budgetCount,
        projectRecords: projectCount,
        complianceRecords: complianceCount,
        generatedAt: new Date(),
        generator: 'DataGenerator v1.0'
      }
    };
    
    console.log(`✅ Generated mixed dataset with ${count} total records`);
    return data;
  }

  // Generate time-series data for analytics
  generateTimeSeriesData(type = 'budget', days = 365) {
    console.log(`📈 Generating ${days} days of time-series ${type} data...`);
    
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      if (type === 'budget') {
        data.push({
          date: currentDate,
          totalAllocated: this.getRandomBudget(50000000, 100000000),
          totalSpent: this.getRandomBudget(30000000, 80000000),
          utilizationRate: this.getRandomNumber(60, 95),
          departmentCount: this.getRandomNumber(15, 25),
          activeProjects: this.getRandomNumber(100, 300)
        });
      } else if (type === 'projects') {
        data.push({
          date: currentDate,
          totalProjects: this.getRandomNumber(200, 400),
          activeProjects: this.getRandomNumber(150, 300),
          completedProjects: this.getRandomNumber(10, 50),
          atRiskProjects: this.getRandomNumber(5, 30),
          averageProgress: this.getRandomNumber(45, 85)
        });
      } else if (type === 'compliance') {
        data.push({
          date: currentDate,
          totalRegulations: this.getRandomNumber(80, 120),
          compliantRegulations: this.getRandomNumber(70, 110),
          nonCompliantRegulations: this.getRandomNumber(2, 15),
          averageRiskScore: this.getRandomNumber(65, 85),
          openFindings: this.getRandomNumber(10, 50)
        });
      }
    }
    
    console.log(`✅ Generated ${data.length} time-series data points`);
    return data;
  }

  // Generate realistic Excel-compatible data
  generateExcelData(type = 'budget', count = 100) {
    console.log(`📊 Generating Excel-compatible ${type} data with ${count} records...`);
    
    let data;
    switch (type) {
      case 'budget':
        data = this.generateBudgetData(count);
        break;
      case 'projects':
        data = this.generateProjectData(count);
        break;
      case 'compliance':
        data = this.generateComplianceData(count);
        break;
      default:
        data = this.generateBudgetData(count);
    }
    
    // Convert dates to Excel-friendly format
    data.forEach(record => {
      Object.keys(record).forEach(key => {
        if (record[key] instanceof Date) {
          record[key] = record[key].toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      });
    });
    
    console.log(`✅ Generated Excel-compatible data with ${data.length} records`);
    return data;
  }

  // Utility methods
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomBudget(min, max) {
    // Generate budget amounts in realistic increments
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;
    return Math.round(amount / 1000) * 1000; // Round to nearest thousand
  }

  getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  // Generate data with specific patterns for testing
  generateTestData(pattern = 'normal', count = 100) {
    console.log(`🧪 Generating test data with ${pattern} pattern...`);
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      let record;
      
      switch (pattern) {
        case 'high_utilization':
          // Generate budget data with high utilization rates
          const allocatedBudget = this.getRandomBudget(100000, 1000000);
          const spentAmount = allocatedBudget * this.getRandomNumber(85, 98) / 100;
          record = {
            'SVP ID': `SVP${String(i + 1).padStart(4, '0')}`,
            'SVP Name': this.getRandomElement(this.svpNames),
            'Department': this.getRandomElement(this.departments),
            'Allocated Budget': allocatedBudget,
            'Spent Amount': spentAmount,
            'Utilization Rate': (spentAmount / allocatedBudget) * 100
          };
          break;
          
        case 'at_risk_projects':
          // Generate projects that are at risk
          record = {
            'Project ID': `PROJ${String(i + 1).padStart(4, '0')}`,
            'Project Name': this.getRandomElement(this.projectNames),
            'Status': 'At Risk',
            'Progress %': this.getRandomNumber(20, 60),
            'Risk Level': this.getRandomElement(['High', 'Critical']),
            'Budget Utilization': this.getRandomNumber(80, 120)
          };
          break;
          
        case 'compliance_issues':
          // Generate compliance data with issues
          record = {
            'Regulation ID': `REG${String(i + 1).padStart(4, '0')}`,
            'Regulation Name': this.getRandomElement(this.regulations),
            'Compliance Status': this.getRandomElement(['Non-Compliant', 'Review Required']),
            'Risk Score': this.getRandomNumber(70, 95),
            'Findings Count': this.getRandomNumber(3, 10)
          };
          break;
          
        default:
          // Normal distribution
          record = {
            id: i + 1,
            name: `Record ${i + 1}`,
            value: this.getRandomNumber(1, 1000),
            category: this.getRandomElement(['A', 'B', 'C', 'D']),
            created_at: this.getRandomDate(new Date(2024, 0, 1), new Date())
          };
      }
      
      data.push(record);
    }
    
    console.log(`✅ Generated ${data.length} test records with ${pattern} pattern`);
    return data;
  }

  // Generate performance test data
  generatePerformanceTestData(recordCount = 10000) {
    console.log(`⚡ Generating performance test data with ${recordCount} records...`);
    
    const startTime = Date.now();
    const data = this.generateMixedData(recordCount);
    const endTime = Date.now();
    
    const stats = {
      recordCount: recordCount,
      generationTime: endTime - startTime,
      recordsPerSecond: Math.round(recordCount / ((endTime - startTime) / 1000)),
      dataSize: JSON.stringify(data).length,
      timestamp: new Date()
    };
    
    console.log(`⚡ Performance test completed:`, stats);
    return { data, stats };
  }
}

module.exports = DataGenerator;
