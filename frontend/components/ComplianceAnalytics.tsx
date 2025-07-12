"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

interface ComplianceAnalytics {
  overallStats: any[];
  byMetricType: any[];
  upcomingAudits: any[];
  trendData: any[];
  riskScore: any[];
  summary: {
    totalMetrics: number;
    complianceRate: number;
    criticalIssues: number;
    underReview: number;
  };
}

export default function ComplianceAnalytics() {
  const [data, setData] = useState<ComplianceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5050/api/compliance/analytics');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching compliance analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Failed to load compliance analytics
      </div>
    );
  }

  // Chart configurations
  const complianceOverviewData = {
    labels: (data.overallStats || []).map(stat => stat.status),
    datasets: [{
      data: (data.overallStats || []).map(stat => stat.percentage),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',   // Green for Compliant
        'rgba(251, 191, 36, 0.8)',  // Yellow for Under Review
        'rgba(239, 68, 68, 0.8)',   // Red for Non-Compliant
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const metricTypeData = {
    labels: (data.byMetricType || []).map(item => item.metric_type),
    datasets: [{
      label: 'Compliance Status',
      data: (data.byMetricType || []).map(item => {
        switch(item.status) {
          case 'Compliant': return 100;
          case 'Under Review': return 70;
          case 'Non-Compliant': return 30;
          default: return 50;
        }
      }),
      backgroundColor: (data.byMetricType || []).map(item => {
        switch(item.status) {
          case 'Compliant': return 'rgba(34, 197, 94, 0.8)';
          case 'Under Review': return 'rgba(251, 191, 36, 0.8)';
          case 'Non-Compliant': return 'rgba(239, 68, 68, 0.8)';
          default: return 'rgba(156, 163, 175, 0.8)';
        }
      }),
      borderColor: (data.byMetricType || []).map(item => {
        switch(item.status) {
          case 'Compliant': return 'rgba(34, 197, 94, 1)';
          case 'Under Review': return 'rgba(251, 191, 36, 1)';
          case 'Non-Compliant': return 'rgba(239, 68, 68, 1)';
          default: return 'rgba(156, 163, 175, 1)';
        }
      }),
      borderWidth: 1,
    }]
  };

  const riskRadarData = {
    labels: (data.byMetricType || []).map(item => item.metric_type),
    datasets: [{
      label: 'Risk Assessment',
      data: (data.riskScore || []).map(item => 100 - (item.risk_weight * 25)),
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      borderColor: 'rgba(6, 182, 212, 1)',
      pointBackgroundColor: 'rgba(6, 182, 212, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(6, 182, 212, 1)',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(6, 182, 212, 0.5)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        pointLabels: {
          color: '#ffffff',
          font: {
            size: 12,
          }
        },
        ticks: {
          color: '#ffffff',
          backdropColor: 'transparent',
        },
        min: 0,
        max: 100,
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Compliance Analytics</h2>
          <p className="text-gray-400">Advanced compliance monitoring and risk assessment</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Metrics</option>
            {(data.byMetricType || []).map(item => (
              <option key={item.metric_type} value={item.metric_type}>
                {item.metric_type}
              </option>
            ))}
          </select>
          
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
              <ShieldCheckIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">{(Number(data.summary?.complianceRate) || 0).toFixed(1)}%</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Compliance Rate</h3>
          <p className="text-green-100 text-sm">Overall regulatory compliance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
              <DocumentCheckIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">{data.summary?.totalMetrics || 0}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Total Metrics</h3>
          <p className="text-blue-100 text-sm">Compliance areas monitored</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
              <ClockIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">{data.summary?.underReview || 0}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Under Review</h3>
          <p className="text-yellow-100 text-sm">Items pending assessment</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
              <ExclamationTriangleIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">{data.summary?.criticalIssues || 0}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Critical Issues</h3>
          <p className="text-red-100 text-sm">Non-compliant items</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Compliance Overview Doughnut */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Compliance Overview
          </h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={complianceOverviewData} options={{
              ...chartOptions,
              cutout: '60%',
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  position: 'right' as const,
                }
              }
            }} />
          </div>
        </motion.div>

        {/* Risk Assessment Radar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Risk Assessment
          </h3>
          <div style={{ height: '300px' }}>
            <Radar data={riskRadarData} options={radarOptions} />
          </div>
        </motion.div>
      </div>

      {/* Metric Type Status Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <DocumentCheckIcon className="h-5 w-5 mr-2" />
          Compliance Status by Metric Type
        </h3>
        <div style={{ height: '400px' }}>
          <Bar data={metricTypeData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Upcoming Audits Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Upcoming Audits Timeline
        </h3>
        <div className="space-y-4">
          {(data.upcomingAudits || []).map((audit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                audit.urgency === 'urgent' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : audit.urgency === 'due_soon'
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">{audit.metric_type}</h4>
                  <p className="text-gray-400 text-sm">{audit.findings}</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-2 ${
                    audit.urgency === 'urgent' ? 'text-red-400' :
                    audit.urgency === 'due_soon' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {audit.urgency === 'urgent' && <BellIcon className="h-4 w-4" />}
                    <span className="text-sm font-medium">
                      {new Date(audit.next_audit_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Status: {audit.status}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
