import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import { io, Socket } from 'socket.io-client';

// Chart.js registration (required for Next.js/React 18+)
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

interface StreamingData {
  topic: string;
  data: any;
  timestamp: string;
}

interface AnalyticsMetrics {
  totalTransactions: number;
  totalBudgetUtilization: number;
  activeAlerts: number;
  systemHealth: number;
  dataFreshness: number;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

const RealTimeAnalytics: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [streamingData, setStreamingData] = useState<StreamingData[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalTransactions: 0,
    totalBudgetUtilization: 0,
    activeAlerts: 0,
    systemHealth: 100,
    dataFreshness: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  // Chart data states
  const [budgetTrendData, setBudgetTrendData] = useState<any>(null);
  const [projectStatusData, setProjectStatusData] = useState<any>(null);
  const [transactionVolumeData, setTransactionVolumeData] = useState<any>(null);
  const [riskAnalyticsData, setRiskAnalyticsData] = useState<any>(null);

  // Data buffers for real-time charts
  const budgetDataBuffer = useRef<any[]>([]);
  const projectDataBuffer = useRef<any[]>([]);
  const transactionDataBuffer = useRef<any[]>([]);
  const riskDataBuffer = useRef<any[]>([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(WS_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for streaming data
    newSocket.on('stream-update', (data: StreamingData) => {
      handleStreamingData(data);
    });

    // Listen for system metrics
    newSocket.on('system-metrics', (data: any) => {
      updateSystemMetrics(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStreamingData = (data: StreamingData) => {
    setStreamingData(prev => [data, ...prev.slice(0, 99)]); // Keep last 100 items

    switch (data.topic) {
      case 'budget-updates':
        handleBudgetUpdate(data.data);
        break;
      case 'project-updates':
        handleProjectUpdate(data.data);
        break;
      case 'transaction-stream':
        handleTransactionUpdate(data.data);
        break;
      case 'risk-events':
        handleRiskUpdate(data.data);
        break;
      case 'compliance-alerts':
        handleComplianceAlert(data.data);
        break;
    }
  };

  const handleBudgetUpdate = (data: any) => {
    budgetDataBuffer.current.push({
      timestamp: new Date(data.timestamp),
      utilization: data.utilization_rate,
      allocated: data.allocated_budget,
      spent: data.spent_amount,
      department: data.department
    });

    if (budgetDataBuffer.current.length > 50) {
      budgetDataBuffer.current.shift();
    }

    updateBudgetTrendChart();
  };

  const handleProjectUpdate = (data: any) => {
    projectDataBuffer.current.push({
      timestamp: new Date(data.timestamp),
      progress: data.progress_percent,
      riskScore: data.risk_score,
      status: data.status,
      projectName: data.project_name
    });

    if (projectDataBuffer.current.length > 50) {
      projectDataBuffer.current.shift();
    }

    updateProjectStatusChart();
  };

  const handleTransactionUpdate = (data: any) => {
    transactionDataBuffer.current.push({
      timestamp: new Date(data.processed_at),
      amount: data.amount,
      type: data.type,
      department: data.department
    });

    if (transactionDataBuffer.current.length > 100) {
      transactionDataBuffer.current.shift();
    }

    updateTransactionVolumeChart();
  };

  const handleRiskUpdate = (data: any) => {
    riskDataBuffer.current.push({
      timestamp: new Date(data.detected_at),
      impact: data.financial_impact,
      probability: data.probability,
      type: data.type,
      level: data.impact_level
    });

    if (riskDataBuffer.current.length > 50) {
      riskDataBuffer.current.shift();
    }

    updateRiskAnalyticsChart();
  };

  const handleComplianceAlert = (data: any) => {
    setMetrics(prev => ({
      ...prev,
      activeAlerts: prev.activeAlerts + 1
    }));
  };

  const updateBudgetTrendChart = () => {
    const buffer = budgetDataBuffer.current;
    if (buffer.length === 0) return;

    const chartData = {
      labels: buffer.map(d => d.timestamp.toLocaleTimeString()),
      datasets: [
        {
          label: 'Budget Utilization %',
          data: buffer.map(d => d.utilization),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Allocated Budget (M)',
          data: buffer.map(d => d.allocated / 1000000),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          yAxisID: 'y1'
        }
      ]
    };

    setBudgetTrendData(chartData);
  };

  const updateProjectStatusChart = () => {
    const buffer = projectDataBuffer.current;
    if (buffer.length === 0) return;

    const statusCounts = buffer.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgb(16, 185, 129)',  // Green
            'rgb(245, 158, 11)',  // Yellow
            'rgb(239, 68, 68)',   // Red
            'rgb(59, 130, 246)'   // Blue
          ],
          borderColor: '#1F2937',
          borderWidth: 2
        }
      ]
    };

    setProjectStatusData(chartData);
  };

  const updateTransactionVolumeChart = () => {
    const buffer = transactionDataBuffer.current;
    if (buffer.length === 0) return;

    const volumeByMinute = buffer.reduce((acc, transaction) => {
      const minute = new Date(transaction.timestamp).toLocaleTimeString().slice(0, -3);
      acc[minute] = (acc[minute] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const chartData = {
      labels: Object.keys(volumeByMinute),
      datasets: [
        {
          label: 'Transaction Volume ($)',
          data: Object.values(volumeByMinute),
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 2
        }
      ]
    };

    setTransactionVolumeData(chartData);
  };

  const updateRiskAnalyticsChart = () => {
    const buffer = riskDataBuffer.current;
    if (buffer.length === 0) return;

    const chartData = {
      datasets: [
        {
          label: 'Risk Events',
          data: buffer.map(risk => ({
            x: risk.probability,
            y: risk.impact / 1000000,
            r: risk.level === 'CRITICAL' ? 20 : risk.level === 'HIGH' ? 15 : 10
          })),
          backgroundColor: buffer.map(risk => 
            risk.level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.7)' :
            risk.level === 'HIGH' ? 'rgba(245, 158, 11, 0.7)' :
            'rgba(16, 185, 129, 0.7)'
          ),
          borderColor: '#1F2937',
          borderWidth: 1
        }
      ]
    };

    setRiskAnalyticsData(chartData);
  };

  const updateSystemMetrics = (data: any) => {
    setMetrics(prev => ({
      ...prev,
      systemHealth: data.overall_health,
      dataFreshness: data.data_freshness
    }));
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF'
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#9CA3AF' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#9CA3AF' }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#9CA3AF' }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Executive Insights</h1>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
              }`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
              <div className="text-gray-400 text-sm">
                Last Update: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-white">{metrics.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="text-blue-500 text-2xl">💳</div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Budget Utilization</p>
                <p className="text-3xl font-bold text-white">{metrics.totalBudgetUtilization.toFixed(1)}%</p>
              </div>
              <div className="text-green-500 text-2xl">💰</div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Alerts</p>
                <p className="text-3xl font-bold text-white">{metrics.activeAlerts}</p>
              </div>
              <div className="text-yellow-500 text-2xl">⚠️</div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">System Health</p>
                <p className="text-3xl font-bold text-white">{metrics.systemHealth.toFixed(1)}%</p>
              </div>
              <div className="text-purple-500 text-2xl">🔧</div>
            </div>
          </div>
        </div>

        {/* Real-Time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Budget Trend */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Real-Time Budget Utilization</h3>
            <div className="h-64">
              {budgetTrendData && (
                <Line data={budgetTrendData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Project Status */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Project Status Distribution</h3>
            <div className="h-64">
              {projectStatusData && (
                <Doughnut data={projectStatusData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Transaction Volume */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Transaction Volume</h3>
            <div className="h-64">
              {transactionVolumeData && (
                <Bar data={transactionVolumeData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Risk Analytics */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Analytics</h3>
            <div className="h-64">
              {riskAnalyticsData && (
                <Scatter data={riskAnalyticsData} options={{
                  ...chartOptions,
                  scales: {
                    x: {
                      ...chartOptions.scales.x,
                      title: { display: true, text: 'Probability (%)', color: '#FFFFFF' }
                    },
                    y: {
                      ...chartOptions.scales.y,
                      title: { display: true, text: 'Impact ($M)', color: '#FFFFFF' }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        {/* Streaming Data Feed */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Live Data Stream</h3>
          <div className="max-h-96 overflow-y-auto">
            {streamingData.map((data, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    data.topic === 'budget-updates' ? 'bg-blue-500' :
                    data.topic === 'project-updates' ? 'bg-green-500' :
                    data.topic === 'transaction-stream' ? 'bg-purple-500' :
                    data.topic === 'risk-events' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="text-white text-sm font-medium">{data.topic.replace('-', ' ').toUpperCase()}</p>
                    <p className="text-gray-400 text-xs">{JSON.stringify(data.data).substring(0, 100)}...</p>
                  </div>
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(data.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
