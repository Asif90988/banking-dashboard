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
import { Bar, Doughnut, Line, Radar, Scatter } from 'react-chartjs-2';
import { 
  ExclamationTriangleIcon,
  ShieldExclamationIcon, 
  FireIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  UserGroupIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
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

interface RiskAnalytics {
  riskDistribution: any[];
  riskMatrix: any[];
  riskTrends: any[];
  risksBySVP: any[];
  riskStatus: any[];
  topRiskOwners: any[];
  heatMapData: any[];
  summary: {
    total_risks: number;
    high_critical_risks: number;
    open_risks: number;
    closed_risks: number;
    in_progress_risks: number;
    avg_risk_score: number;
    high_risk_percentage: number;
  };
}

export default function RiskAnalytics() {
  const [data, setData] = useState<RiskAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [heatMapView, setHeatMapView] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      const response = await fetch(`${API_BASE}/risk/analytics`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching risk analytics:', error);
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
          className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Failed to load risk analytics
      </div>
    );
  }

  // Risk distribution chart
  const riskDistributionData = {
    labels: (data.riskDistribution || []).map(item => item.risk_level),
    datasets: [{
      data: (data.riskDistribution || []).map(item => item.percentage),
      backgroundColor: [
        'rgba(220, 38, 38, 0.8)',   // Critical - Red
        'rgba(251, 146, 60, 0.8)',  // High - Orange
        'rgba(251, 191, 36, 0.8)',  // Medium - Yellow
        'rgba(34, 197, 94, 0.8)',   // Low - Green
        'rgba(59, 130, 246, 0.8)',  // Very Low - Blue
      ],
      borderColor: [
        'rgba(220, 38, 38, 1)',
        'rgba(251, 146, 60, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
      ],
      borderWidth: 2,
    }]
  };

  // Risk trends data
  const riskTrendsData = {
    labels: [...new Set((data.riskTrends || []).map(item => 
      new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    ))].reverse(),
    datasets: [
      {
        label: 'Critical',
        data: data.riskTrends?.filter(item => item.risk_level === 'Critical').map(item => item.count) || [],
        borderColor: 'rgba(220, 38, 38, 1)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'High',
        data: data.riskTrends?.filter(item => item.risk_level === 'High').map(item => item.count) || [],
        borderColor: 'rgba(251, 146, 60, 1)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Medium',
        data: data.riskTrends?.filter(item => item.risk_level === 'Medium').map(item => item.count) || [],
        borderColor: 'rgba(251, 191, 36, 1)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // SVP Risk Analysis
  const svpRiskData = {
    labels: [...new Set((data.risksBySVP || []).map(item => item.svp_name))],
    datasets: [{
      label: 'Average Risk Score',
      data: [...new Set((data.risksBySVP || []).map(item => item.svp_name))].map(svp => {
        const svpData = data.risksBySVP?.filter(item => item.svp_name === svp);
        return svpData?.reduce((sum, item) => sum + (item.avg_risk_score || 0), 0) / (svpData?.length || 1);
      }),
      backgroundColor: (data.risksBySVP || []).map(item => {
        const score = item.avg_risk_score || 0;
        if (score >= 4) return 'rgba(220, 38, 38, 0.8)';
        if (score >= 3) return 'rgba(251, 146, 60, 0.8)';
        if (score >= 2) return 'rgba(251, 191, 36, 0.8)';
        return 'rgba(34, 197, 94, 0.8)';
      }),
      borderWidth: 1,
    }]
  };

  // Heat map data preparation
  const impactLevels = ['Critical', 'High', 'Medium', 'Low'];
  const probabilityLevels = ['Very High', 'High', 'Medium', 'Low', 'Very Low'];

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
        borderColor: 'rgba(239, 68, 68, 0.5)',
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

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Risk Analytics</h2>
          <p className="text-gray-400">Advanced risk monitoring and threat assessment</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
            <option value="24m">Last 2 Years</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
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
          className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
              <FireIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">{data.summary?.high_critical_risks || 0}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Critical/High Risks</h3>
          <p className="text-red-100 text-sm">{(Number(data.summary?.high_risk_percentage) || 0).toFixed(1)}% of total risks</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
              <ExclamationTriangleIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">{data.summary?.open_risks || 0}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Open Risks</h3>
          <p className="text-orange-100 text-sm">Require immediate attention</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
              <ClockIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">{data.summary?.in_progress_risks || 0}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">In Progress</h3>
          <p className="text-blue-100 text-sm">Being actively managed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
              <ChartBarIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">{(Number(data.summary?.avg_risk_score) || 0).toFixed(1)}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Avg Risk Score</h3>
          <p className="text-purple-100 text-sm">Overall risk rating (1-5)</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FireIcon className="h-5 w-5 mr-2" />
            Risk Distribution
          </h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={riskDistributionData} options={{
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

        {/* Risk Heat Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <ShieldExclamationIcon className="h-5 w-5 mr-2" />
            Risk Heat Map
          </h3>
          <div className="grid grid-cols-5 gap-1" style={{ height: '280px' }}>
            {impactLevels.map((impact, i) => (
              probabilityLevels.map((prob, j) => {
                const cellData = data.heatMapData?.find(
                  item => item.impact_level === impact && item.probability === prob
                );
                const riskCount = cellData?.risk_count || 0;
                const intensity = Math.min(riskCount / 5, 1); // Normalize to 0-1
                
                return (
                  <motion.div
                    key={`${impact}-${prob}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i * 5 + j) * 0.02 }}
                    className={`relative rounded-lg border border-white/20 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-105 transition-transform`}
                    style={{
                      backgroundColor: intensity > 0 ? 
                        `rgba(220, 38, 38, ${0.3 + intensity * 0.7})` : 
                        'rgba(75, 85, 99, 0.3)',
                      height: '50px'
                    }}
                    title={`${impact} Impact, ${prob} Probability: ${riskCount} risks`}
                  >
                    {riskCount > 0 && (
                      <span className="text-white font-bold">{riskCount}</span>
                    )}
                  </motion.div>
                );
              })
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Low Impact</span>
            <span>High Impact</span>
          </div>
        </motion.div>
      </div>

      {/* Risk Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Risk Trends Over Time
        </h3>
        <div style={{ height: '400px' }}>
          <Line data={riskTrendsData} options={chartOptions} />
        </div>
      </motion.div>

      {/* SVP Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Risk Analysis by SVP
        </h3>
        <div style={{ height: '400px' }}>
          <Bar data={svpRiskData} options={{
            ...chartOptions,
            scales: {
              ...chartOptions.scales,
              y: {
                ...chartOptions.scales.y,
                max: 5,
                ticks: {
                  ...chartOptions.scales.y.ticks,
                  stepSize: 1,
                }
              }
            }
          }} />
        </div>
      </motion.div>

      {/* Top Risk Owners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Top Risk Owners
        </h3>
        <div className="space-y-4">
          {(data.topRiskOwners || []).slice(0, 8).map((owner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  (owner.avg_risk_score || 0) >= 4 ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                  (owner.avg_risk_score || 0) >= 3 ? 'bg-orange-500 shadow-lg shadow-orange-500/50' :
                  (owner.avg_risk_score || 0) >= 2 ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                  'bg-green-500 shadow-lg shadow-green-500/50'
                }`}></div>
                <div>
                  <h4 className="text-white font-medium">{owner.owner}</h4>
                  <p className="text-gray-400 text-sm">
                    Risk Score: {(Number(owner.avg_risk_score) || 0).toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-red-400">
                    <span className="font-bold">{owner.critical_high_risks || 0}</span>
                    <span className="text-gray-400 ml-1">Critical/High</span>
                  </div>
                  <div className="text-orange-400">
                    <span className="font-bold">{owner.open_risks || 0}</span>
                    <span className="text-gray-400 ml-1">Open</span>
                  </div>
                  <div className="text-blue-400">
                    <span className="font-bold">{owner.total_risks || 0}</span>
                    <span className="text-gray-400 ml-1">Total</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
