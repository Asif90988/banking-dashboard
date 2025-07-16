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
  TimeScale,
} from 'chart.js';
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2';
import { 
  ArrowTopRightOnSquareIcon, 
  CalendarIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
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
  TimeScale
);

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  completion_percentage: number;
  next_milestone: string;
  compliance_status: string;
  budget_allocated: number;
  budget_spent: number;
  start_date: string;
  end_date: string;
  created_at: string;
  svp_name: string;
  svp_department: string;
  vp_name: string;
}

export default function ProjectsAnalytics() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project?.svp_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Status Distribution Data
  const statusData = {
    labels: ['On Track', 'At Risk', 'Completed', 'Delayed', 'On Hold'],
    datasets: [{
      data: [
        projects.filter(p => p.status === 'On Track').length,
        projects.filter(p => p.status === 'At Risk').length,
        projects.filter(p => p.status === 'Completed').length,
        projects.filter(p => p.status === 'Delayed').length,
        projects.filter(p => p.status === 'On Hold').length,
      ],
      backgroundColor: [
        '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6B7280'
      ],
      borderColor: [
        '#059669', '#D97706', '#1E40AF', '#DC2626', '#4B5563'
      ],
      borderWidth: 2,
    }]
  };

  // Budget Analysis Data
  const budgetData = {
    labels: projects.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
    datasets: [
      {
        label: 'Allocated',
        data: projects.map(p => p.budget_allocated / 1000000),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Spent',
        data: projects.map(p => p.budget_spent / 1000000),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  // Progress Trend Data (simulated)
  const progressData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Completion %',
        data: [45, 52, 58, 65, 72, 78],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Target %',
        data: [50, 60, 70, 80, 85, 90],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  // Risk vs Budget Scatter
  const riskScatterData = {
    datasets: [{
      label: 'Project Risk Assessment',
      data: projects.map(p => ({
        x: p.budget_allocated / 1000000,
        y: p.completion_percentage,
        label: p.name,
        risk: p.status === 'At Risk' || p.status === 'Delayed' ? 'High' : 
              p.status === 'On Hold' ? 'Medium' : 'Low'
      })),
      backgroundColor: projects.map(p => 
        p.status === 'At Risk' || p.status === 'Delayed' ? 'rgba(239, 68, 68, 0.8)' :
        p.status === 'On Hold' ? 'rgba(245, 158, 11, 0.8)' :
        'rgba(16, 185, 129, 0.8)'
      ),
      borderColor: projects.map(p => 
        p.status === 'At Risk' || p.status === 'Delayed' ? 'rgb(239, 68, 68)' :
        p.status === 'On Hold' ? 'rgb(245, 158, 11)' :
        'rgb(16, 185, 129)'
      ),
      pointRadius: 8,
      pointHoverRadius: 10,
    }]
  };

  // SVP Performance Data
  const svpData = projects.reduce((acc: any, project) => {
    const svp = project.svp_name || 'Unknown';
    if (!acc[svp]) {
      acc[svp] = { total: 0, completed: 0, onTrack: 0, atRisk: 0, delayed: 0 };
    }
    acc[svp].total++;
    if (project.status === 'Completed') acc[svp].completed++;
    if (project.status === 'On Track') acc[svp].onTrack++;
    if (project.status === 'At Risk') acc[svp].atRisk++;
    if (project.status === 'Delayed') acc[svp].delayed++;
    return acc;
  }, {});

  const svpPerformanceData = {
    labels: Object.keys(svpData),
    datasets: [
      {
        label: 'Completed',
        data: Object.values(svpData).map((s: any) => s.completed),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'On Track',
        data: Object.values(svpData).map((s: any) => s.onTrack),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'At Risk',
        data: Object.values(svpData).map((s: any) => s.atRisk),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Delayed',
        data: Object.values(svpData).map((s: any) => s.delayed),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
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
          font: { size: 12 }
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
        ticks: { color: '#9CA3AF', font: { size: 11 } },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        ticks: { color: '#9CA3AF', font: { size: 11 } },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  };

  const scatterOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            return `${context.raw.label}: $${(context.raw.x).toFixed(1)}M (${context.raw.y}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        ...chartOptions.scales.x,
        title: { display: true, text: 'Budget (Millions)', color: '#E5E7EB' }
      },
      y: {
        ...chartOptions.scales.y,
        title: { display: true, text: 'Completion %', color: '#E5E7EB' }
      }
    }
  };

  const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p?.budget_allocated?.toString() || '0') || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (parseFloat(p?.budget_spent?.toString() || '0') || 0), 0);
  const avgCompletion = projects.length > 0 ? projects.reduce((sum, p) => sum + (parseFloat(p?.completion_percentage?.toString() || '0') || 0), 0) / projects.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading projects analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects or SVPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchProjects}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            <span>Open Jira</span>
          </button>
        </div>
      </div>

      {/* Analytics Navigation */}
      <div className="flex space-x-2 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'performance', label: 'Performance' },
          { id: 'budget', label: 'Budget Analysis' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'risks', label: 'Risk Assessment' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedView === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4">
          <div className="text-blue-300 text-sm font-medium">Total Projects</div>
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <div className="text-xs text-blue-200">Active initiatives</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4">
          <div className="text-green-300 text-sm font-medium">Avg Completion</div>
          <div className="text-2xl font-bold text-white">{avgCompletion.toFixed(0)}%</div>
          <div className="text-xs text-green-200">Across all projects</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4">
          <div className="text-purple-300 text-sm font-medium">Total Budget</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</div>
          <div className="text-xs text-purple-200">Allocated funds</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-4">
          <div className="text-orange-300 text-sm font-medium">At Risk</div>
          <div className="text-2xl font-bold text-white">
            {projects.filter(p => p.status === 'At Risk' || p.status === 'Delayed').length}
          </div>
          <div className="text-xs text-orange-200">Need attention</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedView === 'overview' && (
          <>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Project Status Distribution</h3>
              <div className="h-80">
                <Doughnut data={statusData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Progress Trends</h3>
              <div className="h-80">
                <Line data={progressData} options={chartOptions} />
              </div>
            </div>
          </>
        )}

        {selectedView === 'performance' && (
          <div className="col-span-2 bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">SVP Performance Analysis</h3>
            <div className="h-96">
              <Bar data={svpPerformanceData} options={chartOptions} />
            </div>
          </div>
        )}

        {selectedView === 'budget' && (
          <div className="col-span-2 bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Budget Allocation vs Spending</h3>
            <div className="h-96">
              <Bar data={budgetData} options={chartOptions} />
            </div>
          </div>
        )}

        {selectedView === 'risks' && (
          <div className="col-span-2 bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Risk Assessment Matrix</h3>
            <div className="h-96">
              <Scatter data={riskScatterData} options={scatterOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Detailed Project Table */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Project Details</h3>
          <div className="text-sm text-gray-400">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Project</th>
                <th className="text-left py-3 px-4 text-gray-300">SVP</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
                <th className="text-right py-3 px-4 text-gray-300">Progress</th>
                <th className="text-right py-3 px-4 text-gray-300">Budget</th>
                <th className="text-center py-3 px-4 text-gray-300">Compliance</th>
                <th className="text-center py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{project.name}</div>
                    <div className="text-xs text-gray-400">{project.next_milestone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{project.svp_name}</div>
                    <div className="text-xs text-gray-400">{project.svp_department}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'On Track' ? 'bg-green-100 text-green-800' :
                      project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'At Risk' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-white">{project.completion_percentage}%</div>
                    <div className="w-20 bg-gray-700 rounded-full h-2 ml-auto">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${project.completion_percentage}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-white">{formatCurrency(project.budget_allocated)}</div>
                    <div className="text-xs text-gray-400">
                      {formatCurrency(project.budget_spent)} spent
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.compliance_status === 'Compliant' ? 'bg-green-100 text-green-800' :
                      project.compliance_status === 'Non-Compliant' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.compliance_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 transition-colors">
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                    </div>
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
