"use client";

import { useEffect, useState } from "react";
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
  ScriptableContext,
} from 'chart.js';
import { Bar, Doughnut, Scatter, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface BudgetBySVP {
  id: number;
  name: string;
  department: string;
  budget_allocated: number;
  budget_spent: number;
  remaining: number;
  utilization_percentage: number;
  status: 'normal' | 'warning' | 'danger';
}

interface BudgetOverview {
  total_allocated: number;
  total_spent: number;
  remaining: number;
  avg_utilization: number;
}

export default function BudgetAnalytics() {
  const [budgetBySVP, setBudgetBySVP] = useState<BudgetBySVP[]>([]);
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('overview');

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      
      // Fetch budget overview
      const overviewRes = await fetch(`${API_BASE}/budget/overview`);
      const overviewData = await overviewRes.json();
      setBudgetOverview(overviewData);

      // Fetch and deduplicate SVP data
      const svpRes = await fetch(`${API_BASE}/budget/by-svp`);
      const svpData = await svpRes.json();
      
      const deduplicatedSVPs = Array.isArray(svpData) ? 
        svpData.reduce((acc: BudgetBySVP[], current: BudgetBySVP) => {
          const existingIndex = acc.findIndex(svp => svp.name === current.name);
          if (existingIndex >= 0) {
            acc[existingIndex].budget_allocated = parseFloat(acc[existingIndex].budget_allocated?.toString() || '0') + parseFloat(current.budget_allocated?.toString() || '0');
            acc[existingIndex].budget_spent = parseFloat(acc[existingIndex].budget_spent?.toString() || '0') + parseFloat(current.budget_spent?.toString() || '0');
            acc[existingIndex].remaining = parseFloat(acc[existingIndex].remaining?.toString() || '0') + parseFloat(current.remaining?.toString() || '0');
            acc[existingIndex].utilization_percentage = Math.round(
              (acc[existingIndex].budget_spent / acc[existingIndex].budget_allocated) * 100
            );
          } else {
            acc.push({ 
              ...current,
              budget_allocated: parseFloat(current.budget_allocated?.toString() || '0'),
              budget_spent: parseFloat(current.budget_spent?.toString() || '0'),
              remaining: parseFloat(current.remaining?.toString() || '0'),
              utilization_percentage: Math.round(
                (parseFloat(current.budget_spent?.toString() || '0') / parseFloat(current.budget_allocated?.toString() || '0')) * 100
              )
            });
          }
          return acc;
        }, []) : [];
      
      setBudgetBySVP(deduplicatedSVPs);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Budget Allocation Donut Chart
  const allocationChartData = {
    labels: budgetBySVP.map(svp => svp.name),
    datasets: [
      {
        label: 'Budget Allocation',
        data: budgetBySVP.map(svp => svp.budget_allocated),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
        ],
        borderColor: [
          '#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Utilization Bar Chart
  const utilizationChartData = {
    labels: budgetBySVP.map(svp => svp.name),
    datasets: [
      {
        label: 'Allocated',
        data: budgetBySVP.map(svp => svp.budget_allocated / 1000000),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Spent',
        data: budgetBySVP.map(svp => svp.budget_spent / 1000000),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Remaining',
        data: budgetBySVP.map(svp => svp.remaining / 1000000),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
    ],
  };

  // Risk Assessment Scatter Plot
  const riskScatterData = {
    datasets: [
      {
        label: 'SVP Risk Assessment',
        data: budgetBySVP.map(svp => ({
          x: svp.budget_allocated / 1000000,
          y: svp.utilization_percentage,
          label: svp.name
        })),
        backgroundColor: budgetBySVP.map(svp => 
          svp.utilization_percentage > 85 ? 'rgba(239, 68, 68, 0.8)' :
          svp.utilization_percentage > 75 ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(16, 185, 129, 0.8)'
        ),
        borderColor: budgetBySVP.map(svp => 
          svp.utilization_percentage > 85 ? 'rgb(239, 68, 68)' :
          svp.utilization_percentage > 75 ? 'rgb(245, 158, 11)' :
          'rgb(16, 185, 129)'
        ),
        borderWidth: 2,
        pointRadius: 8,
      },
    ],
  };

  // Trend Analysis (Simulated data)
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Budget Utilization %',
        data: [65, 68, 72, 75, 78, 70],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Target Utilization %',
        data: [75, 75, 75, 75, 75, 75],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#E5E7EB',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        borderColor: '#374151',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    }
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#E5E7EB',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.raw.label}: ${formatCurrency(context.raw.x * 1000000)} (${context.raw.y}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Budget Allocated (Millions)',
          color: '#E5E7EB'
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Utilization %',
          color: '#E5E7EB'
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelectedChart('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedChart === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedChart('utilization')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedChart === 'utilization'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Utilization
        </button>
        <button
          onClick={() => setSelectedChart('risk')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedChart === 'risk'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Risk Analysis
        </button>
        <button
          onClick={() => setSelectedChart('trends')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedChart === 'trends'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Trends
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4">
          <div className="text-blue-300 text-sm font-medium">Total Allocated</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(budgetOverview?.total_allocated || 0)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4">
          <div className="text-green-300 text-sm font-medium">Total Spent</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(budgetOverview?.total_spent || 0)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-4">
          <div className="text-orange-300 text-sm font-medium">Remaining</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(budgetOverview?.remaining || 0)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4">
          <div className="text-purple-300 text-sm font-medium">Avg Utilization</div>
          <div className="text-2xl font-bold text-white">
            {budgetOverview?.avg_utilization || 0}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedChart === 'overview' && (
          <>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Budget Allocation by SVP</h3>
              <div className="h-80">
                <Doughnut data={allocationChartData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Budget vs Spending</h3>
              <div className="h-80">
                <Bar data={utilizationChartData} options={chartOptions} />
              </div>
            </div>
          </>
        )}

        {selectedChart === 'utilization' && (
          <div className="col-span-2 bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Utilization Analysis</h3>
            <div className="h-96">
              <Bar data={utilizationChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {selectedChart === 'risk' && (
          <div className="col-span-2 bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Risk Assessment Matrix</h3>
            <div className="h-96">
              <Scatter data={riskScatterData} options={scatterOptions} />
            </div>
          </div>
        )}

        {selectedChart === 'trends' && (
          <div className="col-span-2 bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Budget Utilization Trends</h3>
            <div className="h-96">
              <Line data={trendData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Detailed SVP Table */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">SVP Budget Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">SVP</th>
                <th className="text-left py-3 px-4 text-gray-300">Department</th>
                <th className="text-right py-3 px-4 text-gray-300">Allocated</th>
                <th className="text-right py-3 px-4 text-gray-300">Spent</th>
                <th className="text-right py-3 px-4 text-gray-300">Remaining</th>
                <th className="text-right py-3 px-4 text-gray-300">Utilization</th>
                <th className="text-center py-3 px-4 text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {budgetBySVP.map((svp) => (
                <tr key={svp.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="py-3 px-4 font-medium text-white">{svp.name}</td>
                  <td className="py-3 px-4 text-gray-300">{svp.department}</td>
                  <td className="py-3 px-4 text-right text-blue-400">
                    {formatCurrency(svp.budget_allocated)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400">
                    {formatCurrency(svp.budget_spent)}
                  </td>
                  <td className="py-3 px-4 text-right text-orange-400">
                    {formatCurrency(svp.remaining)}
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {svp.utilization_percentage}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      svp.utilization_percentage > 85 ? 'bg-red-100 text-red-800' :
                      svp.utilization_percentage > 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {svp.utilization_percentage > 85 ? 'High Risk' :
                       svp.utilization_percentage > 75 ? 'Medium Risk' : 'Low Risk'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
