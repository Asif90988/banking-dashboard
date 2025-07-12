'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  DocumentCheckIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ComplianceMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  description: string;
}

interface ComplianceViolation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  department: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
  assignedTo: string;
}

interface RegulatoryFramework {
  id: string;
  name: string;
  compliance: number;
  violations: number;
  lastAudit: string;
  nextAudit: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  requirements: number;
  completed: number;
}

interface ComplianceOfficer {
  id: string;
  name: string;
  department: string;
  caseload: number;
  resolved: number;
  pending: number;
  performance: number;
  specialization: string[];
}

const VinodComplianceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const complianceMetrics: ComplianceMetric[] = [
    {
      id: '1',
      title: 'Overall Compliance Rate',
      value: '96.8%',
      change: '+0.8%',
      trend: 'up',
      status: 'excellent',
      icon: ShieldCheckIcon,
      description: 'Regulatory compliance across all frameworks'
    },
    {
      id: '2',
      title: 'Active Violations',
      value: '12',
      change: '-3',
      trend: 'down',
      status: 'good',
      icon: ExclamationTriangleIcon,
      description: 'Open compliance violations requiring attention'
    },
    {
      id: '3',
      title: 'Audit Score',
      value: '94.2%',
      change: '+1.5%',
      trend: 'up',
      status: 'excellent',
      icon: DocumentCheckIcon,
      description: 'Latest regulatory audit performance'
    },
    {
      id: '4',
      title: 'Response Time',
      value: '2.3 hrs',
      change: '-0.7 hrs',
      trend: 'down',
      status: 'excellent',
      icon: ClockIcon,
      description: 'Average time to address compliance issues'
    },
    {
      id: '5',
      title: 'Training Completion',
      value: '98.5%',
      change: '+2.1%',
      trend: 'up',
      status: 'excellent',
      icon: ChartBarIcon,
      description: 'Staff compliance training completion rate'
    }
  ];

  const recentViolations: ComplianceViolation[] = [
    {
      id: '1',
      type: 'AML Transaction Monitoring',
      severity: 'medium',
      description: 'Suspicious transaction pattern detected in Mexico operations',
      department: 'AML Operations',
      timestamp: '2 hours ago',
      status: 'investigating',
      assignedTo: 'Carlos Rodriguez'
    },
    {
      id: '2',
      type: 'KYC Documentation',
      severity: 'low',
      description: 'Missing customer documentation for high-value account',
      department: 'Customer Onboarding',
      timestamp: '4 hours ago',
      status: 'open',
      assignedTo: 'Maria Gonzalez'
    },
    {
      id: '3',
      type: 'Sanctions Screening',
      severity: 'high',
      description: 'Potential sanctions match requiring immediate review',
      department: 'Risk Management',
      timestamp: '6 hours ago',
      status: 'investigating',
      assignedTo: 'Miguel Santos'
    },
    {
      id: '4',
      type: 'Data Privacy',
      severity: 'medium',
      description: 'Unauthorized access attempt to customer data',
      department: 'Information Security',
      timestamp: '8 hours ago',
      status: 'resolved',
      assignedTo: 'David Kim'
    }
  ];

  const regulatoryFrameworks: RegulatoryFramework[] = [
    {
      id: '1',
      name: 'Basel III',
      compliance: 98.2,
      violations: 2,
      lastAudit: '2024-11-15',
      nextAudit: '2025-02-15',
      status: 'compliant',
      requirements: 156,
      completed: 153
    },
    {
      id: '2',
      name: 'SOX Compliance',
      compliance: 96.8,
      violations: 3,
      lastAudit: '2024-12-01',
      nextAudit: '2025-03-01',
      status: 'compliant',
      requirements: 89,
      completed: 86
    },
    {
      id: '3',
      name: 'GDPR',
      compliance: 94.5,
      violations: 5,
      lastAudit: '2024-10-20',
      nextAudit: '2025-01-20',
      status: 'warning',
      requirements: 72,
      completed: 68
    },
    {
      id: '4',
      name: 'FATCA',
      compliance: 99.1,
      violations: 1,
      lastAudit: '2024-12-10',
      nextAudit: '2025-03-10',
      status: 'compliant',
      requirements: 45,
      completed: 45
    },
    {
      id: '5',
      name: 'Local Banking Regulations',
      compliance: 95.7,
      violations: 4,
      lastAudit: '2024-11-30',
      nextAudit: '2025-02-28',
      status: 'compliant',
      requirements: 234,
      completed: 224
    }
  ];

  const complianceOfficers: ComplianceOfficer[] = [
    {
      id: '1',
      name: 'Carlos Rodriguez',
      department: 'AML Operations',
      caseload: 23,
      resolved: 18,
      pending: 5,
      performance: 94.3,
      specialization: ['AML', 'Transaction Monitoring', 'Sanctions']
    },
    {
      id: '2',
      name: 'Maria Gonzalez',
      department: 'Regulatory Technology',
      caseload: 19,
      resolved: 16,
      pending: 3,
      performance: 96.8,
      specialization: ['RegTech', 'Data Privacy', 'Automation']
    },
    {
      id: '3',
      name: 'Miguel Santos',
      department: 'Risk Management',
      caseload: 21,
      resolved: 17,
      pending: 4,
      performance: 92.1,
      specialization: ['Risk Assessment', 'Sanctions', 'Audit']
    },
    {
      id: '4',
      name: 'David Kim',
      department: 'Operational Risk',
      caseload: 17,
      resolved: 15,
      pending: 2,
      performance: 95.4,
      specialization: ['Operational Risk', 'Security', 'Incident Response']
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'non-compliant': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Compliance Overview', icon: ShieldCheckIcon },
    { id: 'violations', name: 'Violations & Issues', icon: ExclamationTriangleIcon },
    { id: 'frameworks', name: 'Regulatory Frameworks', icon: DocumentCheckIcon },
    { id: 'officers', name: 'Compliance Officers', icon: ChartBarIcon },
    { id: 'analytics', name: 'Advanced Analytics', icon: ArrowTrendingUpIcon }
  ];

  return (
    <div className="h-full p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Executive Compliance Management
            </h1>
            <p className="text-gray-300">
              Comprehensive regulatory oversight and compliance control for Vinod Kumar
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Live Compliance Data</span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                Last Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {complianceMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  metric.status === 'excellent' ? 'bg-green-500/20' :
                  metric.status === 'good' ? 'bg-blue-500/20' :
                  metric.status === 'warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}>
                  <metric.icon className={`w-6 h-6 ${getStatusColor(metric.status)}`} />
                </div>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-green-400 text-sm font-medium">{metric.change}</span>
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-gray-300 text-sm font-medium">{metric.title}</p>
                <p className="text-gray-400 text-xs mt-1">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800/30 backdrop-blur-sm rounded-xl p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
          <div className="flex-1"></div>
          <div className="flex items-center space-x-2 px-4">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search compliance data..."
              className="bg-transparent text-white placeholder-gray-400 border-none outline-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Recent Violations */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Compliance Issues</h2>
                <div className="flex items-center space-x-2">
                  <BellIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">{recentViolations.filter(v => v.status !== 'resolved').length} Active</span>
                </div>
              </div>
              <div className="space-y-4">
                {recentViolations.slice(0, 4).map((violation, index) => (
                  <motion.div
                    key={violation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(violation.severity)}`}></div>
                          <h3 className="text-white font-medium">{violation.type}</h3>
                          <span className="text-gray-400 text-sm">{violation.timestamp}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{violation.description}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-gray-400">Department: <span className="text-white">{violation.department}</span></span>
                          <span className="text-gray-400">Assigned: <span className="text-white">{violation.assignedTo}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {violation.status === 'resolved' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        ) : violation.status === 'investigating' ? (
                          <InformationCircleIcon className="w-5 h-5 text-blue-400" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          violation.status === 'resolved' ? 'text-green-400' :
                          violation.status === 'investigating' ? 'text-blue-400' : 'text-red-400'
                        }`}>
                          {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Compliance Overview Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Regulatory Framework Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regulatoryFrameworks.slice(0, 6).map((framework, index) => (
                  <motion.div
                    key={framework.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{framework.name}</h3>
                      <span className={`text-sm font-medium ${getComplianceStatusColor(framework.status)}`}>
                        {framework.status.charAt(0).toUpperCase() + framework.status.slice(1)}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-sm">Compliance Rate</span>
                        <span className="text-white font-medium">{framework.compliance}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            framework.compliance >= 95 ? 'bg-green-500' :
                            framework.compliance >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${framework.compliance}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Violations: <span className="text-red-400">{framework.violations}</span></span>
                      <span className="text-gray-400">Next Audit: <span className="text-white">{new Date(framework.nextAudit).toLocaleDateString()}</span></span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Compliance Trends Pie Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Compliance Distribution by Framework</h2>
              <div className="flex items-center justify-center">
                <div className="relative w-80 h-80">
                  {/* Pie Chart SVG */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="40"
                    />
                    {/* Basel III - 30% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="40"
                      strokeDasharray="150.8 502.4"
                      strokeDashoffset="0"
                      className="transition-all duration-1000"
                    />
                    {/* SOX - 25% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="40"
                      strokeDasharray="125.6 502.4"
                      strokeDashoffset="-150.8"
                      className="transition-all duration-1000"
                    />
                    {/* GDPR - 20% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="40"
                      strokeDasharray="100.5 502.4"
                      strokeDashoffset="-276.4"
                      className="transition-all duration-1000"
                    />
                    {/* FATCA - 15% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="40"
                      strokeDasharray="75.4 502.4"
                      strokeDashoffset="-376.9"
                      className="transition-all duration-1000"
                    />
                    {/* Local Regulations - 10% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="40"
                      strokeDasharray="50.2 502.4"
                      strokeDashoffset="-452.3"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">Total</div>
                      <div className="text-lg text-green-400">96.8%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-white text-sm">Basel III</span>
                  <span className="text-gray-400 text-sm">30%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-white text-sm">SOX</span>
                  <span className="text-gray-400 text-sm">25%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-white text-sm">GDPR</span>
                  <span className="text-gray-400 text-sm">20%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-white text-sm">FATCA</span>
                  <span className="text-gray-400 text-sm">15%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-white text-sm">Local Regs</span>
                  <span className="text-gray-400 text-sm">10%</span>
                </div>
              </div>
            </div>

            {/* Violation Severity Distribution */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Violation Severity Analysis</h2>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="30"
                    />
                    {/* Low - 45% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="30"
                      strokeDasharray="197.9 439.8"
                      strokeDashoffset="0"
                      className="transition-all duration-1000"
                    />
                    {/* Medium - 30% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="30"
                      strokeDasharray="131.9 439.8"
                      strokeDashoffset="-197.9"
                      className="transition-all duration-1000"
                    />
                    {/* High - 20% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="30"
                      strokeDasharray="87.9 439.8"
                      strokeDashoffset="-329.8"
                      className="transition-all duration-1000"
                    />
                    {/* Critical - 5% */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="30"
                      strokeDasharray="22.0 439.8"
                      strokeDashoffset="-417.7"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">Violations</div>
                      <div className="text-lg text-red-400">12 Total</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white text-sm font-medium">Low</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">5</div>
                  <div className="text-gray-400 text-xs">45%</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-white text-sm font-medium">Medium</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">4</div>
                  <div className="text-gray-400 text-xs">30%</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-white text-sm font-medium">High</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">2</div>
                  <div className="text-gray-400 text-xs">20%</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-white text-sm font-medium">Critical</span>
                  </div>
                  <div className="text-2xl font-bold text-red-400">1</div>
                  <div className="text-gray-400 text-xs">5%</div>
                </div>
              </div>
            </div>

            {/* Compliance Trends Over Time */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Monthly Compliance Trends</h2>
              <div className="h-64 flex items-end justify-center space-x-4">
                {[
                  { month: 'Jan', compliance: 94.2, violations: 18 },
                  { month: 'Feb', compliance: 95.1, violations: 15 },
                  { month: 'Mar', compliance: 96.3, violations: 12 },
                  { month: 'Apr', compliance: 95.8, violations: 14 },
                  { month: 'May', compliance: 96.8, violations: 12 },
                  { month: 'Jun', compliance: 97.2, violations: 10 }
                ].map((data, index) => (
                  <div key={data.month} className="flex flex-col items-center space-y-2">
                    <div className="text-xs text-gray-400">{data.compliance}%</div>
                    <div
                      className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                      style={{ height: `${(data.compliance - 90) * 4}px` }}
                    ></div>
                    <div className="text-xs text-white font-medium">{data.month}</div>
                    <div className="text-xs text-red-400">{data.violations}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'officers' && (
          <motion.div
            key="officers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Compliance Officers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceOfficers.map((officer, index) => (
                <motion.div
                  key={officer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{officer.name}</h3>
                      <p className="text-gray-300">{officer.department}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{officer.performance}%</div>
                      <div className="text-gray-400 text-sm">Performance</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{officer.caseload}</div>
                      <div className="text-gray-400 text-xs">Total Cases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{officer.resolved}</div>
                      <div className="text-gray-400 text-xs">Resolved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{officer.pending}</div>
                      <div className="text-gray-400 text-xs">Pending</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Case Resolution Rate</span>
                      <span className="text-white font-medium">{Math.round((officer.resolved / officer.caseload) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${(officer.resolved / officer.caseload) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm mb-2">Specializations:</div>
                    <div className="flex flex-wrap gap-2">
                      {officer.specialization.map((spec, specIndex) => (
                        <span
                          key={specIndex}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'frameworks' && (
          <motion.div
            key="frameworks"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Regulatory Frameworks Detailed View */}
            <div className="space-y-6">
              {regulatoryFrameworks.map((framework, index) => (
                <motion.div
                  key={framework.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{framework.name}</h3>
                      <p className="text-gray-300">Regulatory Compliance Framework</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{framework.compliance}%</div>
                      <div className={`text-sm font-medium ${getComplianceStatusColor(framework.status)}`}>
                        {framework.status.charAt(0).toUpperCase() + framework.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{framework.requirements}</div>
                      <div className="text-gray-400 text-xs">Total Requirements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{framework.completed}</div>
                      <div className="text-gray-400 text-xs">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">{framework.violations}</div>
                      <div className="text-gray-400 text-xs">Violations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{framework.requirements - framework.completed}</div>
                      <div className="text-gray-400 text-xs">Remaining</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Completion Progress</span>
                      <span className="text-white font-medium">{Math.round((framework.completed / framework.requirements) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          framework.compliance >= 95 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                          framework.compliance >= 90 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                          'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${(framework.completed / framework.requirements) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Audit: <span className="text-white">{new Date(framework.lastAudit).toLocaleDateString()}</span></span>
                    <span className="text-gray-400">Next Audit: <span className="text-white">{new Date(framework.nextAudit).toLocaleDateString()}</span></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'violations' && (
          <motion.div
            key="violations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* All Violations */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">All Compliance Violations</h2>
                <div className="flex items-center space-x-4">
                  <select className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm">
                    <option>All Severities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <select className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm">
                    <option>All Statuses</option>
                    <option>Open</option>
                    <option>Investigating</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {recentViolations.map((violation, index) => (
                  <motion.div
                    key={violation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-4 h-4 rounded-full ${getSeverityColor(violation.severity)}`}></div>
                          <h3 className="text-white font-medium text-lg">{violation.type}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            violation.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            violation.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            violation.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {violation.severity.toUpperCase()}
                          </span>
                          <span className="text-gray-400 text-sm">{violation.timestamp}</span>
                        </div>
                        <p className="text-gray-300 mb-3">{violation.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <span className="text-gray-400">Department: <span className="text-white font-medium">{violation.department}</span></span>
                          <span className="text-gray-400">Assigned to: <span className="text-white font-medium">{violation.assignedTo}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {violation.status === 'resolved' ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-400" />
                        ) : violation.status === 'investigating' ? (
                          <InformationCircleIcon className="w-6 h-6 text-blue-400" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-red-400" />
                        )}
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          violation.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          violation.status === 'investigating' ? 'bg-blue-500/20 text-blue-400' : 
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                        </span>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VinodComplianceDashboard;
