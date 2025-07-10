const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function createTestExcelFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Budget Data');

  // Add headers
  worksheet.columns = [
    { header: 'SVP Name', key: 'svpName', width: 20 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Budget Allocated', key: 'allocated', width: 15 },
    { header: 'Budget Spent', key: 'spent', width: 15 },
    { header: 'Remaining', key: 'remaining', width: 15 },
    { header: 'Projects', key: 'projects', width: 15 }
  ];

  // Add test data
  const testData = [
    {
      svpName: 'Maria Rodriguez',
      department: 'Risk Management',
      allocated: 900000,
      spent: 687500,
      remaining: 212500,
      projects: 15
    },
    {
      svpName: 'Carlos Santos',
      department: 'Compliance',
      allocated: 750000,
      spent: 412500,
      remaining: 337500,
      projects: 12
    },
    {
      svpName: 'Ana Gutierrez',
      department: 'AML Monitoring',
      allocated: 475000,
      spent: 356250,
      remaining: 118750,
      projects: 8
    }
  ];

  testData.forEach(row => {
    worksheet.addRow(row);
  });

  const filePath = path.join(__dirname, '../testData/budget_test.xlsx');
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Test Excel file created: ${filePath}`);
  return filePath;
}

async function createTestProjectFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Project Data');

  // Add headers
  worksheet.columns = [
    { header: 'Project Name', key: 'projectName', width: 25 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Progress %', key: 'progress', width: 12 },
    { header: 'Budget', key: 'budget', width: 15 },
    { header: 'Owner', key: 'owner', width: 20 }
  ];

  // Add test data
  const testData = [
    {
      projectName: 'BCRA Compliance Update',
      status: 'In Progress',
      progress: 75,
      budget: 200000,
      owner: 'Maria Rodriguez'
    },
    {
      projectName: 'KYC Enhancement',
      status: 'At Risk',
      progress: 45,
      budget: 180000,
      owner: 'Carlos Santos'
    },
    {
      projectName: 'AML System Upgrade',
      status: 'On Track',
      progress: 90,
      budget: 150000,
      owner: 'Ana Gutierrez'
    }
  ];

  testData.forEach(row => {
    worksheet.addRow(row);
  });

  const filePath = path.join(__dirname, '../testData/projects_test.xlsx');
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Test Project file created: ${filePath}`);
  return filePath;
}

// Test configuration
const testConfig = {
  llmEndpoint: 'http://localhost:1234',
  testDataPath: './testData',
  mockDatabase: true,
  enableRealTimeSync: false,
  logLevel: 'debug'
};

const testDataSources = {
  budget_excel: {
    id: 'budget_excel_test',
    type: 'excel',
    name: 'Test Budget Spreadsheet',
    path: './tests/testData/budget_test.xlsx',
    mapping: {
      budgetFields: {
        svpName: 'SVP Name',
        department: 'Department',
        allocated: 'Budget Allocated',
        spent: 'Budget Spent',
        remaining: 'Remaining',
        projects: 'Projects'
      }
    },
    lastUpdated: new Date(),
    autoSync: false
  },
  project_tracker: {
    id: 'project_tracker_test',
    type: 'excel',
    name: 'Test Project Tracker',
    path: './tests/testData/projects_test.xlsx',
    mapping: {
      projectFields: {
        projectName: 'Project Name',
        status: 'Status',
        progress: 'Progress %',
        budget: 'Budget',
        owner: 'Owner'
      }
    },
    lastUpdated: new Date(),
    autoSync: false
  }
};

module.exports = {
  createTestExcelFile,
  createTestProjectFile,
  testConfig,
  testDataSources
};
