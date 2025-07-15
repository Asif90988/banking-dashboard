class DataGenerator {
  constructor() {
    // VPS-Specific Departments (Different from Mac)
    this.departments = [
      'Global Operations', 'Digital Innovation', 'Enterprise Risk', 'Regulatory Compliance', 'Corporate Finance',
      'Strategic Analytics', 'Legal Affairs', 'Business Development', 'Commercial Banking', 'Client Services',
      'Audit & Control', 'Treasury Operations', 'Credit Management', 'Trading Risk', 'Process Excellence',
      'Government Relations', 'Data Science', 'Information Security', 'FinTech Solutions',
      'Private Banking', 'Trade Finance', 'Securities Services', 'Asset Management'
    ];

    // VPS-Specific SVP Names (Different from Mac)
    this.svpNames = [
      'Alexandre Silva', 'Fernanda Costa', 'Ricardo Mendoza', 'Valentina Torres', 'Sebastian Vargas',
      'Camila Rojas', 'Diego Herrera', 'Natalia Ramos', 'Esteban Morales', 'Adriana Vega',
      'Mateo Castillo', 'Sofia Jimenez', 'Felipe Guerrero', 'Catalina Ruiz', 'Nicolas Flores',
      'Mariana Soto', 'Andres Peña', 'Gabriela Cruz', 'Santiago Reyes', 'Valeria Ortiz',
      'Leonardo Rivera', 'Paola Moreno', 'Joaquin Acosta', 'Carolina Delgado', 'Emilio Vargas'
    ];

    // VPS-Specific Project Names
    this.projectNames = [
      'LATAM Digital Platform', 'RegTech Modernization', 'Cross-Border Payments', 'ESG Framework Implementation',
      'Client Portal Redesign', 'Blockchain Pilot Program', 'AI Risk Analytics', 'Cloud Infrastructure Migration',
      'Mobile Banking 3.0', 'Open Banking Integration', 'Cybersecurity Enhancement', 'Data Governance Platform',
      'Real-Time Monitoring', 'Compliance Automation', 'Customer Analytics Engine', 'Digital Identity Platform',
      'Trade Finance Modernization', 'Wealth Management Suite', 'Risk Calculation Engine', 'Regulatory Dashboard',
      'Process Automation Hub', 'Client Onboarding System', 'Treasury Management Platform', 'Credit Decisioning AI'
    ];

    this.regulations = [
      'LATAM Banking Standards', 'Cross-Border Regulations', 'FATF Guidelines', 'ISO Risk Framework',
      'Regional Compliance Rules', 'Anti-Corruption Laws', 'Data Protection Standards', 'Consumer Protection',
      'Capital Adequacy Rules', 'Liquidity Requirements', 'Operational Risk Standards', 'Market Conduct Rules',
      'Sanctions Compliance', 'Tax Reporting Standards', 'Environmental Standards', 'Corporate Governance'
    ];

    this.statuses = ['Active', 'In Progress', 'Completed', 'On Hold', 'At Risk', 'Cancelled'];
    this.riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    this.complianceStatuses = ['Compliant', 'Non-Compliant', 'Review Required', 'In Progress'];
  }

  // Generate VPS-specific budget data (Higher amounts than Mac)
  generateBudgetData(count = 1000) {
    console.log(`🏭 Generating ${count} VPS budget records...`);
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const department = this.getRandomElement(this.departments);
      const svpName = this.getRandomElement(this.svpNames);
      // VPS has higher budget ranges than Mac
      const allocatedBudget = this.getRandomBudget(500000, 25000000);
      const spentAmount = this.getRandomNumber(allocatedBudget * 0.2, allocatedBudget * 0.98);
      const remainingBudget = allocatedBudget - spentAmount;
      const utilizationRate = (spentAmount / allocatedBudget) * 100;
      
      data.push({
        'SVP ID': `VPS${String(i + 1).padStart(4, '0')}`,
        'SVP Name': svpName,
        'Department': department,
        'Allocated Budget': allocatedBudget,
        'Spent Amount': spentAmount,
        'Remaining Budget': remainingBudget,
        'Utilization Rate': Math.round(utilizationRate * 100) / 100,
        'Quarter': this.getRandomElement(['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025']),
        'Region': this.getRandomElement(['LATAM North', 'LATAM South', 'LATAM Central']),
        'Currency': this.getRandomElement(['USD', 'BRL', 'MXN', 'CLP', 'COP']),
        'Last Updated': this.getRandomDate(new Date(2025, 0, 1), new Date()),
        'Status': this.getRandomElement(this.statuses)
      });
    }
    
    console.log(`✅ Generated ${data.length} VPS budget records`);
    return data;
  }

  // Generate VPS-specific project data
  generateProjectData(count = 500) {
    console.log(`🏗️ Generating ${count} VPS project records...`);
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const projectName = this.getRandomElement(this.projectNames);
      const department = this.getRandomElement(this.departments);
      const svpName = this.getRandomElement(this.svpNames);
      const startDate = this.getRandomDate(new Date(2024, 0, 1), new Date(2025, 0, 1));
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + this.getRandomNumber(3, 18));
      
      // VPS projects have higher budgets
      const budget = this.getRandomBudget(250000, 15000000);
      const spent = this.getRandomNumber(budget * 0.1, budget * 0.9);
      const progress = this.getRandomNumber(10, 95);
      
      data.push({
        'Project ID': `VPS-PROJ-${String(i + 1).padStart(4, '0')}`,
        'Project Name': projectName,
        'Department': department,
        'SVP Name': svpName,
        'Start Date': startDate,
        'End Date': endDate,
        'Budget': budget,
        'Spent': spent,
        'Remaining': budget - spent,
        'Progress %': progress,
        'Status': this.getRandomElement(this.statuses),
        'Risk Level': this.getRandomElement(this.riskLevels),
        'Team Size': this.getRandomNumber(3, 25),
        'Region': this.getRandomElement(['LATAM North', 'LATAM South', 'LATAM Central']),
        'Priority': this.getRandomElement(['Critical', 'High', 'Medium', 'Low'])
      });
    }
    
    console.log(`✅ Generated ${data.length} VPS project records`);
    return data;
  }

  // Generate VPS-specific compliance data
  generateComplianceData(count = 300) {
    console.log(`📋 Generating ${count} VPS compliance records...`);
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const regulation = this.getRandomElement(this.regulations);
      const department = this.getRandomElement(this.departments);
      const svpName = this.getRandomElement(this.svpNames);
      const assessmentDate = this.getRandomDate(new Date(2024, 6, 1), new Date());
      const nextReview = new Date(assessmentDate);
      nextReview.setMonth(nextReview.getMonth() + this.getRandomNumber(3, 12));
      
      data.push({
        'Compliance ID': `VPS-COMP-${String(i + 1).padStart(4, '0')}`,
        'Regulation': regulation,
        'Department': department,
        'SVP Name': svpName,
        'Assessment Date': assessmentDate,
        'Next Review': nextReview,
        'Status': this.getRandomElement(this.complianceStatuses),
        'Risk Level': this.getRandomElement(this.riskLevels),
        'Compliance Score': this.getRandomNumber(65, 98),
        'Issues Found': this.getRandomNumber(0, 15),
        'Issues Resolved': this.getRandomNumber(0, 10),
        'Region': this.getRandomElement(['LATAM North', 'LATAM South', 'LATAM Central']),
        'Auditor': this.getRandomElement(['Internal Audit', 'External Audit', 'Regulatory Review']),
        'Remediation Cost': this.getRandomBudget(10000, 500000)
      });
    }
    
    console.log(`✅ Generated ${data.length} VPS compliance records`);
    return data;
  }

  // Generate mixed dataset for comprehensive testing
  generateMixedDataset(count = 1000) {
    console.log(`🔄 Generating VPS mixed dataset with ${count} total records...`);
    
    const budgetCount = Math.floor(count * 0.5);
    const projectCount = Math.floor(count * 0.3);
    const complianceCount = Math.floor(count * 0.2);
    
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
        generator: 'VPS DataGenerator v1.0',
        environment: 'VPS Production'
      }
    };
    
    console.log(`✅ Generated VPS mixed dataset with ${count} total records`);
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
    const budget = Math.floor(Math.random() * (max - min + 1)) + min;
    return Math.round(budget / 1000) * 1000; // Round to nearest thousand
  }

  getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

module.exports = DataGenerator;
