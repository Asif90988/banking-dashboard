'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon,
  EyeIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

interface VPBudgetData {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  color: string;
  budgetAllocated: number;
  budgetSpent: number;
  budgetUtilization: number;
  performanceScore: number;
  teamSize: number;
  activeProjects: number;
  status: 'excellent' | 'good' | 'needs-attention';
  trend: 'up' | 'down' | 'stable';
  quarterlyBudget: {
    Q1: { allocated: number; spent: number; forecast: number };
    Q2: { allocated: number; spent: number; forecast: number };
    Q3: { allocated: number; spent: number; forecast: number };
    Q4: { allocated: number; spent: number; forecast: number };
  };
  monthlyTrend: number[];
  budgetCategories: {
    personnel: number;
    technology: number;
    operations: number;
    compliance: number;
    training: number;
  };
  approvalLimits: {
    individual: number;
    project: number;
    emergency: number;
  };
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'allocation' | 'expense' | 'transfer' | 'adjustment';
    status: 'approved' | 'pending' | 'rejected';
    approvedBy?: string;
  }>;
}

interface BudgetAllocation {
  id: string;
  vpId: string;
  amount: number;
  category: string;
  description: string;
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'pending' | 'expired';
  approvedBy: string;
  notes?: string;
}

interface BudgetForecast {
  period: string;
  projected: number;
  confidence: number;
  factors: string[];
}

export default function VinodBudgetDashboard() {
  const { socket, connected } = useSocket();
  const [selectedView, setSelectedView] = useState<'overview' | 'allocations' | 'analytics' | 'forecasting' | 'approvals'>('overview');
  const [editingVP, setEditingVP] = useState<string | null>(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedVP, setSelectedVP] = useState<VPBudgetData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced VP Budget Data with comprehensive financial details
  const [vpBudgetData, setVpBudgetData] = useState<VPBudgetData[]>([
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      title: 'VP Regulatory Affairs',
      department: 'Regulatory Affairs',
      avatar: 'SC',
      color: 'from-blue-500 to-cyan-600',
      budgetAllocated: 2800000,
      budgetSpent: 2296000,
      budgetUtilization: 82.1,
      performanceScore: 94.5,
      teamSize: 6,
      activeProjects: 3,
      status: 'excellent',
      trend: 'up',
      quarterlyBudget: {
        Q1: { allocated: 700000, spent: 574000, forecast: 650000 },
        Q2: { allocated: 700000, spent: 0, forecast: 680000 },
        Q3: { allocated: 700000, spent: 0, forecast: 720000 },
        Q4: { allocated: 700000, spent: 0, forecast: 750000 }
      },
      monthlyTrend: [85, 87, 82, 79, 81, 82],
      budgetCategories: {
        personnel: 1680000, // 60%
        technology: 420000,  // 15%
        operations: 560000,  // 20%
        compliance: 112000,  // 4%
        training: 28000      // 1%
      },
      approvalLimits: {
        individual: 50000,
        project: 200000,
        emergency: 100000
      },
      recentTransactions: [
        {
          id: 'txn-001',
          date: '2025-01-11',
          description: 'Q1 Regulatory Compliance Audit - Additional Resources',
          amount: 75000,
          type: 'allocation',
          status: 'approved',
          approvedBy: 'Vinod Kumar'
        },
        {
          id: 'txn-002',
          date: '2025-01-10',
          description: 'Regulatory Technology Platform License',
          amount: 45000,
          type: 'expense',
          status: 'approved',
          approvedBy: 'Sarah Chen'
        }
      ]
    },
    {
      id: 'miguel-santos',
      name: 'Miguel Santos',
      title: 'VP Risk Management',
      department: 'Risk Management',
      avatar: 'MS',
      color: 'from-red-500 to-pink-600',
      budgetAllocated: 2200000,
      budgetSpent: 1656000,
      budgetUtilization: 75.3,
      performanceScore: 88.7,
      teamSize: 5,
      activeProjects: 4,
      status: 'good',
      trend: 'up',
      quarterlyBudget: {
        Q1: { allocated: 550000, spent: 414000, forecast: 500000 },
        Q2: { allocated: 550000, spent: 0, forecast: 520000 },
        Q3: { allocated: 550000, spent: 0, forecast: 580000 },
        Q4: { allocated: 550000, spent: 0, forecast: 600000 }
      },
      monthlyTrend: [78, 76, 75, 73, 74, 75],
      budgetCategories: {
        personnel: 1320000, // 60%
        technology: 330000,  // 15%
        operations: 440000,  // 20%
        compliance: 88000,   // 4%
        training: 22000      // 1%
      },
      approvalLimits: {
        individual: 45000,
        project: 180000,
        emergency: 90000
      },
      recentTransactions: [
        {
          id: 'txn-003',
          date: '2025-01-11',
          description: 'Risk Assessment Framework Development',
          amount: 120000,
          type: 'allocation',
          status: 'pending',
          approvedBy: 'Vinod Kumar'
        }
      ]
    },
    {
      id: 'priya-patel',
      name: 'Priya Patel',
      title: 'VP Internal Audit',
      department: 'Internal Audit',
      avatar: 'PP',
      color: 'from-purple-500 to-indigo-600',
      budgetAllocated: 2600000,
      budgetSpent: 2371200,
      budgetUtilization: 91.2,
      performanceScore: 85.4,
      teamSize: 7,
      activeProjects: 2,
      status: 'needs-attention',
      trend: 'down',
      quarterlyBudget: {
        Q1: { allocated: 650000, spent: 592800, forecast: 620000 },
        Q2: { allocated: 650000, spent: 0, forecast: 640000 },
        Q3: { allocated: 650000, spent: 0, forecast: 680000 },
        Q4: { allocated: 650000, spent: 0, forecast: 700000 }
      },
      monthlyTrend: [88, 89, 91, 93, 92, 91],
      budgetCategories: {
        personnel: 1560000, // 60%
        technology: 390000,  // 15%
        operations: 520000,  // 20%
        compliance: 104000,  // 4%
        training: 26000      // 1%
      },
      approvalLimits: {
        individual: 40000,
        project: 160000,
        emergency: 80000
      },
      recentTransactions: [
        {
          id: 'txn-004',
          date: '2025-01-11',
          description: 'SOX Compliance Review - External Consultants',
          amount: 85000,
          type: 'expense',
          status: 'approved',
          approvedBy: 'Priya Patel'
        }
      ]
    },
    {
      id: 'carlos-rodriguez',
      name: 'Carlos Rodriguez',
      title: 'VP AML Operations',
      department: 'AML Operations',
      avatar: 'CR',
      color: 'from-orange-500 to-red-600',
      budgetAllocated: 2400000,
      budgetSpent: 1653600,
      budgetUtilization: 68.9,
      performanceScore: 91.8,
      teamSize: 5,
      activeProjects: 4,
      status: 'excellent',
      trend: 'up',
      quarterlyBudget: {
        Q1: { allocated: 600000, spent: 413400, forecast: 580000 },
        Q2: { allocated: 600000, spent: 0, forecast: 600000 },
        Q3: { allocated: 600000, spent: 0, forecast: 620000 },
        Q4: { allocated: 600000, spent: 0, forecast: 640000 }
      },
      monthlyTrend: [70, 69, 68, 67, 68, 69],
      budgetCategories: {
        personnel: 1440000, // 60%
        technology: 360000,  // 15%
        operations: 480000,  // 20%
        compliance: 96000,   // 4%
        training: 24000      // 1%
      },
      approvalLimits: {
        individual: 55000,
        project: 220000,
        emergency: 110000
      },
      recentTransactions: [
        {
          id: 'txn-005',
          date: '2025-01-10',
          description: 'AML System Enhancement - Phase 2',
          amount: 150000,
          type: 'allocation',
          status: 'approved',
          approvedBy: 'Vinod Kumar'
        }
      ]
    },
    {
      id: 'lisa-wong',
      name: 'Lisa Wong',
      title: 'VP Policy Management',
      department: 'Policy Management',
      avatar: 'LW',
      color: 'from-green-500 to-teal-600',
      budgetAllocated: 1800000,
      budgetSpent: 1524600,
      budgetUtilization: 84.7,
      performanceScore: 89.2,
      teamSize: 4,
      activeProjects: 3,
      status: 'good',
      trend: 'stable',
      quarterlyBudget: {
        Q1: { allocated: 450000, spent: 381150, forecast: 420000 },
        Q2: { allocated: 450000, spent: 0, forecast: 440000 },
        Q3: { allocated: 450000, spent: 0, forecast: 460000 },
        Q4: { allocated: 450000, spent: 0, forecast: 480000 }
      },
      monthlyTrend: [83, 84, 85, 86, 85, 85],
      budgetCategories: {
        personnel: 1080000, // 60%
        technology: 270000,  // 15%
        operations: 360000,  // 20%
        compliance: 72000,   // 4%
        training: 18000      // 1%
      },
      approvalLimits: {
        individual: 35000,
        project: 140000,
        emergency: 70000
      },
      recentTransactions: [
        {
          id: 'txn-006',
          date: '2025-01-09',
          description: 'Policy Documentation Platform Upgrade',
          amount: 35000,
          type: 'expense',
          status: 'approved',
          approvedBy: 'Lisa Wong'
        }
      ]
    },
    {
      id: 'david-kim',
      name: 'David Kim',
      title: 'VP Operational Risk',
      department: 'Operational Risk',
      avatar: 'DK',
      color: 'from-indigo-500 to-purple-600',
      budgetAllocated: 2300000,
      budgetSpent: 1825800,
      budgetUtilization: 79.4,
      performanceScore: 92.1,
      teamSize: 6,
      activeProjects: 3,
      status: 'excellent',
      trend: 'up',
      quarterlyBudget: {
        Q1: { allocated: 575000, spent: 456450, forecast: 550000 },
        Q2: { allocated: 575000, spent: 0, forecast: 570000 },
        Q3: { allocated: 575000, spent: 0, forecast: 590000 },
        Q4: { allocated: 575000, spent: 0, forecast: 610000 }
      },
      monthlyTrend: [81, 80, 79, 78, 79, 79],
      budgetCategories: {
        personnel: 1380000, // 60%
        technology: 345000,  // 15%
        operations: 460000,  // 20%
        compliance: 92000,   // 4%
        training: 23000      // 1%
      },
      approvalLimits: {
        individual: 50000,
        project: 200000,
        emergency: 100000
      },
      recentTransactions: [
        {
          id: 'txn-007',
          date: '2025-01-08',
          description: 'Operational Risk Framework Tools',
          amount: 65000,
          type: 'allocation',
          status: 'approved',
          approvedBy: 'Vinod Kumar'
        }
      ]
    },
    {
      id: 'maria-gonzalez',
      name: 'Maria Gonzalez',
      title: 'VP Regulatory Technology',
      department: 'RegTech',
      avatar: 'MG',
      color: 'from-cyan-500 to-blue-600',
      budgetAllocated: 2100000,
      budgetSpent: 1812300,
      budgetUtilization: 86.3,
      performanceScore: 90.7,
      teamSize: 5,
      activeProjects: 4,
      status: 'good',
      trend: 'up',
      quarterlyBudget: {
        Q1: { allocated: 525000, spent: 453075, forecast: 500000 },
        Q2: { allocated: 525000, spent: 0, forecast: 520000 },
        Q3: { allocated: 525000, spent: 0, forecast: 540000 },
        Q4: { allocated: 525000, spent: 0, forecast: 560000 }
      },
      monthlyTrend: [84, 85, 86, 87, 86, 86],
      budgetCategories: {
        personnel: 1260000, // 60%
        technology: 315000,  // 15%
        operations: 420000,  // 20%
        compliance: 84000,   // 4%
        training: 21000      // 1%
      },
      approvalLimits: {
        individual: 60000,
        project: 240000,
        emergency: 120000
      },
      recentTransactions: [
        {
          id: 'txn-008',
          date: '2025-01-07',
          description: 'RegTech Platform Development - Cloud Infrastructure',
          amount: 95000,
          type: 'expense',
          status: 'approved',
          approvedBy: 'Maria Gonzalez'
        }
      ]
    }
  ]);

  // Calculate total budget metrics
  const totalBudgetAllocated = vpBudgetData.reduce((sum, vp) => sum + vp.budgetAllocated, 0);
  const totalBudgetSpent = vpBudgetData.reduce((sum, vp) => sum + vp.budgetSpent, 0);
  const totalBudgetRemaining = totalBudgetAllocated - totalBudgetSpent;
  const avgUtilization = vpBudgetData.reduce((sum, vp) => sum + vp.budgetUtilization, 0) / vpBudgetData.length;

  // Budget forecasting data
  const [budgetForecasts] = useState<BudgetForecast[]>([
    {
      period: 'Q2 2025',
      projected: 16800000,
      confidence: 87,
      factors: ['Historical trends', 'Project pipeline', 'Market conditions']
    },
    {
      period: 'Q3 2025',
      projected: 17200000,
      confidence: 82,
      factors: ['Seasonal adjustments', 'Regulatory changes', 'Technology investments']
    },
    {
      period: 'Q4 2025',
      projected: 17800000,
      confidence: 78,
      factors: ['Year-end initiatives', 'Compliance requirements', 'Strategic projects']
    }
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
    toast.success('Budget data refreshed successfully');
  };

  const handleBudgetAllocation = (vpId: string, amount: number, category: string) => {
    setVpBudgetData(prev => prev.map(vp => {
      if (vp.id === vpId) {
        const newAllocated = vp.budgetAllocated + amount;
        const newUtilization = (vp.budgetSpent / newAllocated) * 100;
        return {
          ...vp,
          budgetAllocated: newAllocated,
          budgetUtilization: newUtilization
        };
      }
      return vp;
    }));
    toast.success(`Budget allocation of ${formatCurrency(amount)} approved for ${vpBudgetData.find(vp => vp.id === vpId)?.name}`);
  };

  const handleBudgetTransfer = (fromVpId: string, toVpId: string, amount: number) => {
    setVpBudgetData(prev => prev.map(vp => {
      if (vp.id === fromVpId) {
        const newAllocated = vp.budgetAllocated - amount;
        const newUtilization = (vp.budgetSpent / newAllocated) * 100;
        return {
          ...vp,
          budgetAllocated: newAllocated,
          budgetUtilization: newUtilization
        };
      }
      if (vp.id === toVpId) {
        const newAllocated = vp.budgetAllocated + amount;
        const newUtilization = (vp.budgetSpent / newAllocated) * 100;
        return {
          ...vp,
          budgetAllocated: newAllocated,
          budgetUtilization: newUtilization
        };
      }
      return vp;
    }));
    
    const fromVP = vpBudgetData.find(vp => vp.id === fromVpId);
    const toVP = vpBudgetData.find(vp => vp.id === toVpId);
    toast.success(`Budget transfer of ${formatCurrency(amount)} from ${fromVP?.name} to ${toVP?.name} completed`);
  };

  const filteredVPs = vpBudgetData.filter(vp => {
    const matchesSearch = vp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Executive Budget Management</h1>
            <p className="text-gray-400 text-lg">Comprehensive budget oversight and allocation control for Vinod Kumar</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Live Budget Data</span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 disabled:opacity-50"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <ArrowPathIcon className="h-5 w-5 text-gray-400" />
              </motion.div>
            </button>
            <div className="text-gray-400 text-sm">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Executive KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-5 gap-6 mb-8"
      >
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">+2.3%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{formatCurrency(totalBudgetAllocated)}</h3>
          <p className="text-gray-400 text-sm">Total Budget Allocated</p>
          <p className="text-gray-500 text-xs mt-1">Across 7 departments</p>
        </div>

        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">+1.8%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{formatCurrency(totalBudgetSpent)}</h3>
          <p className="text-gray-400 text-sm">Total Budget Spent</p>
          <p className="text-gray-500 text-xs mt-1">YTD utilization</p>
        </div>

        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingDownIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold">-0.5%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{formatCurrency(totalBudgetRemaining)}</h3>
          <p className="text-gray-400 text-sm">Budget Remaining</p>
          <p className="text-gray-500 text-xs mt-1">Available for allocation</p>
        </div>

        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">+1.2%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{avgUtilization.toFixed(1)}%</h3>
          <p className="text-gray-400 text-sm">Average Utilization</p>
          <p className="text-gray-500 text-xs mt-1">Across all VPs</p>
        </div>

        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <CheckIcon className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">Optimal</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">7</h3>
          <p className="text-gray-400 text-sm">VP Departments</p>
          <p className="text-gray-500 text-xs mt-1">Under management</p>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-2">
          {[
            { id: 'overview', name: 'Budget Overview', icon: ChartBarIcon },
            { id: 'allocations', name: 'Allocations & Transfers', icon: CurrencyDollarIcon },
            { id: 'analytics', name: 'Advanced Analytics', icon: ArrowTrendingUpIcon },
            { id: 'forecasting', name: 'Budget Forecasting', icon: CalendarIcon },
            { id: 'approvals', name: 'Approval Workflow', icon: ShieldCheckIcon }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                selectedView === view.id
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <view.icon className="h-4 w-4" />
              <span>{view.name}</span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VPs or departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="all">All Status</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="needs-attention">Needs Attention</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {selectedView === 'overview' && (
          <BudgetOverviewView 
            vpBudgetData={filteredVPs}
            onEditBudget={(vpId) => setEditingVP(vpId)}
            onAllocateBudget={(vpId) => {
              setSelectedVP(vpBudgetData.find(vp => vp.id === vpId) || null);
              setShowAllocationModal(true);
            }}
          />
        )}

        {selectedView === 'allocations' && (
          <BudgetAllocationsView 
            vpBudgetData={filteredVPs}
            onTransferBudget={handleBudgetTransfer}
            onAllocateBudget={handleBudgetAllocation}
          />
        )}

        {selectedView === 'analytics' && (
          <BudgetAnalyticsView 
            vpBudgetData={filteredVPs}
            timeRange={timeRange}
          />
        )}

        {selectedView === 'forecasting' && (
          <BudgetForecastingView 
            vpBudgetData={filteredVPs}
            forecasts={budgetForecasts}
          />
        )}

        {selectedView === 'approvals' && (
          <BudgetApprovalsView 
            vpBudgetData={filteredVPs}
            onApprove={(transactionId) => {
              toast.success('Transaction approved successfully');
            }}
            onReject={(transactionId) => {
              toast.error('Transaction rejected');
            }}
          />
        )}
      </div>

      {/* Budget Allocation Modal */}
      <BudgetAllocationModal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        selectedVP={selectedVP}
        onAllocate={handleBudgetAllocation}
      />
    </div>
  );
}

// Budget Overview View Component
function BudgetOverviewView({ 
  vpBudgetData, 
  onEditBudget, 
  onAllocateBudget 
}: { 
  vpBudgetData: VPBudgetData[]; 
  onEditBudget: (vpId: string) => void;
  onAllocateBudget: (vpId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {vpBudgetData.map((vp, index) => (
        <motion.div
          key={vp.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300 group"
        >
          {/* VP Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${vp.color} rounded-xl flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{vp.avatar}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{vp.name}</h3>
                <p className="text-gray-400 text-sm">{vp.title}</p>
                <p className="text-gray-500 text-xs">{vp.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditBudget(vp.id)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
              >
                <PencilIcon className="h-4 w-4 text-gray-400" />
              </button>
              <button
                onClick={() => onAllocateBudget(vp.id)}
                className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-all duration-300"
              >
                <PlusIcon className="h-4 w-4 text-green-400" />
              </button>
            </div>
          </div>

          {/* Budget Metrics */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-white">{formatCurrency(vp.budgetAllocated)}</p>
                <p className="text-gray-400 text-xs">Allocated</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-green-400">{formatCurrency(vp.budgetSpent)}</p>
                <p className="text-gray-400 text-xs">Spent</p>
              </div>
            </div>

            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(vp.budgetAllocated - vp.budgetSpent)}</p>
              <p className="text-gray-400 text-xs">Remaining</p>
            </div>
          </div>

          {/* Utilization Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Budget Utilization</span>
              <span className="text-white font-semibold">{vp.budgetUtilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${vp.budgetUtilization}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                className={`h-3 rounded-full ${
                  vp.budgetUtilization > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                  vp.budgetUtilization > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  'bg-gradient-to-r from-green-400 to-emerald-500'
                } shadow-lg`}
              />
            </div>
          </div>

          {/* Status and Performance */}
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              vp.status === 'excellent' ? 'bg-green-800 text-green-200' :
              vp.status === 'good' ? 'bg-blue-800 text-blue-200' :
              'bg-yellow-800 text-yellow-200'
            }`}>
              {vp.status === 'excellent' ? 'Excellent' :
               vp.status === 'good' ? 'Good' : 'Needs Attention'}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">{vp.performanceScore.toFixed(1)}%</span>
              {vp.trend === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
              ) : vp.trend === 'down' ? (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAllocateBudget(vp.id)}
                className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium transition-all duration-300"
              >
                Allocate Budget
              </button>
              <button
                onClick={() => onEditBudget(vp.id)}
                className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-all duration-300"
              >
                View Details
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Budget Allocations View Component
function BudgetAllocationsView({ 
  vpBudgetData, 
  onTransferBudget, 
  onAllocateBudget 
}: { 
  vpBudgetData: VPBudgetData[]; 
  onTransferBudget: (fromVpId: string, toVpId: string, amount: number) => void;
  onAllocateBudget: (vpId: string, amount: number, category: string) => void;
}) {
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleTransfer = () => {
    if (transferFrom && transferTo && transferAmount) {
      onTransferBudget(transferFrom, transferTo, parseFloat(transferAmount));
      setTransferFrom('');
      setTransferTo('');
      setTransferAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Transfer Section */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Budget Transfer</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <select
            value={transferFrom}
            onChange={(e) => setTransferFrom(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="">Transfer From</option>
            {vpBudgetData.map(vp => (
              <option key={vp.id} value={vp.id}>{vp.name}</option>
            ))}
          </select>
          <select
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="">Transfer To</option>
            {vpBudgetData.filter(vp => vp.id !== transferFrom).map(vp => (
              <option key={vp.id} value={vp.id}>{vp.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50"
          />
          <button
            onClick={handleTransfer}
            disabled={!transferFrom || !transferTo || !transferAmount}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Transfer Budget
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Transactions</h3>
        <div className="space-y-4">
          {vpBudgetData.flatMap(vp => 
            vp.recentTransactions.map(transaction => (
              <div key={transaction.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs">{vp.avatar}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{transaction.description}</h4>
                      <p className="text-gray-400 text-sm">{vp.name} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatCurrency(transaction.amount)}</p>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'approved' ? 'bg-green-800 text-green-200' :
                      transaction.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                      'bg-red-800 text-red-200'
                    }`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
                {transaction.approvedBy && (
                  <p className="text-gray-500 text-xs">Approved by: {transaction.approvedBy}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Budget Analytics View Component with Advanced Charts
function BudgetAnalyticsView({ 
  vpBudgetData, 
  timeRange 
}: { 
  vpBudgetData: VPBudgetData[]; 
  timeRange: 'month' | 'quarter' | 'year';
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Interactive Budget Distribution Pie Chart */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Budget Distribution by Department</h3>
        <BudgetDistributionPieChart vpBudgetData={vpBudgetData} />
      </div>

      {/* Budget Utilization Donut Chart */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Budget Utilization Overview</h3>
        <BudgetUtilizationDonutChart vpBudgetData={vpBudgetData} />
      </div>

      {/* Performance vs Budget Scatter Chart */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Performance vs Budget Efficiency</h3>
        <PerformanceBudgetScatterChart vpBudgetData={vpBudgetData} />
      </div>

      {/* Budget Categories Breakdown */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Budget Categories Distribution</h3>
        <BudgetCategoriesPieChart vpBudgetData={vpBudgetData} />
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 lg:col-span-2">
        <h3 className="text-xl font-semibold text-white mb-6">Monthly Budget Utilization Trends</h3>
        <MonthlyTrendLineChart vpBudgetData={vpBudgetData} />
      </div>
    </div>
  );
}

// Interactive Budget Distribution Pie Chart Component
function BudgetDistributionPieChart({ vpBudgetData }: { vpBudgetData: VPBudgetData[] }) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const totalBudget = vpBudgetData.reduce((sum, vp) => sum + vp.budgetAllocated, 0);
  const centerX = 150;
  const centerY = 150;
  const radius = 120;
  const innerRadius = 40;

  let currentAngle = 0;
  const segments = vpBudgetData.map((vp, index) => {
    const percentage = (vp.budgetAllocated / totalBudget) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius + 30;
    const labelX = centerX + labelRadius * Math.cos((midAngle * Math.PI) / 180);
    const labelY = centerY + labelRadius * Math.sin((midAngle * Math.PI) / 180);

    return {
      ...vp,
      pathData,
      percentage,
      labelX,
      labelY,
      midAngle,
      startAngle,
      endAngle
    };
  });

  return (
    <div className="relative">
      <svg width="300" height="300" className="mx-auto">
        <defs>
          {segments.map((segment, index) => (
            <linearGradient key={segment.id} id={`gradient-${segment.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={segment.color.includes('blue') ? '#3B82F6' : 
                                          segment.color.includes('red') ? '#EF4444' :
                                          segment.color.includes('purple') ? '#8B5CF6' :
                                          segment.color.includes('orange') ? '#F97316' :
                                          segment.color.includes('green') ? '#10B981' :
                                          segment.color.includes('indigo') ? '#6366F1' :
                                          '#06B6D4'} />
              <stop offset="100%" stopColor={segment.color.includes('blue') ? '#1D4ED8' : 
                                            segment.color.includes('red') ? '#DC2626' :
                                            segment.color.includes('purple') ? '#7C3AED' :
                                            segment.color.includes('orange') ? '#EA580C' :
                                            segment.color.includes('green') ? '#059669' :
                                            segment.color.includes('indigo') ? '#4F46E5' :
                                            '#0891B2'} />
            </linearGradient>
          ))}
        </defs>

        {segments.map((segment, index) => (
          <motion.path
            key={segment.id}
            d={segment.pathData}
            fill={`url(#gradient-${segment.id})`}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: hoveredSegment === segment.id ? 1.05 : selectedSegment === segment.id ? 1.03 : 1 
            }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onMouseEnter={() => setHoveredSegment(segment.id)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => setSelectedSegment(selectedSegment === segment.id ? null : segment.id)}
            className="cursor-pointer drop-shadow-lg"
            style={{
              filter: hoveredSegment === segment.id ? 'brightness(1.2)' : 'brightness(1)',
              transformOrigin: `${centerX}px ${centerY}px`
            }}
          />
        ))}

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="rgba(0, 0, 0, 0.8)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />

        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="fill-white text-sm font-semibold"
        >
          Total
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="fill-green-400 text-xs font-bold"
        >
          {formatCurrency(totalBudget)}
        </text>

        {/* Percentage labels */}
        {segments.map((segment, index) => (
          <motion.g
            key={`label-${segment.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <text
              x={segment.labelX}
              y={segment.labelY}
              textAnchor="middle"
              className="fill-white text-xs font-semibold"
            >
              {segment.percentage.toFixed(1)}%
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedSegment === segment.id ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'
            }`}
            onClick={() => setSelectedSegment(selectedSegment === segment.id ? null : segment.id)}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${
                  segment.color.includes('blue') ? '#3B82F6, #1D4ED8' : 
                  segment.color.includes('red') ? '#EF4444, #DC2626' :
                  segment.color.includes('purple') ? '#8B5CF6, #7C3AED' :
                  segment.color.includes('orange') ? '#F97316, #EA580C' :
                  segment.color.includes('green') ? '#10B981, #059669' :
                  segment.color.includes('indigo') ? '#6366F1, #4F46E5' :
                  '#06B6D4, #0891B2'
                })`
              }}
            />
            <span className="text-white text-xs font-medium">{segment.avatar}</span>
          </motion.div>
        ))}
      </div>

      {/* Selected segment details */}
      {selectedSegment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20"
        >
          {(() => {
            const segment = segments.find(s => s.id === selectedSegment);
            return segment ? (
              <div>
                <h4 className="text-white font-semibold">{segment.name}</h4>
                <p className="text-gray-400 text-sm">{segment.department}</p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Budget:</span>
                    <span className="text-white font-semibold ml-2">{formatCurrency(segment.budgetAllocated)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Utilization:</span>
                    <span className="text-green-400 font-semibold ml-2">{segment.budgetUtilization.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </motion.div>
      )}
    </div>
  );
}

// Budget Utilization Donut Chart Component
function BudgetUtilizationDonutChart({ vpBudgetData }: { vpBudgetData: VPBudgetData[] }) {
  const [hoveredVP, setHoveredVP] = useState<string | null>(null);

  const centerX = 120;
  const centerY = 120;
  const outerRadius = 100;
  const innerRadius = 60;

  return (
    <div className="relative">
      <svg width="240" height="240" className="mx-auto">
        <defs>
          <linearGradient id="utilizationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        {vpBudgetData.map((vp, index) => {
          const angle = (vp.budgetUtilization / 100) * 360;
          const rotation = index * 45; // Spread them around
          
          return (
            <motion.g
              key={vp.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: hoveredVP === vp.id ? 1.1 : 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredVP(vp.id)}
              onMouseLeave={() => setHoveredVP(null)}
              style={{ transformOrigin: `${centerX}px ${centerY}px` }}
            >
              <circle
                cx={centerX}
                cy={centerY}
                r={outerRadius - index * 8}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={outerRadius - index * 8}
                fill="none"
                stroke={`url(#gradient-${vp.id})`}
                strokeWidth="8"
                strokeDasharray={`${(angle / 360) * 2 * Math.PI * (outerRadius - index * 8)} ${2 * Math.PI * (outerRadius - index * 8)}`}
                strokeDashoffset={0}
                transform={`rotate(${rotation} ${centerX} ${centerY})`}
                className="drop-shadow-lg"
              />
            </motion.g>
          );
        })}

        {/* Center content */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="rgba(0, 0, 0, 0.8)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />

        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          className="fill-white text-sm font-semibold"
        >
          Avg Util
        </text>
        <text
          x={centerX}
          y={centerY + 5}
          textAnchor="middle"
          className="fill-green-400 text-lg font-bold"
        >
          {(vpBudgetData.reduce((sum, vp) => sum + vp.budgetUtilization, 0) / vpBudgetData.length).toFixed(1)}%
        </text>
      </svg>

      {/* VP List */}
      <div className="mt-4 space-y-2">
        {vpBudgetData.map((vp, index) => (
          <motion.div
            key={vp.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
              hoveredVP === vp.id ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'
            }`}
            onMouseEnter={() => setHoveredVP(vp.id)}
            onMouseLeave={() => setHoveredVP(null)}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${vp.color}`} />
              <span className="text-white text-sm font-medium">{vp.avatar}</span>
            </div>
            <span className={`text-sm font-semibold ${
              vp.budgetUtilization > 90 ? 'text-red-400' :
              vp.budgetUtilization > 80 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {vp.budgetUtilization.toFixed(1)}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Performance vs Budget Scatter Chart Component
function PerformanceBudgetScatterChart({ vpBudgetData }: { vpBudgetData: VPBudgetData[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const chartWidth = 300;
  const chartHeight = 200;
  const padding = 40;

  const maxPerformance = Math.max(...vpBudgetData.map(vp => vp.performanceScore));
  const maxUtilization = Math.max(...vpBudgetData.map(vp => vp.budgetUtilization));

  return (
    <div className="relative">
      <svg width={chartWidth + padding * 2} height={chartHeight + padding * 2} className="mx-auto">
        <defs>
          {vpBudgetData.map(vp => (
            <radialGradient key={`scatter-${vp.id}`} id={`scatter-gradient-${vp.id}`}>
              <stop offset="0%" stopColor={vp.color.includes('blue') ? '#3B82F6' : 
                                          vp.color.includes('red') ? '#EF4444' :
                                          vp.color.includes('purple') ? '#8B5CF6' :
                                          vp.color.includes('orange') ? '#F97316' :
                                          vp.color.includes('green') ? '#10B981' :
                                          vp.color.includes('indigo') ? '#6366F1' :
                                          '#06B6D4'} stopOpacity="0.8" />
              <stop offset="100%" stopColor={vp.color.includes('blue') ? '#1D4ED8' : 
                                            vp.color.includes('red') ? '#DC2626' :
                                            vp.color.includes('purple') ? '#7C3AED' :
                                            vp.color.includes('orange') ? '#EA580C' :
                                            vp.color.includes('green') ? '#059669' :
                                            vp.color.includes('indigo') ? '#4F46E5' :
                                            '#0891B2'} stopOpacity="0.4" />
            </radialGradient>
          ))}
        </defs>

        {/* Grid lines */}
        <g stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1">
          {[0, 25, 50, 75, 100].map(value => (
            <g key={value}>
              <line
                x1={padding}
                y1={padding + (chartHeight * (100 - value)) / 100}
                x2={padding + chartWidth}
                y2={padding + (chartHeight * (100 - value)) / 100}
              />
              <line
                x1={padding + (chartWidth * value) / 100}
                y1={padding}
                x2={padding + (chartWidth * value) / 100}
                y2={padding + chartHeight}
              />
            </g>
          ))}
        </g>

        {/* Data points */}
        {vpBudgetData.map((vp, index) => {
          const x = padding + (chartWidth * vp.budgetUtilization) / 100;
          const y = padding + chartHeight - (chartHeight * vp.performanceScore) / 100;
          const radius = hoveredPoint === vp.id ? 8 : 6;

          return (
            <motion.circle
              key={vp.id}
              cx={x}
              cy={y}
              r={radius}
              fill={`url(#scatter-gradient-${vp.id})`}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredPoint(vp.id)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer drop-shadow-lg"
            />
          );
        })}

        {/* Axis labels */}
        <text
          x={padding + chartWidth / 2}
          y={padding + chartHeight + 30}
          textAnchor="middle"
          className="fill-gray-400 text-xs"
        >
          Budget Utilization (%)
        </text>
        <text
          x={15}
          y={padding + chartHeight / 2}
          textAnchor="middle"
          className="fill-gray-400 text-xs"
          transform={`rotate(-90, 15, ${padding + chartHeight / 2})`}
        >
          Performance Score (%)
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-lg border border-white/20 p-3 z-10"
        >
          {(() => {
            const vp = vpBudgetData.find(v => v.id === hoveredPoint);
            return vp ? (
              <div className="text-center">
                <h4 className="text-white font-semibold text-sm">{vp.name}</h4>
                <p className="text-gray-400 text-xs">{vp.department}</p>
                <div className="mt-1 text-xs">
                  <span className="text-green-400">Performance: {vp.performanceScore.toFixed(1)}%</span>
                  <br />
                  <span className="text-blue-400">Utilization: {vp.budgetUtilization.toFixed(1)}%</span>
                </div>
              </div>
            ) : null;
          })()}
        </motion.div>
      )}
    </div>
  );
}

// Budget Categories Pie Chart Component
function BudgetCategoriesPieChart({ vpBudgetData }: { vpBudgetData: VPBudgetData[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Aggregate all budget categories
  const categoryTotals = vpBudgetData.reduce((acc, vp) => {
    Object.entries(vp.budgetCategories).forEach(([category, amount]) => {
      acc[category] = (acc[category] || 0) + amount;
    });
    return acc;
  }, {} as Record<string, number>);

  const totalCategoryBudget = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  const centerX = 120;
  const centerY = 120;
  const radius = 100;

  const categoryColors = {
    personnel: '#10B981',
    technology: '#3B82F6',
    operations: '#F59E0B',
    compliance: '#EF4444',
    training: '#8B5CF6'
  };

  let currentAngle = 0;
  const categorySegments = Object.entries(categoryTotals).map(([category, amount]) => {
    const percentage = (amount / totalCategoryBudget) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return {
      category,
      amount,
      percentage,
      pathData,
      color: categoryColors[category as keyof typeof categoryColors] || '#6B7280'
    };
  });

  return (
    <div className="relative">
      <svg width="240" height="240" className="mx-auto">
        <defs>
          {categorySegments.map(segment => (
            <linearGradient key={`cat-${segment.category}`} id={`category-gradient-${segment.category}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={segment.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={segment.color} stopOpacity="0.6" />
            </linearGradient>
          ))}
        </defs>

        {categorySegments.map((segment, index) => (
          <motion.path
            key={segment.category}
            d={segment.pathData}
            fill={`url(#category-gradient-${segment.category})`}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: selectedCategory === segment.category ? 1.05 : 1 
            }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onClick={() => setSelectedCategory(selectedCategory === segment.category ? null : segment.category)}
            className="cursor-pointer drop-shadow-lg"
            style={{
              filter: selectedCategory === segment.category ? 'brightness(1.2)' : 'brightness(1)',
              transformOrigin: `${centerX}px ${centerY}px`
            }}
          />
        ))}

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={40}
          fill="rgba(0, 0, 0, 0.8)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />

        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="fill-white text-sm font-semibold"
        >
          Categories
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="fill-green-400 text-xs font-bold"
        >
          {formatCurrency(totalCategoryBudget)}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {categorySegments.map((segment, index) => (
          <motion.div
            key={segment.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedCategory === segment.category ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'
            }`}
            onClick={() => setSelectedCategory(selectedCategory === segment.category ? null : segment.category)}
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-white text-sm font-medium capitalize">{segment.category}</span>
            </div>
            <span className="text-gray-400 text-sm">{segment.percentage.toFixed(1)}%</span>
          </motion.div>
        ))}
      </div>

      {/* Selected category details */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20"
        >
          {(() => {
            const segment = categorySegments.find(s => s.category === selectedCategory);
            return segment ? (
              <div>
                <h4 className="text-white font-semibold capitalize">{segment.category}</h4>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white font-semibold ml-2">{formatCurrency(segment.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Percentage:</span>
                    <span className="text-green-400 font-semibold ml-2">{segment.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </motion.div>
      )}
    </div>
  );
}

// Monthly Trend Line Chart Component
function MonthlyTrendLineChart({ vpBudgetData }: { vpBudgetData: VPBudgetData[] }) {
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="relative">
      <svg width={chartWidth + padding * 2} height={chartHeight + padding * 2} className="mx-auto">
        <defs>
          {vpBudgetData.map(vp => (
            <linearGradient key={`line-${vp.id}`} id={`line-gradient-${vp.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={vp.color.includes('blue') ? '#3B82F6' : 
                                          vp.color.includes('red') ? '#EF4444' :
                                          vp.color.includes('purple') ? '#8B5CF6' :
                                          vp.color.includes('orange') ? '#F97316' :
                                          vp.color.includes('green') ? '#10B981' :
                                          vp.color.includes('indigo') ? '#6366F1' :
                                          '#06B6D4'} />
              <stop offset="100%" stopColor={vp.color.includes('blue') ? '#1D4ED8' : 
                                            vp.color.includes('red') ? '#DC2626' :
                                            vp.color.includes('purple') ? '#7C3AED' :
                                            vp.color.includes('orange') ? '#EA580C' :
                                            vp.color.includes('green') ? '#059669' :
                                            vp.color.includes('indigo') ? '#4F46E5' :
                                            '#0891B2'} />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        <g stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1">
          {[0, 25, 50, 75, 100].map(value => (
            <line
              key={value}
              x1={padding}
              y1={padding + (chartHeight * (100 - value)) / 100}
              x2={padding + chartWidth}
              y2={padding + (chartHeight * (100 - value)) / 100}
            />
          ))}
          {months.map((month, index) => (
            <line
              key={month}
              x1={padding + (chartWidth * index) / (months.length - 1)}
              y1={padding}
              x2={padding + (chartWidth * index) / (months.length - 1)}
              y2={padding + chartHeight}
            />
          ))}
        </g>

        {/* Trend lines */}
        {vpBudgetData.map((vp, vpIndex) => {
          const pathData = vp.monthlyTrend.map((value, index) => {
            const x = padding + (chartWidth * index) / (vp.monthlyTrend.length - 1);
            const y = padding + chartHeight - (chartHeight * value) / 100;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ');

          return (
            <motion.path
              key={vp.id}
              d={pathData}
              fill="none"
              stroke={`url(#line-gradient-${vp.id})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: vpIndex * 0.2, duration: 1.5 }}
              className="drop-shadow-lg"
            />
          );
        })}

        {/* Axis labels */}
        <text
          x={padding + chartWidth / 2}
          y={padding + chartHeight + 30}
          textAnchor="middle"
          className="fill-gray-400 text-xs"
        >
          Months
        </text>
        <text
          x={15}
          y={padding + chartHeight / 2}
          textAnchor="middle"
          className="fill-gray-400 text-xs"
          transform={`rotate(-90, 15, ${padding + chartHeight / 2})`}
        >
          Utilization (%)
        </text>

        {/* Month labels */}
        {months.map((month, index) => (
          <text
            key={month}
            x={padding + (chartWidth * index) / (months.length - 1)}
            y={padding + chartHeight + 20}
            textAnchor="middle"
            className="fill-gray-400 text-xs"
          >
            {month}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {vpBudgetData.map((vp, index) => (
          <motion.div
            key={vp.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + index * 0.1 }}
            className="flex items-center space-x-2"
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${
                  vp.color.includes('blue') ? '#3B82F6, #1D4ED8' : 
                  vp.color.includes('red') ? '#EF4444, #DC2626' :
                  vp.color.includes('purple') ? '#8B5CF6, #7C3AED' :
                  vp.color.includes('orange') ? '#F97316, #EA580C' :
                  vp.color.includes('green') ? '#10B981, #059669' :
                  vp.color.includes('indigo') ? '#6366F1, #4F46E5' :
                  '#06B6D4, #0891B2'
                })`
              }}
            />
            <span className="text-white text-sm font-medium">{vp.avatar}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Budget Forecasting View Component
function BudgetForecastingView({ 
  vpBudgetData, 
  forecasts 
}: { 
  vpBudgetData: VPBudgetData[]; 
  forecasts: BudgetForecast[];
}) {
  return (
    <div className="space-y-6">
      {/* Quarterly Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {forecasts.map((forecast, index) => (
          <motion.div
            key={forecast.period}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">{forecast.period}</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{formatCurrency(forecast.projected)}</p>
                <p className="text-gray-400 text-sm">Projected Budget</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-blue-400">{forecast.confidence}%</p>
                <p className="text-gray-400 text-sm">Confidence Level</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Key Factors:</p>
                {forecast.factors.map((factor, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-xs">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* VP Quarterly Breakdown */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">VP Quarterly Budget Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-300">VP</th>
                <th className="text-right py-3 px-4 text-gray-300">Q1 Allocated</th>
                <th className="text-right py-3 px-4 text-gray-300">Q1 Spent</th>
                <th className="text-right py-3 px-4 text-gray-300">Q2 Forecast</th>
                <th className="text-right py-3 px-4 text-gray-300">Q3 Forecast</th>
                <th className="text-right py-3 px-4 text-gray-300">Q4 Forecast</th>
              </tr>
            </thead>
            <tbody>
              {vpBudgetData.map((vp) => (
                <tr key={vp.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs">{vp.avatar}</span>
                      </div>
                      <span className="text-white font-medium">{vp.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-blue-400">{formatCurrency(vp.quarterlyBudget.Q1.allocated)}</td>
                  <td className="py-3 px-4 text-right text-green-400">{formatCurrency(vp.quarterlyBudget.Q1.spent)}</td>
                  <td className="py-3 px-4 text-right text-yellow-400">{formatCurrency(vp.quarterlyBudget.Q2.forecast)}</td>
                  <td className="py-3 px-4 text-right text-yellow-400">{formatCurrency(vp.quarterlyBudget.Q3.forecast)}</td>
                  <td className="py-3 px-4 text-right text-yellow-400">{formatCurrency(vp.quarterlyBudget.Q4.forecast)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Budget Approvals View Component
function BudgetApprovalsView({ 
  vpBudgetData, 
  onApprove, 
  onReject 
}: { 
  vpBudgetData: VPBudgetData[]; 
  onApprove: (transactionId: string) => void;
  onReject: (transactionId: string) => void;
}) {
  const pendingTransactions = vpBudgetData.flatMap(vp => 
    vp.recentTransactions
      .filter(t => t.status === 'pending')
      .map(t => ({ ...t, vp }))
  );

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Pending Approvals</h3>
        {pendingTransactions.length === 0 ? (
          <div className="text-center py-8">
            <CheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-400">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${transaction.vp.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs">{transaction.vp.avatar}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{transaction.description}</h4>
                      <p className="text-gray-400 text-sm">{transaction.vp.name} • {transaction.date}</p>
                      <p className="text-green-400 font-semibold">{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onReject(transaction.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition-all duration-300"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(transaction.id)}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 font-medium transition-all duration-300"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Limits */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">VP Approval Limits</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {vpBudgetData.map((vp) => (
            <div key={vp.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold text-xs">{vp.avatar}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">{vp.name}</h4>
                  <p className="text-gray-400 text-sm">{vp.department}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Individual:</span>
                  <span className="text-white text-sm">{formatCurrency(vp.approvalLimits.individual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Project:</span>
                  <span className="text-white text-sm">{formatCurrency(vp.approvalLimits.project)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Emergency:</span>
                  <span className="text-white text-sm">{formatCurrency(vp.approvalLimits.emergency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Budget Allocation Modal Component
function BudgetAllocationModal({ 
  isOpen, 
  onClose, 
  selectedVP, 
  onAllocate 
}: { 
  isOpen: boolean;
  onClose: () => void;
  selectedVP: VPBudgetData | null;
  onAllocate: (vpId: string, amount: number, category: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('personnel');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (selectedVP && amount) {
      onAllocate(selectedVP.id, parseFloat(amount), category);
      setAmount('');
      setCategory('personnel');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen || !selectedVP) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Allocate Budget</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className={`w-10 h-10 bg-gradient-to-br ${selectedVP.color} rounded-xl flex items-center justify-center`}>
              <span className="text-white font-bold">{selectedVP.avatar}</span>
            </div>
            <div>
              <h4 className="text-white font-medium">{selectedVP.name}</h4>
              <p className="text-gray-400 text-sm">{selectedVP.department}</p>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
            >
              <option value="personnel">Personnel</option>
              <option value="technology">Technology</option>
              <option value="operations">Operations</option>
              <option value="compliance">Compliance</option>
              <option value="training">Training</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50 resize-none"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!amount}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Allocate Budget
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
