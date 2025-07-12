'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Toaster } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// Import existing components
import ARIATicker from '../../../components/ARIATicker';
import SanctionsTicker from '../../../components/SanctionsTicker';
import ConnectionDropdown from '../../../components/ConnectionDropdown';
import NotificationDropdown from '../../../components/NotificationDropdown';
import ProjectCreationWizard from '../../../components/projects/ProjectCreationWizard';
import VinodBudgetDashboard from '../../../components/VinodBudgetDashboard';
import VinodComplianceDashboard from '../../../components/VinodComplianceDashboard';

interface SVPData {
  user: {
    id: string;
    name: string;
    title: string;
    department: string;
    avatar: string;
    color: string;
  };
  teamOverview: {
    totalTeamSize: number;
    directReports: number;
    activeProjects: number;
    budgetUtilization: number;
    performanceScore: number;
    complianceRate: number;
  };
  directReports: Array<{
    id: string;
    name: string;
    title: string;
    department: string;
    teamSize: number;
    projectCount: number;
    budgetUtilization: number;
    performanceScore: number;
    status: 'excellent' | 'good' | 'needs-attention';
  }>;
  projectPortfolio: Array<{
    id: string;
    name: string;
    status: 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
    progress: number;
    budget: number;
    spent: number;
    deadline: string;
    priority: 'High' | 'Medium' | 'Low';
    assignedTo: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    priority: 'High' | 'Medium' | 'Low';
    user: string;
  }>;
}

// Mock data for Vinod's dashboard
const mockSVPData: SVPData = {
  user: {
    id: 'vinod',
    name: 'Vinod Kumar',
    title: 'Senior Vice President',
    department: 'Compliance & Risk',
    avatar: 'VK',
    color: 'from-green-500 to-emerald-600'
  },
  teamOverview: {
    totalTeamSize: 38,
    directReports: 7,
    activeProjects: 8,
    budgetUtilization: 70.0,
    performanceScore: 92.3,
    complianceRate: 96.8
  },
  directReports: [
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      title: 'VP Regulatory Affairs',
      department: 'Regulatory Affairs',
      teamSize: 6,
      projectCount: 3,
      budgetUtilization: 82.1,
      performanceScore: 94.5,
      status: 'excellent'
    },
    {
      id: 'miguel-santos',
      name: 'Miguel Santos',
      title: 'VP Risk Management',
      department: 'Risk Management',
      teamSize: 5,
      projectCount: 4,
      budgetUtilization: 75.3,
      performanceScore: 88.7,
      status: 'good'
    },
    {
      id: 'priya-patel',
      name: 'Priya Patel',
      title: 'VP Internal Audit',
      department: 'Internal Audit',
      teamSize: 7,
      projectCount: 2,
      budgetUtilization: 91.2,
      performanceScore: 85.4,
      status: 'needs-attention'
    },
    {
      id: 'carlos-rodriguez',
      name: 'Carlos Rodriguez',
      title: 'VP AML Operations',
      department: 'AML Operations',
      teamSize: 5,
      projectCount: 4,
      budgetUtilization: 68.9,
      performanceScore: 91.8,
      status: 'excellent'
    },
    {
      id: 'lisa-wong',
      name: 'Lisa Wong',
      title: 'VP Policy Management',
      department: 'Policy Management',
      teamSize: 4,
      projectCount: 3,
      budgetUtilization: 84.7,
      performanceScore: 89.2,
      status: 'good'
    },
    {
      id: 'david-kim',
      name: 'David Kim',
      title: 'VP Operational Risk',
      department: 'Operational Risk',
      teamSize: 6,
      projectCount: 3,
      budgetUtilization: 79.4,
      performanceScore: 92.1,
      status: 'excellent'
    },
    {
      id: 'maria-gonzalez',
      name: 'Maria Gonzalez',
      title: 'VP Regulatory Technology',
      department: 'RegTech',
      teamSize: 5,
      projectCount: 4,
      budgetUtilization: 86.3,
      performanceScore: 90.7,
      status: 'good'
    }
  ],
  projectPortfolio: [
    {
      id: 'proj-1',
      name: 'Q1 Regulatory Compliance Audit',
      status: 'On Track',
      progress: 75,
      budget: 450000,
      spent: 337500,
      deadline: '2025-03-15',
      priority: 'High',
      assignedTo: 'Sarah Chen'
    },
    {
      id: 'proj-2',
      name: 'AML System Enhancement',
      status: 'At Risk',
      progress: 45,
      budget: 400000,
      spent: 240000,
      deadline: '2025-02-28',
      priority: 'High',
      assignedTo: 'Carlos Rodriguez'
    },
    {
      id: 'proj-3',
      name: 'Policy Documentation Update',
      status: 'On Track',
      progress: 60,
      budget: 200000,
      spent: 120000,
      deadline: '2025-04-30',
      priority: 'Medium',
      assignedTo: 'Lisa Wong'
    },
    {
      id: 'proj-4',
      name: 'Risk Assessment Framework',
      status: 'Delayed',
      progress: 30,
      budget: 400000,
      spent: 200000,
      deadline: '2025-01-31',
      priority: 'High',
      assignedTo: 'Miguel Santos'
    }
  ],
  recentActivities: [
    {
      id: 'act-1',
      type: 'Budget Alert',
      description: 'AML System Enhancement approaching 80% budget utilization',
      timestamp: '2025-01-11T08:30:00Z',
      priority: 'High',
      user: 'Carlos Rodriguez'
    },
    {
      id: 'act-2',
      type: 'Project Update',
      description: 'Q1 Regulatory Compliance Audit milestone completed',
      timestamp: '2025-01-11T07:15:00Z',
      priority: 'Medium',
      user: 'Sarah Chen'
    },
    {
      id: 'act-3',
      type: 'Team Alert',
      description: 'Priya Patel team exceeding budget allocation',
      timestamp: '2025-01-11T06:45:00Z',
      priority: 'High',
      user: 'Priya Patel'
    }
  ]
};

export default function SVPDashboard() {
  const params = useParams();
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [svpData, setSvpData] = useState<SVPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'team' | 'projects' | 'budget' | 'compliance'>('overview');

  useEffect(() => {
    // Load SVP data based on ID
    const svpId = params.id as string;
    loadSVPData(svpId);
  }, [params.id]);

  const loadSVPData = async (svpId: string) => {
    try {
      setLoading(true);
      
      // For now, use mock data. In production, this would fetch from API
      if (svpId === 'vinod') {
        setSvpData(mockSVPData);
      } else {
        // Handle other SVPs or show error
        setSvpData(null);
      }
    } catch (error) {
      console.error('Error loading SVP data:', error);
      setSvpData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!svpData) {
    return <ErrorScreen onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(circle at 1px 1px, rgba(0,245,255,0.15) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
      </div>

      <Header svpData={svpData} onBack={handleBackToDashboard} connected={connected} />
      <PersonalizedARIATicker svpData={svpData} />
      <SanctionsTicker />

      <div className="flex h-[calc(100vh-140px)]">
        <Sidebar 
          selectedView={selectedView}
          setSelectedView={setSelectedView}
        />

        <main className="flex-1 relative" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="h-full p-1 pb-16">
            {selectedView === 'overview' && <OverviewDashboard svpData={svpData} />}
            {selectedView === 'team' && <TeamDashboard svpData={svpData} />}
            {selectedView === 'projects' && <ProjectsDashboard svpData={svpData} />}
            {selectedView === 'budget' && <BudgetDashboard svpData={svpData} />}
            {selectedView === 'compliance' && <ComplianceDashboard svpData={svpData} />}
          </div>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-green-500/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2 tracking-wider"
        >
          SVP DASHBOARD
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-green-400 text-lg mb-4"
        >
          Loading Management Interface...
        </motion.p>
      </motion.div>
    </div>
  );
}

function ErrorScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">SVP dashboard not found or access not authorized.</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300"
        >
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
}

function Header({ svpData, onBack, connected }: { svpData: SVPData; onBack: () => void; connected: boolean }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('currentExecutive');
    router.push('/login');
  };

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 bg-black/20 backdrop-blur-xl border-b border-green-500/20 relative z-50"
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-300" />
          </button>
          
          <div className={`w-12 h-12 bg-gradient-to-br ${svpData.user.color} rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25`}>
            <span className="text-white font-bold text-xl">{svpData.user.avatar}</span>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              {svpData.user.name}
            </h1>
            <p className="text-green-400 text-sm">{svpData.user.title} • {svpData.user.department}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <ConnectionDropdown connected={connected} />

          <NotificationDropdown notificationCount={5} />

          <div className="text-gray-400 text-sm">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>

          <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <div className={`w-8 h-8 bg-gradient-to-br ${svpData.user.color} rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold text-sm">{svpData.user.avatar}</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">{svpData.user.name}</p>
              <p className="text-gray-400 text-xs">{svpData.user.title}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 hover:text-red-300 font-medium text-sm transition-all duration-300 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}

function Sidebar({ selectedView, setSelectedView }: any) {
  const navigation = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'team', name: 'My Team', icon: UserGroupIcon },
    { id: 'projects', name: 'Projects', icon: ClockIcon },
    { id: 'budget', name: 'Budget', icon: CurrencyDollarIcon },
    { id: 'compliance', name: 'Compliance', icon: ShieldCheckIcon },
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-72 bg-black/20 backdrop-blur-xl border-r border-green-500/20 transition-all duration-300 relative z-40"
    >
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id)}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group ${
                selectedView === item.id
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white shadow-lg shadow-green-500/10'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              <item.icon className="h-6 w-6 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
}

function OverviewDashboard({ svpData }: { svpData: SVPData }) {
  const [selectedVP, setSelectedVP] = useState<any>(null);
  const [showVPDetail, setShowVPDetail] = useState(false);

  // Enhanced VP data with project details for Overview
  const enhancedVPData = [
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      title: 'VP Regulatory Affairs',
      department: 'Regulatory Affairs',
      avatar: 'SC',
      color: 'from-blue-500 to-cyan-600',
      teamSize: 6,
      budgetAllocated: 450000,
      budgetSpent: 315000,
      budgetUtilization: 70.0,
      performanceScore: 94.5,
      activeProjects: 3,
      completedProjects: 8,
      status: 'excellent',
      trend: 'up',
      criticalProjects: 1,
      projectsAtRisk: 0,
      topProject: 'Q1 Regulatory Compliance Audit',
      topProjectProgress: 75
    },
    {
      id: 'miguel-santos',
      name: 'Miguel Santos',
      title: 'VP Risk Management',
      department: 'Risk Management',
      avatar: 'MS',
      color: 'from-red-500 to-pink-600',
      teamSize: 5,
      budgetAllocated: 2200000,
      budgetSpent: 1656000,
      budgetUtilization: 75.3,
      performanceScore: 88.7,
      activeProjects: 4,
      completedProjects: 6,
      status: 'good',
      trend: 'up',
      criticalProjects: 2,
      projectsAtRisk: 1,
      topProject: 'Market Risk Analysis Q1-Q2',
      topProjectProgress: 55
    },
    {
      id: 'priya-patel',
      name: 'Priya Patel',
      title: 'VP Internal Audit',
      department: 'Internal Audit',
      avatar: 'PP',
      color: 'from-purple-500 to-indigo-600',
      teamSize: 7,
      budgetAllocated: 2600000,
      budgetSpent: 2371200,
      budgetUtilization: 91.2,
      performanceScore: 85.4,
      activeProjects: 2,
      completedProjects: 5,
      status: 'needs-attention',
      trend: 'down',
      criticalProjects: 1,
      projectsAtRisk: 0,
      topProject: 'SOX Compliance Review Q1',
      topProjectProgress: 45
    },
    {
      id: 'carlos-rodriguez',
      name: 'Carlos Rodriguez',
      title: 'VP AML Operations',
      department: 'AML Operations',
      avatar: 'CR',
      color: 'from-orange-500 to-red-600',
      teamSize: 5,
      budgetAllocated: 2400000,
      budgetSpent: 1653600,
      budgetUtilization: 68.9,
      performanceScore: 91.8,
      activeProjects: 4,
      completedProjects: 7,
      status: 'excellent',
      trend: 'up',
      criticalProjects: 2,
      projectsAtRisk: 1,
      topProject: 'Transaction Monitoring Upgrade',
      topProjectProgress: 60
    },
    {
      id: 'lisa-wong',
      name: 'Lisa Wong',
      title: 'VP Policy Management',
      department: 'Policy Management',
      avatar: 'LW',
      color: 'from-green-500 to-teal-600',
      teamSize: 4,
      budgetAllocated: 1800000,
      budgetSpent: 1524600,
      budgetUtilization: 84.7,
      performanceScore: 89.2,
      activeProjects: 3,
      completedProjects: 4,
      status: 'good',
      trend: 'stable',
      criticalProjects: 0,
      projectsAtRisk: 0,
      topProject: 'Policy Documentation Update',
      topProjectProgress: 60
    },
    {
      id: 'david-kim',
      name: 'David Kim',
      title: 'VP Operational Risk',
      department: 'Operational Risk',
      avatar: 'DK',
      color: 'from-indigo-500 to-purple-600',
      teamSize: 6,
      budgetAllocated: 2300000,
      budgetSpent: 1825800,
      budgetUtilization: 79.4,
      performanceScore: 92.1,
      activeProjects: 3,
      completedProjects: 6,
      status: 'excellent',
      trend: 'up',
      criticalProjects: 1,
      projectsAtRisk: 0,
      topProject: 'Operational Risk Framework',
      topProjectProgress: 30
    },
    {
      id: 'maria-gonzalez',
      name: 'Maria Gonzalez',
      title: 'VP Regulatory Technology',
      department: 'RegTech',
      avatar: 'MG',
      color: 'from-cyan-500 to-blue-600',
      teamSize: 5,
      budgetAllocated: 2100000,
      budgetSpent: 1812300,
      budgetUtilization: 86.3,
      performanceScore: 90.7,
      activeProjects: 4,
      completedProjects: 5,
      status: 'good',
      trend: 'up',
      criticalProjects: 1,
      projectsAtRisk: 0,
      topProject: 'RegTech Platform Development',
      topProjectProgress: 70
    }
  ];

  // Complete VP Teams data with all VPs having full details
  const vpTeams = [
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      title: 'VP Regulatory Affairs',
      department: 'Regulatory Affairs',
      avatar: 'SC',
      color: 'from-blue-500 to-cyan-600',
      teamSize: 6,
      budgetAllocated: 2800000,
      budgetSpent: 2296000,
      budgetUtilization: 82.1,
      performanceScore: 94.5,
      activeProjects: 3,
      completedProjects: 8,
      status: 'excellent',
      projects: [
        {
          id: 'q1-regulatory-audit',
          name: 'Q1 Regulatory Compliance Audit',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-03-31',
          progress: 75,
          budgetAllocated: 900000,
          budgetSpent: 675000,
          description: 'Comprehensive quarterly regulatory compliance audit across all LATAM operations',
          deliverables: ['Compliance Report', 'Risk Assessment', 'Regulatory Gap Analysis', 'Action Plan'],
          teamLead: 'John Martinez'
        },
        {
          id: 'latam-policy-review',
          name: 'LATAM Policy Review',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-01-15',
          endDate: '2025-04-30',
          progress: 40,
          budgetAllocated: 600000,
          budgetSpent: 240000,
          description: 'Review and update regulatory policies for Latin American markets',
          deliverables: ['Policy Updates', 'Regulatory Mapping', 'Compliance Guidelines', 'Training Materials'],
          teamLead: 'Carlos Rivera'
        },
        {
          id: 'regulatory-framework-update',
          name: 'Regulatory Framework Update',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-02-01',
          endDate: '2025-05-31',
          progress: 25,
          budgetAllocated: 500000,
          budgetSpent: 125000,
          description: 'Update internal regulatory framework to align with new regulations',
          deliverables: ['Framework Document', 'Process Updates', 'Training Program', 'Implementation Plan'],
          teamLead: 'Maria Santos'
        }
      ],
      teamMembers: [
        {
          id: 'john-martinez',
          name: 'John Martinez',
          role: 'Senior Regulatory Analyst',
          performance: 96.2,
          currentProjects: ['Q1 Regulatory Compliance Audit', 'LATAM Policy Review'],
          skills: ['Regulatory Analysis', 'Policy Development', 'Audit Management'],
          budgetAllocated: 450000,
          budgetSpent: 337500,
          location: 'Mexico',
          experience: '8 years',
          projectAllocations: [
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 70, role: 'Project Lead' },
            { projectId: 'latam-policy-review', projectName: 'LATAM Policy Review', allocation: 30, role: 'Senior Analyst' }
          ]
        },
        {
          id: 'maria-santos',
          name: 'Maria Santos',
          role: 'Compliance Specialist',
          performance: 93.8,
          currentProjects: ['Regulatory Framework Update'],
          skills: ['Compliance Monitoring', 'Risk Assessment', 'Documentation'],
          budgetAllocated: 380000,
          budgetSpent: 304000,
          location: 'Colombia',
          experience: '5 years',
          projectAllocations: [
            { projectId: 'regulatory-framework-update', projectName: 'Regulatory Framework Update', allocation: 85, role: 'Project Lead' },
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 15, role: 'Compliance Specialist' }
          ]
        },
        {
          id: 'carlos-rivera',
          name: 'Carlos Rivera',
          role: 'Policy Analyst',
          performance: 91.4,
          currentProjects: ['Cross-Border Compliance', 'Regulatory Reporting'],
          skills: ['Policy Analysis', 'Legal Research', 'Regulatory Reporting'],
          budgetAllocated: 420000,
          budgetSpent: 378000,
          location: 'Peru',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'latam-policy-review', projectName: 'LATAM Policy Review', allocation: 60, role: 'Project Lead' },
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 40, role: 'Policy Analyst' }
          ]
        },
        {
          id: 'ana-lopez',
          name: 'Ana Lopez',
          role: 'Regulatory Coordinator',
          performance: 89.7,
          currentProjects: ['Compliance Training Program'],
          skills: ['Training Development', 'Process Coordination', 'Team Management'],
          budgetAllocated: 320000,
          budgetSpent: 256000,
          location: 'Honduras',
          experience: '4 years',
          projectAllocations: [
            { projectId: 'regulatory-framework-update', projectName: 'Regulatory Framework Update', allocation: 50, role: 'Training Coordinator' },
            { projectId: 'latam-policy-review', projectName: 'LATAM Policy Review', allocation: 50, role: 'Process Coordinator' }
          ]
        },
        {
          id: 'luis-garcia',
          name: 'Luis Garcia',
          role: 'Junior Analyst',
          performance: 87.3,
          currentProjects: ['Data Collection', 'Report Generation'],
          skills: ['Data Analysis', 'Report Writing', 'Research'],
          budgetAllocated: 280000,
          budgetSpent: 224000,
          location: 'Panama',
          experience: '2 years',
          projectAllocations: [
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 60, role: 'Data Analyst' },
            { projectId: 'latam-policy-review', projectName: 'LATAM Policy Review', allocation: 40, role: 'Research Analyst' }
          ]
        },
        {
          id: 'sofia-mendez',
          name: 'Sofia Mendez',
          role: 'Regulatory Assistant',
          performance: 85.9,
          currentProjects: ['Documentation Support', 'Process Improvement'],
          skills: ['Documentation', 'Process Support', 'Administrative'],
          budgetAllocated: 250000,
          budgetSpent: 200000,
          location: 'Mexico',
          experience: '3 years',
          projectAllocations: [
            { projectId: 'regulatory-framework-update', projectName: 'Regulatory Framework Update', allocation: 70, role: 'Documentation Specialist' },
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 30, role: 'Administrative Support' }
          ]
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
      teamSize: 5,
      budgetAllocated: 2200000,
      budgetSpent: 1656000,
      budgetUtilization: 75.3,
      performanceScore: 88.7,
      activeProjects: 4,
      completedProjects: 6,
      status: 'good',
      projects: [
        {
          id: 'risk-assessment-framework',
          name: 'Risk Assessment Framework 2025',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-06-30',
          progress: 30,
          budgetAllocated: 700000,
          budgetSpent: 210000,
          description: 'Comprehensive risk assessment framework for all business units',
          deliverables: ['Risk Matrix', 'Assessment Tools', 'Training Materials', 'Implementation Guide'],
          teamLead: 'Ricardo Torres'
        },
        {
          id: 'market-risk-analysis',
          name: 'Market Risk Analysis Q1-Q2',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-15',
          endDate: '2025-06-15',
          progress: 55,
          budgetAllocated: 600000,
          budgetSpent: 330000,
          description: 'Quarterly market risk analysis and stress testing',
          deliverables: ['Risk Reports', 'Stress Test Results', 'Market Analysis', 'Recommendations'],
          teamLead: 'Patricia Ruiz'
        }
      ],
      teamMembers: [
        {
          id: 'ricardo-torres',
          name: 'Ricardo Torres',
          role: 'Senior Risk Analyst',
          performance: 92.1,
          currentProjects: ['Risk Assessment Framework', 'Market Risk Analysis'],
          skills: ['Risk Modeling', 'Statistical Analysis', 'Financial Risk'],
          budgetAllocated: 480000,
          budgetSpent: 360000,
          location: 'Colombia',
          experience: '7 years',
          projectAllocations: [
            { projectId: 'risk-assessment-framework', projectName: 'Risk Assessment Framework 2025', allocation: 60, role: 'Project Lead' },
            { projectId: 'market-risk-analysis', projectName: 'Market Risk Analysis Q1-Q2', allocation: 40, role: 'Senior Analyst' }
          ]
        },
        {
          id: 'patricia-ruiz',
          name: 'Patricia Ruiz',
          role: 'Credit Risk Specialist',
          performance: 89.4,
          currentProjects: ['Credit Portfolio Review', 'Default Prediction Model'],
          skills: ['Credit Analysis', 'Portfolio Management', 'Predictive Modeling'],
          budgetAllocated: 420000,
          budgetSpent: 315000,
          location: 'Peru',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'market-risk-analysis', projectName: 'Market Risk Analysis Q1-Q2', allocation: 70, role: 'Project Lead' }
          ]
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
      teamSize: 7,
      budgetAllocated: 2600000,
      budgetSpent: 2371200,
      budgetUtilization: 91.2,
      performanceScore: 85.4,
      activeProjects: 2,
      completedProjects: 5,
      status: 'needs-attention',
      projects: [
        {
          id: 'annual-audit-plan',
          name: 'Annual Audit Plan 2025',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          progress: 15,
          budgetAllocated: 1200000,
          budgetSpent: 180000,
          description: 'Comprehensive annual audit planning and execution across all business units',
          deliverables: ['Risk Assessment Matrix', 'Audit Schedule', 'Resource Allocation Plan', 'Quarterly Reviews'],
          teamLead: 'James Wilson'
        },
        {
          id: 'sox-compliance-review',
          name: 'SOX Compliance Review Q1',
          status: 'In Progress',
          priority: 'Critical',
          startDate: '2025-01-15',
          endDate: '2025-03-31',
          progress: 45,
          budgetAllocated: 800000,
          budgetSpent: 360000,
          description: 'Sarbanes-Oxley compliance review for Q1 financial controls',
          deliverables: ['Controls Testing Report', 'Deficiency Analysis', 'Management Letter', 'Remediation Plan'],
          teamLead: 'Elena Vargas'
        }
      ],
      teamMembers: [
        {
          id: 'james-wilson',
          name: 'James Wilson',
          role: 'Senior Audit Manager',
          performance: 88.9,
          currentProjects: ['Annual Audit Plan 2025', 'SOX Compliance Review Q1'],
          skills: ['Audit Management', 'SOX Compliance', 'Risk Assessment'],
          budgetAllocated: 520000,
          budgetSpent: 468000,
          location: 'Mexico',
          experience: '9 years',
          projectAllocations: [
            { projectId: 'annual-audit-plan', projectName: 'Annual Audit Plan 2025', allocation: 60, role: 'Project Lead' },
            { projectId: 'sox-compliance-review', projectName: 'SOX Compliance Review Q1', allocation: 40, role: 'Senior Auditor' }
          ]
        },
        {
          id: 'elena-vargas',
          name: 'Elena Vargas',
          role: 'IT Audit Specialist',
          performance: 86.7,
          currentProjects: ['SOX Compliance Review Q1'],
          skills: ['IT Audit', 'Cybersecurity', 'Systems Review'],
          budgetAllocated: 450000,
          budgetSpent: 405000,
          location: 'Colombia',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'sox-compliance-review', projectName: 'SOX Compliance Review Q1', allocation: 80, role: 'Project Lead' }
          ]
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
      teamSize: 5,
      budgetAllocated: 2400000,
      budgetSpent: 1653600,
      budgetUtilization: 68.9,
      performanceScore: 91.8,
      activeProjects: 4,
      completedProjects: 7,
      status: 'excellent',
      projects: [
        {
          id: 'aml-system-enhancement',
          name: 'AML System Enhancement',
          status: 'At Risk',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-02-28',
          progress: 45,
          budgetAllocated: 680000,
          budgetSpent: 408000,
          description: 'Major enhancement to AML detection and monitoring systems',
          deliverables: ['System Upgrade', 'Enhanced Algorithms', 'Performance Testing', 'User Training'],
          teamLead: 'Isabella Fernandez'
        },
        {
          id: 'transaction-monitoring',
          name: 'Transaction Monitoring Upgrade',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-15',
          endDate: '2025-04-15',
          progress: 60,
          budgetAllocated: 550000,
          budgetSpent: 330000,
          description: 'Upgrade transaction monitoring capabilities for better detection',
          deliverables: ['Monitoring Rules', 'Alert System', 'Dashboard Updates', 'Training Materials'],
          teamLead: 'Alejandro Gomez'
        }
      ],
      teamMembers: [
        {
          id: 'isabella-fernandez',
          name: 'Isabella Fernandez',
          role: 'Senior AML Analyst',
          performance: 94.3,
          currentProjects: ['AML System Enhancement', 'Transaction Monitoring'],
          skills: ['AML Analysis', 'Transaction Monitoring', 'Suspicious Activity'],
          budgetAllocated: 500000,
          budgetSpent: 350000,
          location: 'Mexico',
          experience: '8 years',
          projectAllocations: [
            { projectId: 'aml-system-enhancement', projectName: 'AML System Enhancement', allocation: 70, role: 'Project Lead' },
            { projectId: 'transaction-monitoring', projectName: 'Transaction Monitoring Upgrade', allocation: 30, role: 'Senior Analyst' }
          ]
        },
        {
          id: 'alejandro-gomez',
          name: 'Alejandro Gomez',
          role: 'KYC Specialist',
          performance: 92.7,
          currentProjects: ['Customer Due Diligence', 'KYC Process Improvement'],
          skills: ['KYC Procedures', 'Customer Due Diligence', 'Risk Rating'],
          budgetAllocated: 450000,
          budgetSpent: 315000,
          location: 'Colombia',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'transaction-monitoring', projectName: 'Transaction Monitoring Upgrade', allocation: 60, role: 'Project Lead' }
          ]
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
      teamSize: 4,
      budgetAllocated: 1800000,
      budgetSpent: 1524600,
      budgetUtilization: 84.7,
      performanceScore: 89.2,
      activeProjects: 3,
      completedProjects: 4,
      status: 'good',
      projects: [
        {
          id: 'policy-documentation-update',
          name: 'Policy Documentation Update',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-01-15',
          endDate: '2025-04-30',
          progress: 60,
          budgetAllocated: 600000,
          budgetSpent: 360000,
          description: 'Comprehensive update of regulatory policies and procedures',
          deliverables: ['Policy Review', 'Documentation Updates', 'Training Materials', 'Implementation Plan'],
          teamLead: 'Daniel Kim'
        }
      ],
      teamMembers: [
        {
          id: 'daniel-kim',
          name: 'Daniel Kim',
          role: 'Senior Policy Analyst',
          performance: 91.8,
          currentProjects: ['Policy Documentation Update', 'Regulatory Alignment'],
          skills: ['Policy Development', 'Regulatory Analysis', 'Documentation'],
          budgetAllocated: 480000,
          budgetSpent: 408000,
          location: 'Mexico',
          experience: '7 years',
          projectAllocations: [
            { projectId: 'policy-documentation-update', projectName: 'Policy Documentation Update', allocation: 80, role: 'Project Lead' }
          ]
        },
        {
          id: 'laura-mendoza',
          name: 'Laura Mendoza',
          role: 'Policy Coordinator',
          performance: 89.3,
          currentProjects: ['Policy Implementation', 'Training Development'],
          skills: ['Policy Implementation', 'Training', 'Change Management'],
          budgetAllocated: 420000,
          budgetSpent: 357000,
          location: 'Colombia',
          experience: '5 years',
          projectAllocations: [
            { projectId: 'policy-documentation-update', projectName: 'Policy Documentation Update', allocation: 60, role: 'Coordinator' }
          ]
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
      teamSize: 6,
      budgetAllocated: 2300000,
      budgetSpent: 1825800,
      budgetUtilization: 79.4,
      performanceScore: 92.1,
      activeProjects: 3,
      completedProjects: 6,
      status: 'excellent',
      projects: [
        {
          id: 'operational-risk-framework',
          name: 'Operational Risk Framework',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-02-01',
          endDate: '2025-07-31',
          progress: 35,
          budgetAllocated: 600000,
          budgetSpent: 210000,
          description: 'Development of comprehensive operational risk framework with enhanced controls',
          deliverables: ['Risk Inventory', 'Control Assessment', 'Framework Documentation', 'Implementation Plan'],
          teamLead: 'Francisco Lopez'
        }
      ],
      teamMembers: [
        {
          id: 'francisco-lopez',
          name: 'Francisco Lopez',
          role: 'Senior Risk Manager',
          performance: 93.7,
          currentProjects: ['Operational Risk Framework', 'Risk Mitigation Strategy'],
          skills: ['Risk Management', 'Strategy Development', 'Framework Design'],
          budgetAllocated: 520000,
          budgetSpent: 416000,
          location: 'Mexico',
          experience: '9 years',
          projectAllocations: [
            { projectId: 'operational-risk-framework', projectName: 'Operational Risk Framework', allocation: 80, role: 'Project Lead' }
          ]
        },
        {
          id: 'adriana-silva',
          name: 'Adriana Silva',
          role: 'Business Continuity Specialist',
          performance: 91.4,
          currentProjects: ['BCP Development', 'Disaster Recovery Planning'],
          skills: ['Business Continuity', 'Disaster Recovery', 'Crisis Management'],
          budgetAllocated: 450000,
          budgetSpent: 360000,
          location: 'Colombia',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'operational-risk-framework', projectName: 'Operational Risk Framework', allocation: 60, role: 'BCP Specialist' }
          ]
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
      teamSize: 5,
      budgetAllocated: 2100000,
      budgetSpent: 1812300,
      budgetUtilization: 86.3,
      performanceScore: 90.7,
      activeProjects: 4,
      completedProjects: 5,
      status: 'good',
      projects: [
        {
          id: 'regtech-platform-development',
          name: 'RegTech Platform Development',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-05-31',
          progress: 70,
          budgetAllocated: 750000,
          budgetSpent: 525000,
          description: 'Development of comprehensive regulatory technology platform',
          deliverables: ['Platform Architecture', 'Core Modules', 'API Integration', 'User Interface'],
          teamLead: 'Pablo Martinez'
        }
      ],
      teamMembers: [
        {
          id: 'pablo-martinez',
          name: 'Pablo Martinez',
          role: 'Senior RegTech Developer',
          performance: 92.9,
          currentProjects: ['RegTech Platform Development', 'API Integration'],
          skills: ['Full Stack Development', 'API Development', 'RegTech Solutions'],
          budgetAllocated: 480000,
          budgetSpent: 412800,
          location: 'Mexico',
          experience: '8 years',
          projectAllocations: [
            { projectId: 'regtech-platform-development', projectName: 'RegTech Platform Development', allocation: 90, role: 'Project Lead' }
          ]
        },
        {
          id: 'silvia-torres',
          name: 'Silvia Torres',
          role: 'Data Analyst',
          performance: 90.1,
          currentProjects: ['Regulatory Data Analysis', 'Compliance Metrics'],
          skills: ['Data Analysis', 'SQL', 'Business Intelligence'],
          budgetAllocated: 420000,
          budgetSpent: 361200,
          location: 'Colombia',
          experience: '5 years',
          projectAllocations: [
            { projectId: 'regtech-platform-development', projectName: 'RegTech Platform Development', allocation: 70, role: 'Data Analyst' }
          ]
        }
      ]
    }
  ];

  const handleVPClick = (vp: any) => {
    // Find the full VP data from vpTeams array
    const fullVPData = vpTeams.find(vpTeam => vpTeam.id === vp.id);
    if (fullVPData) {
      setSelectedVP(fullVPData);
      setShowVPDetail(true);
    }
  };

  if (showVPDetail && selectedVP) {
    return <VPDetailView vp={selectedVP} onBack={() => setShowVPDetail(false)} onMemberClick={() => {}} />;
  }

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      {/* Executive Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Executive Overview</h1>
            <p className="text-gray-400 text-lg">Real-time insights across all departments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Live Dashboard</span>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced KPI Cards with better spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <KPICards svpData={svpData} />
      </motion.div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Enhanced VP Cards - Clickable */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-8"
        >
          <EnhancedVPOverviewCard vpData={enhancedVPData} onVPClick={handleVPClick} />
        </motion.div>
        
        {/* Executive Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-4"
        >
          <ExecutiveInsightsCard vpData={enhancedVPData} />
        </motion.div>
      </div>

      {/* Secondary Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Project Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-6"
        >
          <ProjectPortfolioSummary vpData={enhancedVPData} />
        </motion.div>
        
        {/* Performance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-6"
        >
          <PerformanceTrendsCard vpData={enhancedVPData} />
        </motion.div>
      </div>

      {/* Executive Summary Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-6 bg-gradient-to-r from-gray-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10"
      >
        <div className="grid grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-400">
              {enhancedVPData.filter(vp => vp.status === 'excellent').length}
            </div>
            <div className="text-gray-400 text-sm">Excellent Performers</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-400">
              {enhancedVPData.reduce((sum, vp) => sum + vp.activeProjects, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Active Projects</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-yellow-400">
              {formatCurrency(enhancedVPData.reduce((sum, vp) => sum + vp.budgetAllocated, 0))}
            </div>
            <div className="text-gray-400 text-sm">Total Budget Managed</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-purple-400">
              {enhancedVPData.reduce((sum, vp) => sum + vp.teamSize, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Team Members</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function KPICards({ svpData }: { svpData: SVPData }) {
  const kpis = [
    {
      title: 'Team Size',
      value: svpData.teamOverview.totalTeamSize,
      subtitle: 'total members',
      icon: UserGroupIcon,
      color: 'from-blue-400 to-cyan-600',
      change: '+2'
    },
    {
      title: 'Active Projects',
      value: svpData.teamOverview.activeProjects,
      subtitle: 'in progress',
      icon: ClockIcon,
      color: 'from-green-400 to-emerald-600',
      change: '+3'
    },
    {
      title: 'Budget Utilization',
      value: `${svpData.teamOverview.budgetUtilization.toFixed(1)}%`,
      subtitle: 'of allocated',
      icon: CurrencyDollarIcon,
      color: 'from-yellow-400 to-orange-600',
      change: '+2.3%'
    },
    {
      title: 'Performance Score',
      value: `${svpData.teamOverview.performanceScore.toFixed(1)}%`,
      subtitle: 'team average',
      icon: ChartBarIcon,
      color: 'from-purple-400 to-pink-600',
      change: '+1.5%'
    },
    {
      title: 'Compliance Rate',
      value: `${svpData.teamOverview.complianceRate.toFixed(1)}%`,
      subtitle: 'regulatory',
      icon: ShieldCheckIcon,
      color: 'from-green-400 to-emerald-600',
      change: '+0.8%'
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-4 h-full">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-green-500/30 transition-all duration-300 group relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className="h-6 w-6 text-white/70" />
              <span className="text-green-400 text-sm font-semibold">{kpi.change}</span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-1">{kpi.value}</h3>
            <p className="text-gray-400 text-sm">{kpi.title}</p>
            <p className="text-gray-500 text-xs">{kpi.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TeamOverviewCard({ svpData }: { svpData: SVPData }) {
  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Team Performance Overview</h3>
        <UserGroupIcon className="h-6 w-6 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 h-[calc(100%-80px)] overflow-y-auto">
        {svpData.directReports.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-white font-medium">{member.name}</h4>
                <p className="text-gray-400 text-sm">{member.title}</p>
                <p className="text-gray-500 text-xs">{member.department}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                member.status === 'excellent' ? 'bg-green-800 text-green-200' :
                member.status === 'good' ? 'bg-blue-800 text-blue-200' :
                'bg-yellow-800 text-yellow-200'
              }`}>
                {member.status === 'excellent' ? 'Excellent' :
                 member.status === 'good' ? 'Good' : 'Needs Attention'}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-white font-semibold">{member.teamSize}</p>
                <p className="text-gray-400 text-xs">Team Size</p>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{member.projectCount}</p>
                <p className="text-gray-400 text-xs">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{member.budgetUtilization.toFixed(1)}%</p>
                <p className="text-gray-400 text-xs">Budget</p>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{member.performanceScore.toFixed(1)}%</p>
                <p className="text-gray-400 text-xs">Performance</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RecentActivitiesCard({ svpData }: { svpData: SVPData }) {
  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Live</span>
        </div>
      </div>

      <div className="space-y-4 h-[calc(100%-80px)] overflow-y-auto">
        {svpData.recentActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                activity.priority === 'High' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                activity.priority === 'Medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                'bg-green-500 shadow-lg shadow-green-500/50'
              }`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">{activity.type}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                    activity.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {activity.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-1">{activity.description}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Team Dashboard with Hierarchical Drill-down
function TeamDashboard({ svpData }: { svpData: SVPData }) {
  const [selectedView, setSelectedView] = useState<'overview' | 'vp-detail' | 'member-detail'>('overview');
  const [selectedVP, setSelectedVP] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Enhanced VP data with detailed team information
  const vpTeams = [
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      title: 'VP Regulatory Affairs',
      department: 'Regulatory Affairs',
      avatar: 'SC',
      color: 'from-blue-500 to-cyan-600',
      teamSize: 6,
      budgetAllocated: 2800000,
      budgetSpent: 2296000,
      budgetUtilization: 82.1,
      performanceScore: 94.5,
      activeProjects: 3,
      completedProjects: 8,
      status: 'excellent',
      projects: [
        {
          id: 'q1-regulatory-audit',
          name: 'Q1 Regulatory Compliance Audit',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-03-31',
          progress: 75,
          budgetAllocated: 900000,
          budgetSpent: 675000,
          description: 'Comprehensive quarterly regulatory compliance audit across all LATAM operations',
          deliverables: ['Compliance Report', 'Risk Assessment', 'Regulatory Gap Analysis', 'Action Plan'],
          teamLead: 'John Martinez'
        },
        {
          id: 'latam-policy-review',
          name: 'LATAM Policy Review',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-01-15',
          endDate: '2025-04-30',
          progress: 40,
          budgetAllocated: 600000,
          budgetSpent: 240000,
          description: 'Review and update regulatory policies for Latin American markets',
          deliverables: ['Policy Updates', 'Regulatory Mapping', 'Compliance Guidelines', 'Training Materials'],
          teamLead: 'Carlos Rivera'
        },
        {
          id: 'regulatory-framework-update',
          name: 'Regulatory Framework Update',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-02-01',
          endDate: '2025-05-31',
          progress: 25,
          budgetAllocated: 500000,
          budgetSpent: 125000,
          description: 'Update internal regulatory framework to align with new regulations',
          deliverables: ['Framework Document', 'Process Updates', 'Training Program', 'Implementation Plan'],
          teamLead: 'Maria Santos'
        }
      ],
      teamMembers: [
        {
          id: 'john-martinez',
          name: 'John Martinez',
          role: 'Senior Regulatory Analyst',
          performance: 96.2,
          currentProjects: ['Q1 Regulatory Compliance Audit', 'LATAM Policy Review'],
          skills: ['Regulatory Analysis', 'Policy Development', 'Audit Management'],
          budgetAllocated: 450000,
          budgetSpent: 337500,
          location: 'Mexico',
          experience: '8 years',
          projectAllocations: [
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 70, role: 'Project Lead' },
            { projectId: 'latam-policy-review', projectName: 'LATAM Policy Review', allocation: 30, role: 'Senior Analyst' }
          ]
        },
        {
          id: 'maria-santos',
          name: 'Maria Santos',
          role: 'Compliance Specialist',
          performance: 93.8,
          currentProjects: ['Regulatory Framework Update'],
          skills: ['Compliance Monitoring', 'Risk Assessment', 'Documentation'],
          budgetAllocated: 380000,
          budgetSpent: 304000,
          location: 'Colombia',
          experience: '5 years',
          projectAllocations: [
            { projectId: 'regulatory-framework-update', projectName: 'Regulatory Framework Update', allocation: 85, role: 'Project Lead' },
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 15, role: 'Compliance Specialist' }
          ]
        },
        {
          id: 'carlos-rivera',
          name: 'Carlos Rivera',
          role: 'Policy Analyst',
          performance: 91.4,
          currentProjects: ['Cross-Border Compliance', 'Regulatory Reporting'],
          skills: ['Policy Analysis', 'Legal Research', 'Regulatory Reporting'],
          budgetAllocated: 420000,
          budgetSpent: 378000,
          location: 'Peru',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'latam-policy-review', projectName: 'LATAM Policy Review', allocation: 60, role: 'Project Lead' },
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 40, role: 'Policy Analyst' }
          ]
        },
        {
          id: 'ana-lopez',
          name: 'Ana Lopez',
          role: 'Regulatory Coordinator',
          performance: 89.7,
          currentProjects: ['Compliance Training Program'],
          skills: ['Training Development', 'Process Coordination', 'Team Management'],
          budgetAllocated: 320000,
          budgetSpent: 256000,
          location: 'Honduras',
          experience: '4 years',
          projectAllocations: [
            { projectId: 'regulatory-framework-update', projectName: 'Regulatory Framework Update', allocation: 50, role: 'Training Coordinator' },
            { projectId: 'latam-policy-review', projectName: 'LATAM Policy Review', allocation: 50, role: 'Process Coordinator' }
          ]
        },
        {
          id: 'luis-garcia',
          name: 'Luis Garcia',
          role: 'Junior Analyst',
          performance: 87.3,
          currentProjects: ['Data Collection', 'Report Generation'],
          skills: ['Data Analysis', 'Report Writing', 'Research'],
          budgetAllocated: 280000,
          budgetSpent: 224000,
          location: 'Panama',
          experience: '2 years',
          projectAllocations: [
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 60, role: 'Data Analyst' },
            { projectId: 'latam-policy-review', projectName: 'LATAM Policy Review', allocation: 40, role: 'Research Analyst' }
          ]
        },
        {
          id: 'sofia-mendez',
          name: 'Sofia Mendez',
          role: 'Regulatory Assistant',
          performance: 85.9,
          currentProjects: ['Documentation Support', 'Process Improvement'],
          skills: ['Documentation', 'Process Support', 'Administrative'],
          budgetAllocated: 250000,
          budgetSpent: 200000,
          location: 'Mexico',
          experience: '3 years',
          projectAllocations: [
            { projectId: 'regulatory-framework-update', projectName: 'Regulatory Framework Update', allocation: 70, role: 'Documentation Specialist' },
            { projectId: 'q1-regulatory-audit', projectName: 'Q1 Regulatory Compliance Audit', allocation: 30, role: 'Administrative Support' }
          ]
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
      teamSize: 5,
      budgetAllocated: 2200000,
      budgetSpent: 1656000,
      budgetUtilization: 75.3,
      performanceScore: 88.7,
      activeProjects: 4,
      completedProjects: 6,
      status: 'good',
      projects: [
        {
          id: 'risk-assessment-framework',
          name: 'Risk Assessment Framework 2025',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-06-30',
          progress: 30,
          budgetAllocated: 700000,
          budgetSpent: 210000,
          description: 'Comprehensive risk assessment framework for all business units',
          deliverables: ['Risk Matrix', 'Assessment Tools', 'Training Materials', 'Implementation Guide'],
          teamLead: 'Ricardo Torres'
        },
        {
          id: 'market-risk-analysis',
          name: 'Market Risk Analysis Q1-Q2',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-15',
          endDate: '2025-06-15',
          progress: 55,
          budgetAllocated: 600000,
          budgetSpent: 330000,
          description: 'Quarterly market risk analysis and stress testing',
          deliverables: ['Risk Reports', 'Stress Test Results', 'Market Analysis', 'Recommendations'],
          teamLead: 'Patricia Ruiz'
        },
        {
          id: 'credit-portfolio-review',
          name: 'Credit Portfolio Review',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-02-01',
          endDate: '2025-05-31',
          progress: 40,
          budgetAllocated: 500000,
          budgetSpent: 200000,
          description: 'Comprehensive review of credit portfolio and risk exposure',
          deliverables: ['Portfolio Analysis', 'Risk Assessment', 'Recommendations', 'Action Plan'],
          teamLead: 'Diego Morales'
        },
        {
          id: 'operational-risk-assessment',
          name: 'Operational Risk Assessment',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-01-20',
          endDate: '2025-04-30',
          progress: 65,
          budgetAllocated: 400000,
          budgetSpent: 260000,
          description: 'Assessment of operational risks across all departments',
          deliverables: ['Risk Inventory', 'Control Assessment', 'Gap Analysis', 'Mitigation Plan'],
          teamLead: 'Carmen Jimenez'
        }
      ],
      teamMembers: [
        {
          id: 'ricardo-torres',
          name: 'Ricardo Torres',
          role: 'Senior Risk Analyst',
          performance: 92.1,
          currentProjects: ['Risk Assessment Framework', 'Market Risk Analysis'],
          skills: ['Risk Modeling', 'Statistical Analysis', 'Financial Risk'],
          budgetAllocated: 480000,
          budgetSpent: 360000,
          location: 'Colombia',
          experience: '7 years',
          projectAllocations: [
            { projectId: 'risk-assessment-framework', projectName: 'Risk Assessment Framework 2025', allocation: 60, role: 'Project Lead' },
            { projectId: 'market-risk-analysis', projectName: 'Market Risk Analysis Q1-Q2', allocation: 40, role: 'Senior Analyst' }
          ]
        },
        {
          id: 'patricia-ruiz',
          name: 'Patricia Ruiz',
          role: 'Credit Risk Specialist',
          performance: 89.4,
          currentProjects: ['Credit Portfolio Review', 'Default Prediction Model'],
          skills: ['Credit Analysis', 'Portfolio Management', 'Predictive Modeling'],
          budgetAllocated: 420000,
          budgetSpent: 315000,
          location: 'Peru',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'market-risk-analysis', projectName: 'Market Risk Analysis Q1-Q2', allocation: 70, role: 'Project Lead' },
            { projectId: 'credit-portfolio-review', projectName: 'Credit Portfolio Review', allocation: 30, role: 'Credit Specialist' }
          ]
        },
        {
          id: 'diego-morales',
          name: 'Diego Morales',
          role: 'Operational Risk Analyst',
          performance: 87.8,
          currentProjects: ['Operational Risk Assessment', 'Process Risk Review'],
          skills: ['Operational Risk', 'Process Analysis', 'Risk Mitigation'],
          budgetAllocated: 390000,
          budgetSpent: 292500,
          location: 'Mexico',
          experience: '5 years',
          projectAllocations: [
            { projectId: 'credit-portfolio-review', projectName: 'Credit Portfolio Review', allocation: 60, role: 'Project Lead' },
            { projectId: 'operational-risk-assessment', projectName: 'Operational Risk Assessment', allocation: 40, role: 'Risk Analyst' }
          ]
        },
        {
          id: 'carmen-jimenez',
          name: 'Carmen Jimenez',
          role: 'Risk Coordinator',
          performance: 86.2,
          currentProjects: ['Risk Reporting Dashboard', 'Team Coordination'],
          skills: ['Risk Reporting', 'Team Coordination', 'Dashboard Development'],
          budgetAllocated: 350000,
          budgetSpent: 262500,
          location: 'Honduras',
          experience: '4 years',
          projectAllocations: [
            { projectId: 'operational-risk-assessment', projectName: 'Operational Risk Assessment', allocation: 80, role: 'Project Lead' },
            { projectId: 'risk-assessment-framework', projectName: 'Risk Assessment Framework 2025', allocation: 20, role: 'Coordinator' }
          ]
        },
        {
          id: 'fernando-castro',
          name: 'Fernando Castro',
          role: 'Junior Risk Analyst',
          performance: 84.6,
          currentProjects: ['Data Collection', 'Risk Metrics Calculation'],
          skills: ['Data Analysis', 'Risk Metrics', 'Excel Modeling'],
          budgetAllocated: 300000,
          budgetSpent: 225000,
          location: 'Panama',
          experience: '2 years',
          projectAllocations: [
            { projectId: 'market-risk-analysis', projectName: 'Market Risk Analysis Q1-Q2', allocation: 50, role: 'Data Analyst' },
            { projectId: 'risk-assessment-framework', projectName: 'Risk Assessment Framework 2025', allocation: 50, role: 'Junior Analyst' }
          ]
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
      teamSize: 7,
      budgetAllocated: 2600000,
      budgetSpent: 2371200,
      budgetUtilization: 91.2,
      performanceScore: 85.4,
      activeProjects: 2,
      completedProjects: 5,
      status: 'needs-attention',
      projects: [
        {
          id: 'annual-audit-plan',
          name: 'Annual Audit Plan 2025',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          progress: 15,
          budgetAllocated: 1200000,
          budgetSpent: 180000,
          description: 'Comprehensive annual audit planning and execution across all business units',
          deliverables: ['Risk Assessment Matrix', 'Audit Schedule', 'Resource Allocation Plan', 'Quarterly Reviews'],
          teamLead: 'James Wilson'
        },
        {
          id: 'sox-compliance-review',
          name: 'SOX Compliance Review Q1',
          status: 'In Progress',
          priority: 'Critical',
          startDate: '2025-01-15',
          endDate: '2025-03-31',
          progress: 45,
          budgetAllocated: 800000,
          budgetSpent: 360000,
          description: 'Sarbanes-Oxley compliance review for Q1 financial controls',
          deliverables: ['Controls Testing Report', 'Deficiency Analysis', 'Management Letter', 'Remediation Plan'],
          teamLead: 'Elena Vargas'
        }
      ],
      teamMembers: [
        {
          id: 'james-wilson',
          name: 'James Wilson',
          role: 'Senior Audit Manager',
          performance: 88.9,
          currentProjects: ['Annual Audit Plan 2025', 'SOX Compliance Review Q1'],
          skills: ['Audit Management', 'SOX Compliance', 'Risk Assessment'],
          budgetAllocated: 520000,
          budgetSpent: 468000,
          location: 'Mexico',
          experience: '9 years',
          projectAllocations: [
            { projectId: 'annual-audit-plan', projectName: 'Annual Audit Plan 2025', allocation: 60, role: 'Project Lead' },
            { projectId: 'sox-compliance-review', projectName: 'SOX Compliance Review Q1', allocation: 40, role: 'Senior Auditor' }
          ]
        },
        {
          id: 'elena-vargas',
          name: 'Elena Vargas',
          role: 'IT Audit Specialist',
          performance: 86.7,
          currentProjects: ['SOX Compliance Review Q1'],
          skills: ['IT Audit', 'Cybersecurity', 'Systems Review'],
          budgetAllocated: 450000,
          budgetSpent: 405000,
          location: 'Colombia',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'sox-compliance-review', projectName: 'SOX Compliance Review Q1', allocation: 80, role: 'Project Lead' },
            { projectId: 'annual-audit-plan', projectName: 'Annual Audit Plan 2025', allocation: 20, role: 'IT Specialist' }
          ]
        },
        {
          id: 'roberto-silva',
          name: 'Roberto Silva',
          role: 'Financial Auditor',
          performance: 84.3,
          currentProjects: ['SOX Compliance Review Q1', 'Annual Audit Plan 2025'],
          skills: ['Financial Audit', 'Controls Testing', 'Process Review'],
          budgetAllocated: 410000,
          budgetSpent: 369000,
          location: 'Peru',
          experience: '7 years',
          projectAllocations: [
            { projectId: 'sox-compliance-review', projectName: 'SOX Compliance Review Q1', allocation: 70, role: 'Financial Controls Lead' },
            { projectId: 'annual-audit-plan', projectName: 'Annual Audit Plan 2025', allocation: 30, role: 'Financial Auditor' }
          ]
        },
        {
          id: 'gabriela-herrera',
          name: 'Gabriela Herrera',
          role: 'Compliance Auditor',
          performance: 83.1,
          currentProjects: ['SOX Compliance Review Q1'],
          skills: ['Compliance Audit', 'Regulatory Testing', 'Documentation'],
          budgetAllocated: 380000,
          budgetSpent: 342000,
          location: 'Honduras',
          experience: '5 years',
          projectAllocations: [
            { projectId: 'sox-compliance-review', projectName: 'SOX Compliance Review Q1', allocation: 90, role: 'Compliance Specialist' },
            { projectId: 'annual-audit-plan', projectName: 'Annual Audit Plan 2025', allocation: 10, role: 'Compliance Advisor' }
          ]
        },
        {
          id: 'andres-martinez',
          name: 'Andres Martinez',
          role: 'Operational Auditor',
          performance: 82.8,
          currentProjects: ['Annual Audit Plan 2025'],
          skills: ['Operational Audit', 'Efficiency Analysis', 'Process Improvement'],
          budgetAllocated: 360000,
          budgetSpent: 324000,
          location: 'Panama',
          experience: '4 years',
          projectAllocations: [
            { projectId: 'annual-audit-plan', projectName: 'Annual Audit Plan 2025', allocation: 85, role: 'Operations Lead' }
          ]
        },
        {
          id: 'valeria-torres',
          name: 'Valeria Torres',
          role: 'Audit Analyst',
          performance: 81.5,
          currentProjects: ['Annual Audit Plan 2025', 'SOX Compliance Review Q1'],
          skills: ['Data Analysis', 'Audit Support', 'Report Preparation'],
          budgetAllocated: 320000,
          budgetSpent: 288000,
          location: 'Mexico',
          experience: '3 years',
          projectAllocations: [
            { projectId: 'annual-audit-plan', projectName: 'Annual Audit Plan 2025', allocation: 50, role: 'Data Analyst' },
            { projectId: 'sox-compliance-review', projectName: 'SOX Compliance Review Q1', allocation: 50, role: 'Audit Support' }
          ]
        },
        {
          id: 'miguel-rodriguez',
          name: 'Miguel Rodriguez',
          role: 'Junior Auditor',
          performance: 79.2,
          currentProjects: ['Annual Audit Plan 2025'],
          skills: ['Field Work', 'Documentation', 'Basic Audit'],
          budgetAllocated: 280000,
          budgetSpent: 252000,
          location: 'Colombia',
          experience: '1 year',
          projectAllocations: [
            { projectId: 'annual-audit-plan', projectName: 'Annual Audit Plan 2025', allocation: 75, role: 'Junior Auditor' }
          ]
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
      teamSize: 5,
      budgetAllocated: 2400000,
      budgetSpent: 1653600,
      budgetUtilization: 68.9,
      performanceScore: 91.8,
      activeProjects: 4,
      completedProjects: 7,
      status: 'excellent',
      projects: [
        {
          id: 'aml-system-enhancement',
          name: 'AML System Enhancement',
          status: 'At Risk',
          priority: 'High',
          startDate: '2025-01-01',
          endDate: '2025-02-28',
          progress: 45,
          budgetAllocated: 680000,
          budgetSpent: 408000,
          description: 'Major enhancement to AML detection and monitoring systems',
          deliverables: ['System Upgrade', 'Enhanced Algorithms', 'Performance Testing', 'User Training'],
          teamLead: 'Isabella Fernandez'
        },
        {
          id: 'transaction-monitoring',
          name: 'Transaction Monitoring Upgrade',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-01-15',
          endDate: '2025-04-15',
          progress: 60,
          budgetAllocated: 550000,
          budgetSpent: 330000,
          description: 'Upgrade transaction monitoring capabilities for better detection',
          deliverables: ['Monitoring Rules', 'Alert System', 'Dashboard Updates', 'Training Materials'],
          teamLead: 'Alejandro Gomez'
        },
        {
          id: 'sanctions-screening',
          name: 'Sanctions Screening Enhancement',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-02-01',
          endDate: '2025-05-31',
          progress: 35,
          budgetAllocated: 450000,
          budgetSpent: 157500,
          description: 'Enhanced sanctions screening and watchlist management',
          deliverables: ['Screening Engine', 'Watchlist Updates', 'Compliance Reports', 'Process Documentation'],
          teamLead: 'Natalia Reyes'
        },
        {
          id: 'aml-investigation',
          name: 'AML Investigation Process',
          status: 'In Progress',
          priority: 'Medium',
          startDate: '2025-01-20',
          endDate: '2025-06-20',
          progress: 50,
          budgetAllocated: 400000,
          budgetSpent: 200000,
          description: 'Streamline AML investigation and SAR filing processes',
          deliverables: ['Investigation Framework', 'SAR Templates', 'Case Management System', 'Training Program'],
          teamLead: 'Oscar Delgado'
        }
      ],
      teamMembers: [
        {
          id: 'isabella-fernandez',
          name: 'Isabella Fernandez',
          role: 'Senior AML Analyst',
          performance: 94.3,
          currentProjects: ['AML System Enhancement', 'Transaction Monitoring'],
          skills: ['AML Analysis', 'Transaction Monitoring', 'Suspicious Activity'],
          budgetAllocated: 500000,
          budgetSpent: 350000,
          location: 'Mexico',
          experience: '8 years',
          projectAllocations: [
            { projectId: 'aml-system-enhancement', projectName: 'AML System Enhancement', allocation: 70, role: 'Project Lead' },
            { projectId: 'transaction-monitoring', projectName: 'Transaction Monitoring Upgrade', allocation: 30, role: 'Senior Analyst' }
          ]
        },
        {
          id: 'alejandro-gomez',
          name: 'Alejandro Gomez',
          role: 'KYC Specialist',
          performance: 92.7,
          currentProjects: ['Customer Due Diligence', 'KYC Process Improvement'],
          skills: ['KYC Procedures', 'Customer Due Diligence', 'Risk Rating'],
          budgetAllocated: 450000,
          budgetSpent: 315000,
          location: 'Colombia',
          experience: '6 years',
          projectAllocations: [
            { projectId: 'transaction-monitoring', projectName: 'Transaction Monitoring Upgrade', allocation: 60, role: 'Project Lead' },
            { projectId: 'aml-system-enhancement', projectName: 'AML System Enhancement', allocation: 40, role: 'KYC Specialist' }
          ]
        },
        {
          id: 'natalia-reyes',
          name: 'Natalia Reyes',
          role: 'Sanctions Specialist',
          performance: 90.1,
          currentProjects: ['Sanctions Screening', 'Watchlist Management'],
          skills: ['Sanctions Screening', 'Watchlist Management', 'Compliance'],
          budgetAllocated: 420000,
          budgetSpent: 294000,
          location: 'Peru',
          experience: '5 years',
          projectAllocations: [
            { projectId: 'sanctions-screening', projectName: 'Sanctions Screening Enhancement', allocation: 80, role: 'Project Lead' },
            { projectId: 'transaction-monitoring', projectName: 'Transaction Monitoring Upgrade', allocation: 20, role: 'Sanctions Specialist' }
          ]
        },
        {
          id: 'oscar-delgado',
          name: 'Oscar Delgado',
          role: 'AML Investigator',
          performance: 88.9,
          currentProjects: ['Case Investigation', 'SAR Filing'],
          skills: ['Investigation', 'SAR Filing', 'Case Management'],
          budgetAllocated: 380000,
          budgetSpent: 266000,
          location: 'Honduras',
          experience: '4 years',
          projectAllocations: [
            { projectId: 'aml-investigation', projectName: 'AML Investigation Process', allocation: 75, role: 'Project Lead' },
            { projectId: 'aml-system-enhancement', projectName: 'AML System Enhancement', allocation: 25, role: 'Investigator' }
          ]
        },
        {
          id: 'camila-ortiz',
          name: 'Camila Ortiz',
          role: 'AML Coordinator',
          performance: 87.4,
          currentProjects: ['Team Coordination', 'Process Documentation'],
          skills: ['Team Coordination', 'Process Documentation', 'Training'],
          budgetAllocated: 350000,
          budgetSpent: 245000,
          location: 'Panama',
          experience: '3 years',
          projectAllocations: [
            { projectId: 'aml-investigation', projectName: 'AML Investigation Process', allocation: 50, role: 'Coordinator' },
            { projectId: 'sanctions-screening', projectName: 'Sanctions Screening Enhancement', allocation: 50, role: 'Process Coordinator' }
          ]
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
      teamSize: 4,
      budgetAllocated: 1800000,
      budgetSpent: 1524600,
      budgetUtilization: 84.7,
      performanceScore: 89.2,
      activeProjects: 3,
      completedProjects: 4,
      status: 'good',
      teamMembers: [
        {
          id: 'daniel-kim',
          name: 'Daniel Kim',
          role: 'Senior Policy Analyst',
          performance: 91.8,
          currentProjects: ['Policy Documentation Update', 'Regulatory Alignment'],
          skills: ['Policy Development', 'Regulatory Analysis', 'Documentation'],
          budgetAllocated: 480000,
          budgetSpent: 408000,
          location: 'Mexico',
          experience: '7 years'
        },
        {
          id: 'laura-mendoza',
          name: 'Laura Mendoza',
          role: 'Policy Coordinator',
          performance: 89.3,
          currentProjects: ['Policy Implementation', 'Training Development'],
          skills: ['Policy Implementation', 'Training', 'Change Management'],
          budgetAllocated: 420000,
          budgetSpent: 357000,
          location: 'Colombia',
          experience: '5 years'
        },
        {
          id: 'sergio-vega',
          name: 'Sergio Vega',
          role: 'Compliance Policy Specialist',
          performance: 87.9,
          currentProjects: ['Compliance Policy Review', 'Process Standardization'],
          skills: ['Compliance Policy', 'Process Standardization', 'Quality Assurance'],
          budgetAllocated: 390000,
          budgetSpent: 331500,
          location: 'Peru',
          experience: '6 years'
        },
        {
          id: 'monica-castro',
          name: 'Monica Castro',
          role: 'Policy Assistant',
          performance: 85.7,
          currentProjects: ['Documentation Support', 'Policy Research'],
          skills: ['Documentation', 'Research', 'Administrative Support'],
          budgetAllocated: 310000,
          budgetSpent: 263500,
          location: 'Honduras',
          experience: '3 years'
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
      teamSize: 6,
      budgetAllocated: 2300000,
      budgetSpent: 1825800,
      budgetUtilization: 79.4,
      performanceScore: 92.1,
      activeProjects: 3,
      completedProjects: 6,
      status: 'excellent',
      teamMembers: [
        {
          id: 'francisco-lopez',
          name: 'Francisco Lopez',
          role: 'Senior Risk Manager',
          performance: 93.7,
          currentProjects: ['Operational Risk Framework', 'Risk Mitigation Strategy'],
          skills: ['Risk Management', 'Strategy Development', 'Framework Design'],
          budgetAllocated: 520000,
          budgetSpent: 416000,
          location: 'Mexico',
          experience: '9 years'
        },
        {
          id: 'adriana-silva',
          name: 'Adriana Silva',
          role: 'Business Continuity Specialist',
          performance: 91.4,
          currentProjects: ['BCP Development', 'Disaster Recovery Planning'],
          skills: ['Business Continuity', 'Disaster Recovery', 'Crisis Management'],
          budgetAllocated: 450000,
          budgetSpent: 360000,
          location: 'Colombia',
          experience: '6 years'
        },
        {
          id: 'eduardo-ramirez',
          name: 'Eduardo Ramirez',
          role: 'Operational Risk Analyst',
          performance: 90.2,
          currentProjects: ['Risk Assessment', 'Control Testing'],
          skills: ['Risk Assessment', 'Control Testing', 'Data Analysis'],
          budgetAllocated: 410000,
          budgetSpent: 328000,
          location: 'Peru',
          experience: '5 years'
        },
        {
          id: 'beatriz-moreno',
          name: 'Beatriz Moreno',
          role: 'Process Risk Specialist',
          performance: 89.8,
          currentProjects: ['Process Risk Review', 'Control Enhancement'],
          skills: ['Process Analysis', 'Control Design', 'Risk Mitigation'],
          budgetAllocated: 380000,
          budgetSpent: 304000,
          location: 'Honduras',
          experience: '4 years'
        },
        {
          id: 'rodrigo-herrera',
          name: 'Rodrigo Herrera',
          role: 'Risk Coordinator',
          performance: 88.5,
          currentProjects: ['Risk Reporting', 'Team Coordination'],
          skills: ['Risk Reporting', 'Team Management', 'Communication'],
          budgetAllocated: 350000,
          budgetSpent: 280000,
          location: 'Panama',
          experience: '3 years'
        },
        {
          id: 'carolina-jimenez',
          name: 'Carolina Jimenez',
          role: 'Junior Risk Analyst',
          performance: 86.3,
          currentProjects: ['Data Collection', 'Risk Metrics'],
          skills: ['Data Collection', 'Risk Metrics', 'Report Generation'],
          budgetAllocated: 290000,
          budgetSpent: 232000,
          location: 'Mexico',
          experience: '2 years'
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
      teamSize: 5,
      budgetAllocated: 2100000,
      budgetSpent: 1812300,
      budgetUtilization: 86.3,
      performanceScore: 90.7,
      activeProjects: 4,
      completedProjects: 5,
      status: 'good',
      teamMembers: [
        {
          id: 'pablo-martinez',
          name: 'Pablo Martinez',
          role: 'Senior RegTech Developer',
          performance: 92.9,
          currentProjects: ['RegTech Platform Development', 'API Integration'],
          skills: ['Full Stack Development', 'API Development', 'RegTech Solutions'],
          budgetAllocated: 480000,
          budgetSpent: 412800,
          location: 'Mexico',
          experience: '8 years'
        },
        {
          id: 'silvia-torres',
          name: 'Silvia Torres',
          role: 'Data Analyst',
          performance: 90.1,
          currentProjects: ['Regulatory Data Analysis', 'Compliance Metrics'],
          skills: ['Data Analysis', 'SQL', 'Business Intelligence'],
          budgetAllocated: 420000,
          budgetSpent: 361200,
          location: 'Colombia',
          experience: '5 years'
        },
        {
          id: 'javier-ruiz',
          name: 'Javier Ruiz',
          role: 'RegTech Architect',
          performance: 89.7,
          currentProjects: ['System Architecture', 'Technology Strategy'],
          skills: ['System Architecture', 'Technology Strategy', 'Cloud Solutions'],
          budgetAllocated: 450000,
          budgetSpent: 387000,
          location: 'Peru',
          experience: '7 years'
        },
        {
          id: 'andrea-vargas',
          name: 'Andrea Vargas',
          role: 'QA Engineer',
          performance: 88.4,
          currentProjects: ['Quality Assurance', 'Testing Automation'],
          skills: ['Quality Assurance', 'Test Automation', 'Performance Testing'],
          budgetAllocated: 380000,
          budgetSpent: 326400,
          location: 'Honduras',
          experience: '4 years'
        },
        {
          id: 'manuel-santos',
          name: 'Manuel Santos',
          role: 'Junior Developer',
          performance: 86.8,
          currentProjects: ['Frontend Development', 'UI/UX Implementation'],
          skills: ['Frontend Development', 'React', 'UI/UX'],
          budgetAllocated: 320000,
          budgetSpent: 275200,
          location: 'Panama',
          experience: '2 years'
        }
      ]
    }
  ];

  // POD Management data based on the document
  const podOperations = {
    totalPods: 18,
    activePods: 5,
    planningPods: 12,
    satPods: 1,
    countries: ['MEX', 'PER', 'COL', 'HND', 'PAN'],
    businessLines: {
      'Finance': 9,
      'AML': 5,
      'OT': 2,
      'KYC': 1,
      'SEC': 1
    }
  };

  const handleVPClick = (vp: any) => {
    setSelectedVP(vp);
    setSelectedView('vp-detail');
  };

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setSelectedView('member-detail');
  };

  const handleBackToOverview = () => {
    setSelectedView('overview');
    setSelectedVP(null);
    setSelectedMember(null);
  };

  const handleBackToVP = () => {
    setSelectedView('vp-detail');
    setSelectedMember(null);
  };

  if (selectedView === 'member-detail' && selectedMember) {
    return <MemberDetailView member={selectedMember} onBack={handleBackToVP} />;
  }

  if (selectedView === 'vp-detail' && selectedVP) {
    return <VPDetailView vp={selectedVP} onBack={handleBackToOverview} onMemberClick={handleMemberClick} />;
  }

  const teamMembers = [
    {
      id: 'asif-mohammed',
      name: 'Asif Mohammed',
      role: 'Technical Lead',
      skills: ['Full Stack', 'Backend', 'DevOps'],
      podsAssigned: 3,
      currentPods: ['AML-MEX-2025-001', 'Finance-COL-2025-002'],
      performance: 94.5,
      status: 'active',
      location: 'Mexico',
      businessLine: 'AML'
    },
    {
      id: 'kanya',
      name: 'Kanya',
      role: 'Senior Developer',
      skills: ['Frontend', 'Full Stack'],
      podsAssigned: 2,
      currentPods: ['KYC-PER-2025-001'],
      performance: 91.2,
      status: 'active',
      location: 'Peru',
      businessLine: 'KYC'
    },
    {
      id: 'srini',
      name: 'Srini',
      role: 'Full Stack Developer',
      skills: ['Full Stack', 'QA'],
      podsAssigned: 2,
      currentPods: ['Finance-HND-2025-003'],
      performance: 88.7,
      status: 'active',
      location: 'Honduras',
      businessLine: 'Finance'
    },
    {
      id: 'maria-garcia',
      name: 'Maria Garcia',
      role: 'QA Engineer',
      skills: ['QA', 'Testing'],
      podsAssigned: 1,
      currentPods: ['SEC-PAN-2025-001'],
      performance: 92.1,
      status: 'active',
      location: 'Panama',
      businessLine: 'SEC'
    },
    {
      id: 'carlos-silva',
      name: 'Carlos Silva',
      role: 'DevOps Engineer',
      skills: ['DevOps', 'Backend'],
      podsAssigned: 2,
      currentPods: ['OT-MEX-2025-001', 'Finance-COL-2025-004'],
      performance: 89.8,
      status: 'active',
      location: 'Colombia',
      businessLine: 'OT'
    },
    {
      id: 'ana-rodriguez',
      name: 'Ana Rodriguez',
      role: 'Business Analyst',
      skills: ['Business Analysis'],
      podsAssigned: 1,
      currentPods: ['Finance-PER-2025-002'],
      performance: 93.4,
      status: 'active',
      location: 'Peru',
      businessLine: 'Finance'
    },
    {
      id: 'pedro-martinez',
      name: 'Pedro Martinez',
      role: 'Frontend Developer',
      skills: ['Frontend', 'UI/UX'],
      podsAssigned: 1,
      currentPods: ['AML-COL-2025-003'],
      performance: 87.6,
      status: 'active',
      location: 'Colombia',
      businessLine: 'AML'
    },
    {
      id: 'luis-fernando',
      name: 'Luis Fernando',
      role: 'Backend Developer',
      skills: ['Backend', 'Database'],
      podsAssigned: 2,
      currentPods: ['Finance-MEX-2025-005'],
      performance: 90.3,
      status: 'active',
      location: 'Mexico',
      businessLine: 'Finance'
    }
  ];

  return (
    <div className="h-full p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">My Team - POD Operations</h2>
        <p className="text-gray-400">Managing {podOperations.totalPods} PODs across {podOperations.countries.length} countries</p>
      </motion.div>

      {/* POD Operations Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{podOperations.activePods}</p>
              <p className="text-gray-400 text-sm">Active PODs</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{podOperations.planningPods}</p>
              <p className="text-gray-400 text-sm">Planning PODs</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
              <p className="text-gray-400 text-sm">Team Members</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{podOperations.countries.length}</p>
              <p className="text-gray-400 text-sm">Countries</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Business Lines Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Business Lines Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(podOperations.businessLines).map(([line, count], index) => (
            <div key={line} className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                line === 'Finance' ? 'bg-green-500/20' :
                line === 'AML' ? 'bg-red-500/20' :
                line === 'KYC' ? 'bg-blue-500/20' :
                line === 'OT' ? 'bg-purple-500/20' :
                'bg-yellow-500/20'
              }`}>
                <span className={`text-lg font-bold ${
                  line === 'Finance' ? 'text-green-400' :
                  line === 'AML' ? 'text-red-400' :
                  line === 'KYC' ? 'text-blue-400' :
                  line === 'OT' ? 'text-purple-400' :
                  'text-yellow-400'
                }`}>{count}</span>
              </div>
              <p className="text-white font-medium text-sm">{line}</p>
              <p className="text-gray-400 text-xs">PODs</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* VP Teams Grid - Clickable for drill-down */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">VP Teams - Click to Drill Down</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Status</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {vpTeams.map((vp, index) => (
            <motion.div
              key={vp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 group cursor-pointer transform hover:scale-105"
              onClick={() => handleVPClick(vp)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${vp.color} rounded-xl flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">{vp.avatar}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{vp.name}</h4>
                    <p className="text-gray-400 text-sm">{vp.title}</p>
                    <p className="text-gray-500 text-xs">{vp.department}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vp.status === 'excellent' ? 'bg-green-800 text-green-200' :
                  vp.status === 'good' ? 'bg-blue-800 text-blue-200' :
                  'bg-yellow-800 text-yellow-200'
                }`}>
                  {vp.status === 'excellent' ? 'Excellent' :
                   vp.status === 'good' ? 'Good' : 'Needs Attention'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div className="text-center">
                  <p className="text-white font-semibold">{vp.teamSize}</p>
                  <p className="text-gray-400 text-xs">Team Size</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">{vp.activeProjects}</p>
                  <p className="text-gray-400 text-xs">Active Projects</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Budget Utilization</span>
                  <span className="text-white font-semibold">{vp.budgetUtilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${vp.budgetUtilization}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                    className={`h-2 rounded-full ${
                      vp.budgetUtilization > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                      vp.budgetUtilization > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-green-400 to-emerald-500'
                    } shadow-lg`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Performance</span>
                <span className="text-green-400 font-semibold">{vp.performanceScore.toFixed(1)}%</span>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-gray-400 text-xs mb-1">Budget: {formatCurrency(vp.budgetAllocated)}</p>
                <p className="text-gray-500 text-xs">Click to view team details →</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team Members Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">POD Team Members</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Status</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                    <p className="text-gray-500 text-xs">{member.location} • {member.businessLine}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{member.performance.toFixed(1)}%</p>
                  <p className="text-gray-400 text-xs">Performance</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-400 text-xs mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white font-semibold">{member.podsAssigned}</p>
                  <p className="text-gray-400 text-xs">PODs Assigned</p>
                </div>
                <div>
                  <p className="text-white font-semibold">{member.currentPods.length}</p>
                  <p className="text-gray-400 text-xs">Active PODs</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-gray-400 text-xs mb-1">Current PODs:</p>
                <div className="space-y-1">
                  {member.currentPods.map((pod) => (
                    <div key={pod} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-xs">{pod}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Countries Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 mt-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {podOperations.countries.map((country, index) => (
            <div key={country} className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-sm">{country}</span>
              </div>
              <p className="text-white font-medium text-sm">{country}</p>
              <p className="text-gray-400 text-xs">
                {teamMembers.filter(m => m.location.includes(country === 'MEX' ? 'Mexico' : 
                  country === 'PER' ? 'Peru' : 
                  country === 'COL' ? 'Colombia' : 
                  country === 'HND' ? 'Honduras' : 'Panama')).length} members
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ProjectsDashboard({ svpData }: { svpData: SVPData }) {
  const [selectedView, setSelectedView] = useState<'overview' | 'kanban' | 'timeline' | 'analytics' | 'chat'>('overview');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced project data with comprehensive details - Expanded for SVP level
  const enhancedProjects = [
    {
      id: 'proj-001',
      name: 'Q1 Regulatory Compliance Audit',
      description: 'Comprehensive quarterly regulatory compliance audit across all LATAM operations to ensure adherence to local and international banking regulations.',
      status: 'On Track',
      priority: 'High',
      progress: 75,
      budget: 450000,
      spent: 337500,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      assignedTo: 'Sarah Chen',
      department: 'Regulatory Affairs',
      teamLead: 'John Martinez',
      teamSize: 8,
      location: ['Mexico', 'Colombia', 'Peru'],
      tags: ['Compliance', 'Audit', 'Regulatory', 'LATAM'],
      teamMembers: ['John Martinez', 'Maria Santos', 'Carlos Rivera', 'Ana Lopez', 'Luis Garcia', 'Sofia Mendez', 'Roberto Silva', 'Elena Vargas'],
      deliverables: [
        { name: 'Compliance Report', status: 'Completed', dueDate: '2025-02-15' },
        { name: 'Risk Assessment', status: 'In Progress', dueDate: '2025-03-01' },
        { name: 'Regulatory Gap Analysis', status: 'Pending', dueDate: '2025-03-15' },
        { name: 'Action Plan', status: 'Pending', dueDate: '2025-03-31' }
      ],
      milestones: [
        { name: 'Initial Assessment', date: '2025-01-15', status: 'Completed' },
        { name: 'Field Audits', date: '2025-02-15', status: 'Completed' },
        { name: 'Report Compilation', date: '2025-03-01', status: 'In Progress' },
        { name: 'Final Review', date: '2025-03-15', status: 'Pending' },
        { name: 'Submission', date: '2025-03-31', status: 'Pending' }
      ],
      risks: [
        { description: 'Regulatory changes during audit period', impact: 'Medium', mitigation: 'Regular regulatory monitoring' },
        { description: 'Resource availability in peak season', impact: 'Low', mitigation: 'Cross-training team members' }
      ],
      recentActivity: [
        { date: '2025-01-11', user: 'John Martinez', action: 'Completed Mexico field audit', type: 'milestone' },
        { date: '2025-01-10', user: 'Sarah Chen', action: 'Approved budget reallocation', type: 'budget' },
        { date: '2025-01-09', user: 'Carlos Rivera', action: 'Updated compliance checklist', type: 'update' }
      ],
      kpis: {
        qualityScore: 94,
        timelineAdherence: 98,
        budgetEfficiency: 88,
        stakeholderSatisfaction: 92
      }
    },
    {
      id: 'proj-002',
      name: 'AML System Enhancement',
      description: 'Major enhancement to Anti-Money Laundering detection and monitoring systems to improve accuracy and reduce false positives.',
      status: 'At Risk',
      priority: 'Critical',
      progress: 45,
      budget: 680000,
      spent: 408000,
      startDate: '2025-01-01',
      endDate: '2025-02-28',
      assignedTo: 'Carlos Rodriguez',
      department: 'AML Operations',
      teamLead: 'Isabella Fernandez',
      teamSize: 12,
      location: ['Mexico', 'Colombia', 'Peru', 'Honduras', 'Panama'],
      tags: ['AML', 'Technology', 'Enhancement', 'Critical'],
      teamMembers: ['Isabella Fernandez', 'Alejandro Gomez', 'Natalia Reyes', 'Oscar Delgado', 'Camila Ortiz', 'Fernando Castro', 'Patricia Ruiz', 'Diego Morales', 'Carmen Jimenez', 'Ricardo Torres', 'Miguel Santos', 'Elena Vargas'],
      deliverables: [
        { name: 'System Architecture', status: 'Completed', dueDate: '2025-01-15' },
        { name: 'Algorithm Enhancement', status: 'At Risk', dueDate: '2025-02-01' },
        { name: 'Performance Testing', status: 'Pending', dueDate: '2025-02-15' },
        { name: 'User Training', status: 'Pending', dueDate: '2025-02-28' }
      ],
      milestones: [
        { name: 'Requirements Analysis', date: '2025-01-08', status: 'Completed' },
        { name: 'System Design', date: '2025-01-15', status: 'Completed' },
        { name: 'Development Phase 1', date: '2025-01-30', status: 'At Risk' },
        { name: 'Testing Phase', date: '2025-02-15', status: 'Pending' },
        { name: 'Deployment', date: '2025-02-28', status: 'Pending' }
      ],
      risks: [
        { description: 'Technical complexity higher than estimated', impact: 'High', mitigation: 'Additional technical resources allocated' },
        { description: 'Integration challenges with legacy systems', impact: 'High', mitigation: 'Dedicated integration team formed' },
        { description: 'Tight deadline constraints', impact: 'Medium', mitigation: 'Parallel development streams' }
      ],
      recentActivity: [
        { date: '2025-01-11', user: 'Isabella Fernandez', action: 'Escalated technical issues to architecture team', type: 'escalation' },
        { date: '2025-01-10', user: 'Carlos Rodriguez', action: 'Requested additional resources', type: 'resource' },
        { date: '2025-01-09', user: 'Tech Team', action: 'Identified integration bottleneck', type: 'issue' }
      ],
      kpis: {
        qualityScore: 78,
        timelineAdherence: 65,
        budgetEfficiency: 82,
        stakeholderSatisfaction: 75
      }
    },
    {
      id: 'proj-003',
      name: 'Policy Documentation Update',
      description: 'Comprehensive update of regulatory policies and procedures to align with new LATAM banking regulations and international standards.',
      status: 'On Track',
      priority: 'Medium',
      progress: 60,
      budget: 125000,
      spent: 75000,
      startDate: '2025-01-15',
      endDate: '2025-04-30',
      assignedTo: 'Lisa Wong',
      department: 'Policy Management',
      teamLead: 'Daniel Kim',
      teamSize: 4,
      location: ['Mexico', 'Colombia'],
      tags: ['Policy', 'Documentation', 'Regulatory', 'Update'],
      teamMembers: ['Daniel Kim', 'Laura Mendoza', 'Sergio Vega', 'Monica Castro'],
      deliverables: [
        { name: 'Policy Review', status: 'Completed', dueDate: '2025-02-15' },
        { name: 'Documentation Updates', status: 'In Progress', dueDate: '2025-03-30' },
        { name: 'Training Materials', status: 'In Progress', dueDate: '2025-04-15' },
        { name: 'Implementation Plan', status: 'Pending', dueDate: '2025-04-30' }
      ],
      milestones: [
        { name: 'Current State Analysis', date: '2025-01-30', status: 'Completed' },
        { name: 'Gap Identification', date: '2025-02-15', status: 'Completed' },
        { name: 'Documentation Draft', date: '2025-03-15', status: 'In Progress' },
        { name: 'Review & Approval', date: '2025-04-15', status: 'Pending' },
        { name: 'Final Implementation', date: '2025-04-30', status: 'Pending' }
      ],
      risks: [
        { description: 'Regulatory changes during update period', impact: 'Medium', mitigation: 'Regular regulatory monitoring' },
        { description: 'Stakeholder availability for reviews', impact: 'Low', mitigation: 'Flexible review schedule' }
      ],
      recentActivity: [
        { date: '2025-01-11', user: 'Daniel Kim', action: 'Completed Mexico policy review', type: 'milestone' },
        { date: '2025-01-10', user: 'Lisa Wong', action: 'Approved documentation template', type: 'approval' },
        { date: '2025-01-09', user: 'Laura Mendoza', action: 'Started training material development', type: 'update' }
      ],
      kpis: {
        qualityScore: 91,
        timelineAdherence: 95,
        budgetEfficiency: 92,
        stakeholderSatisfaction: 89
      }
    },
    {
      id: 'proj-004',
      name: 'Risk Assessment Framework 2025',
      description: 'Development of comprehensive risk assessment framework for all business units with enhanced predictive capabilities and real-time monitoring.',
      status: 'Delayed',
      priority: 'High',
      progress: 30,
      budget: 320000,
      spent: 160000,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      assignedTo: 'Miguel Santos',
      department: 'Risk Management',
      teamLead: 'Ricardo Torres',
      teamSize: 6,
      location: ['Colombia', 'Peru'],
      tags: ['Risk', 'Framework', 'Assessment', 'Predictive'],
      teamMembers: ['Ricardo Torres', 'Patricia Ruiz', 'Diego Morales', 'Carmen Jimenez', 'Fernando Castro', 'Beatriz Moreno'],
      deliverables: [
        { name: 'Framework Design', status: 'In Progress', dueDate: '2025-02-28' },
        { name: 'Risk Models', status: 'Pending', dueDate: '2025-04-15' },
        { name: 'Testing & Validation', status: 'Pending', dueDate: '2025-05-30' },
        { name: 'Implementation Guide', status: 'Pending', dueDate: '2025-06-30' }
      ],
      milestones: [
        { name: 'Requirements Gathering', date: '2025-01-15', status: 'Completed' },
        { name: 'Framework Architecture', date: '2025-02-01', status: 'Delayed' },
        { name: 'Model Development', date: '2025-03-15', status: 'Pending' },
        { name: 'Pilot Testing', date: '2025-05-01', status: 'Pending' },
        { name: 'Full Deployment', date: '2025-06-30', status: 'Pending' }
      ],
      risks: [
        { description: 'Complex integration requirements', impact: 'High', mitigation: 'Phased implementation approach' },
        { description: 'Data quality issues', impact: 'Medium', mitigation: 'Data cleansing initiative' },
        { description: 'Resource constraints', impact: 'Medium', mitigation: 'External consultant support' }
      ],
      recentActivity: [
        { date: '2025-01-11', user: 'Miguel Santos', action: 'Requested timeline extension', type: 'schedule' },
        { date: '2025-01-10', user: 'Ricardo Torres', action: 'Identified data integration challenges', type: 'issue' },
        { date: '2025-01-09', user: 'Risk Team', action: 'Completed requirements review', type: 'milestone' }
      ],
      kpis: {
        qualityScore: 85,
        timelineAdherence: 72,
        budgetEfficiency: 88,
        stakeholderSatisfaction: 80
      }
    },
    {
      id: 'proj-005',
      name: 'SOX Compliance Review Q1',
      description: 'Sarbanes-Oxley compliance review for Q1 financial controls across all LATAM operations with enhanced testing procedures.',
      status: 'On Track',
      priority: 'Critical',
      progress: 45,
      budget: 800000,
      spent: 360000,
      startDate: '2025-01-15',
      endDate: '2025-03-31',
      assignedTo: 'Priya Patel',
      department: 'Internal Audit',
      teamLead: 'Elena Vargas',
      teamSize: 7,
      location: ['Mexico', 'Colombia', 'Peru'],
      tags: ['SOX', 'Compliance', 'Financial Controls', 'Audit'],
      teamMembers: ['Elena Vargas', 'James Wilson', 'Roberto Silva', 'Gabriela Herrera', 'Andres Martinez', 'Valeria Torres', 'Miguel Rodriguez'],
      deliverables: [
        { name: 'Controls Testing Report', status: 'In Progress', dueDate: '2025-02-28' },
        { name: 'Deficiency Analysis', status: 'Pending', dueDate: '2025-03-15' },
        { name: 'Management Letter', status: 'Pending', dueDate: '2025-03-25' },
        { name: 'Remediation Plan', status: 'Pending', dueDate: '2025-03-31' }
      ],
      milestones: [
        { name: 'Planning Phase', date: '2025-01-20', status: 'Completed' },
        { name: 'Controls Testing', date: '2025-02-28', status: 'In Progress' },
        { name: 'Findings Review', date: '2025-03-15', status: 'Pending' },
        { name: 'Final Report', date: '2025-03-31', status: 'Pending' }
      ],
      risks: [
        { description: 'Complex control environment changes', impact: 'Medium', mitigation: 'Enhanced documentation procedures' },
        { description: 'Resource allocation conflicts', impact: 'Low', mitigation: 'Flexible scheduling' }
      ],
      recentActivity: [
        { date: '2025-01-11', user: 'Elena Vargas', action: 'Completed IT controls testing', type: 'milestone' },
        { date: '2025-01-10', user: 'James Wilson', action: 'Updated testing procedures', type: 'update' },
        { date: '2025-01-09', user: 'Roberto Silva', action: 'Identified control gaps', type: 'finding' }
      ],
      kpis: {
        qualityScore: 88,
        timelineAdherence: 92,
        budgetEfficiency: 85,
        stakeholderSatisfaction: 90
      }
    },
    {
      id: 'proj-006',
      name: 'Transaction Monitoring Upgrade',
      description: 'Upgrade transaction monitoring capabilities for better AML detection with enhanced algorithms and real-time processing.',
      status: 'On Track',
      priority: 'High',
      progress: 60,
      budget: 550000,
      spent: 330000,
      startDate: '2025-01-15',
      endDate: '2025-04-15',
      assignedTo: 'Carlos Rodriguez',
      department: 'AML Operations',
      teamLead: 'Alejandro Gomez',
      teamSize: 5,
      location: ['Mexico', 'Colombia', 'Peru'],
      tags: ['AML', 'Transaction Monitoring', 'Technology', 'Upgrade'],
      teamMembers: ['Alejandro Gomez', 'Natalia Reyes', 'Oscar Delgado', 'Camila Ortiz', 'Fernando Castro'],
      deliverables: [
        { name: 'Monitoring Rules', status: 'Completed', dueDate: '2025-02-15' },
        { name: 'Alert System', status: 'In Progress', dueDate: '2025-03-15' },
        { name: 'Dashboard Updates', status: 'In Progress', dueDate: '2025-04-01' },
        { name: 'Training Materials', status: 'Pending', dueDate: '2025-04-15' }
      ],
      milestones: [
        { name: 'Requirements Analysis', date: '2025-01-25', status: 'Completed' },
        { name: 'System Design', date: '2025-02-15', status: 'Completed' },
        { name: 'Development Phase', date: '2025-03-15', status: 'In Progress' },
        { name: 'Testing Phase', date: '2025-04-01', status: 'Pending' },
        { name: 'Go Live', date: '2025-04-15', status: 'Pending' }
      ],
      risks: [
        { description: 'Integration with existing systems', impact: 'Medium', mitigation: 'Phased rollout approach' },
        { description: 'User adoption challenges', impact: 'Low', mitigation: 'Comprehensive training program' }
      ],
      recentActivity: [
        { date: '2025-01-11', user: 'Alejandro Gomez', action: 'Completed alert system design', type: 'milestone' },
        { date: '2025-01-10', user: 'Natalia Reyes', action: 'Updated monitoring rules', type: 'update' },
        { date: '2025-01-09', user: 'Oscar Delgado', action: 'Tested new algorithms', type: 'testing' }
      ],
      kpis: {
        qualityScore: 92,
        timelineAdherence: 88,
        budgetEfficiency: 90,
        stakeholderSatisfaction: 87
      }
    },
    {
      id: 'proj-007',
      name: 'Operational Risk Framework',
      description: 'Development of comprehensive operational risk framework with enhanced controls and monitoring capabilities.',
      status: 'On Track',
      priority: 'Medium',
      progress: 35,
      budget: 280000,
      spent: 98000,
      startDate: '2025-02-01',
      endDate: '2025-07-31',
      assignedTo: 'David Kim',
      department: 'Operational Risk',
      teamLead: 'Francisco Lopez',
      teamSize: 6,
      location: ['Mexico', 'Colombia', 'Peru'],
      tags: ['Operational Risk', 'Framework', 'Controls', 'Monitoring'],
      teamMembers: ['Francisco Lopez', 'Adriana Silva', 'Eduardo Ramirez', 'Beatriz Moreno', 'Rodrigo Herrera', 'Carolina Jimenez'],
      deliverables: [
        { name: 'Risk Inventory', status: 'In Progress', dueDate: '2025-03-31' },
        { name: 'Control Assessment', status: 'Pending', dueDate: '2025-05-15' },
        { name: 'Framework Documentation', status: 'Pending', dueDate: '2025-06-30' },
        { name: 'Implementation Plan', status: 'Pending', dueDate: '2025-07-31' }
      ],
      milestones: [
        { name: 'Risk Identification', date: '2025-02-15', status: 'In Progress' },
        { name: 'Control Design', date: '2025-04-01', status: 'Pending' },
        { name: 'Framework Testing', date: '2025-06-01', status: 'Pending' },
        { name: 'Implementation', date: '2025-07-31', status: 'Pending' }
      ],
      risks: [
        { description: 'Resource availability constraints', impact: 'Medium', mitigation: 'Cross-functional team support' },
        { description: 'Complexity of framework integration', impact: 'Low', mitigation: 'Phased implementation approach' }
      ],
      recentActivity: [
        { date: '2025-01-11', user: 'Francisco Lopez', action: 'Started risk inventory compilation', type: 'milestone' },
        { date: '2025-01-10', user: 'David Kim', action: 'Approved framework scope', type: 'approval' },
        { date: '2025-01-09', user: 'Adriana Silva', action: 'Completed initial risk assessment', type: 'update' }
      ],
      kpis: {
        qualityScore: 87,
        timelineAdherence: 85,
        budgetEfficiency: 95,
        stakeholderSatisfaction: 88
      }
    },
    {
      id: 'proj-008',
      name: 'RegTech Platform Development',
      description: 'Development of comprehensive regulatory technology platform to streamline compliance processes and enhance regulatory reporting capabilities.',
      status: 'On Track',
      priority: 'High',
      progress: 70,
      budget: 750000,
      spent: 525000,
      startDate: '2025-01-01',
      endDate: '2025-05-31',
      assignedTo: 'Maria Gonzalez',
      department: 'Regulatory Technology',
      teamLead: 'Pablo Martinez',
      teamSize: 5,
      location: ['Mexico', 'Colombia', 'Peru'],
      tags: ['RegTech', 'Platform', 'Technology', 'Compliance'],
      teamMembers: ['Pablo Martinez', 'Silvia Torres', 'Javier Ruiz', 'Andrea Vargas', 'Manuel Santos'],
      deliverables: [
        { name: 'Platform Architecture', status: 'Completed', dueDate: '2025-01-31' },
        { name: 'Core Modules', status: 'In Progress', dueDate: '2025-03-31' },
        { name: 'API Integration', status: 'In Progress', dueDate: '2025-04-30' },
        { name: 'User Interface', status: 'Pending', dueDate: '2025-05-31' }
      ],
      milestones: [
        { name: 'Platform Design', date: '2025-01-31', status: 'Completed' },
        { name: 'Development Phase 1', date: '2025-03-15', status: 'In Progress' },
        { name: 'Integration Testing', date: '2025-04-30', status: 'Pending' },
        { name: 'User Acceptance Testing', date: '2025-05-15', status: 'Pending' },
        { name: 'Go Live', date: '2025-05-31', status: 'Pending' }
      ],
      risks: [
        { description: 'API integration complexity', impact: 'Medium', mitigation: 'Dedicated integration team' },
        { description: 'User adoption challenges', impact: 'Low', mitigation: 'Comprehensive training program' }
      ],
      recentActivity: [
        { date: '2025-01-11', user: 'Pablo Martinez', action: 'Completed core module development', type: 'milestone' },
        { date: '2025-01-10', user: 'Silvia Torres', action: 'Updated data analysis components', type: 'update' },
        { date: '2025-01-09', user: 'Javier Ruiz', action: 'Finalized system architecture', type: 'milestone' }
      ],
      kpis: {
        qualityScore: 93,
        timelineAdherence: 90,
        budgetEfficiency: 87,
        stakeholderSatisfaction: 91
      }
    }
  ];

  // Filter projects based on current filters
  const filteredProjects = enhancedProjects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  if (showProjectDetail && selectedProject) {
    return <ProjectDetailView project={selectedProject} onBack={() => setShowProjectDetail(false)} />;
  }

  return (
    <div className="h-full p-4 overflow-y-auto">
      {/* Header with View Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Project Portfolio Management</h2>
            <p className="text-gray-400">Comprehensive project oversight and analytics for {svpData.user.name}'s division</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Updates</span>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'kanban', name: 'Kanban', icon: '📋' },
              { id: 'timeline', name: 'Timeline', icon: '📅' },
              { id: 'analytics', name: 'Analytics', icon: '📈' },
              { id: 'chat', name: 'AI Chat', icon: '💬' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                  selectedView === view.id
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                <span>{view.icon}</span>
                <span>{view.name}</span>
              </button>
            ))}
          </div>
          
          {/* Create New Project Button */}
          <button
            onClick={() => setShowProjectCreation(true)}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium text-sm rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Project</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search projects, descriptions, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="all">All Status</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="all">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </motion.div>

      {/* View Content */}
      <div className="h-[calc(100%-200px)]">
        {selectedView === 'overview' && <ProjectOverviewView projects={filteredProjects} onProjectClick={handleProjectClick} />}
        {selectedView === 'kanban' && <ProjectKanbanView projects={filteredProjects} onProjectClick={handleProjectClick} />}
        {selectedView === 'timeline' && <ProjectTimelineView projects={filteredProjects} onProjectClick={handleProjectClick} />}
        {selectedView === 'analytics' && <ProjectAnalyticsView projects={filteredProjects} />}
        {selectedView === 'chat' && <ProjectChatView projects={filteredProjects} />}
      </div>

      {/* Project Creation Wizard Modal */}
      <ProjectCreationWizard
        isOpen={showProjectCreation}
        onClose={() => setShowProjectCreation(false)}
        onProjectCreated={(project) => {
          console.log('New project created:', project);
          setShowProjectCreation(false);
          // Here you would typically refresh the projects list
        }}
        vpTeams={[
          {
            id: 'sarah-chen',
            name: 'Sarah Chen',
            title: 'VP Regulatory Affairs',
            department: 'Regulatory Affairs',
            avatar: 'SC',
            color: 'from-blue-500 to-cyan-600',
            activeProjects: 3,
            budgetUtilization: 82.1
          },
          {
            id: 'miguel-santos',
            name: 'Miguel Santos',
            title: 'VP Risk Management',
            department: 'Risk Management',
            avatar: 'MS',
            color: 'from-red-500 to-pink-600',
            activeProjects: 4,
            budgetUtilization: 75.3
          },
          {
            id: 'priya-patel',
            name: 'Priya Patel',
            title: 'VP Internal Audit',
            department: 'Internal Audit',
            avatar: 'PP',
            color: 'from-purple-500 to-indigo-600',
            activeProjects: 2,
            budgetUtilization: 91.2
          },
          {
            id: 'carlos-rodriguez',
            name: 'Carlos Rodriguez',
            title: 'VP AML Operations',
            department: 'AML Operations',
            avatar: 'CR',
            color: 'from-orange-500 to-red-600',
            activeProjects: 4,
            budgetUtilization: 68.9
          },
          {
            id: 'lisa-wong',
            name: 'Lisa Wong',
            title: 'VP Policy Management',
            department: 'Policy Management',
            avatar: 'LW',
            color: 'from-green-500 to-teal-600',
            activeProjects: 3,
            budgetUtilization: 84.7
          },
          {
            id: 'david-kim',
            name: 'David Kim',
            title: 'VP Operational Risk',
            department: 'Operational Risk',
            avatar: 'DK',
            color: 'from-indigo-500 to-purple-600',
            activeProjects: 3,
            budgetUtilization: 79.4
          },
          {
            id: 'maria-gonzalez',
            name: 'Maria Gonzalez',
            title: 'VP Regulatory Technology',
            department: 'RegTech',
            avatar: 'MG',
            color: 'from-cyan-500 to-blue-600',
            activeProjects: 4,
            budgetUtilization: 86.3
          }
        ]}
      />
    </div>
  );
}

function BudgetDashboard({ svpData }: { svpData: SVPData }) {
  return <VinodBudgetDashboard />;
}

function ComplianceDashboard({ svpData }: { svpData: SVPData }) {
  return <VinodComplianceDashboard />;
}

// VP Detail View Component
function VPDetailView({ vp, onBack, onMemberClick }: { vp: any; onBack: () => void; onMemberClick: (member: any) => void }) {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-300" />
          </button>
          <div className={`w-12 h-12 bg-gradient-to-br ${vp.color} rounded-xl flex items-center justify-center`}>
            <span className="text-white font-bold text-xl">{vp.avatar}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{vp.name}</h2>
            <p className="text-gray-400">{vp.title} • {vp.department}</p>
          </div>
        </div>
      </motion.div>

      {/* VP KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{vp.teamSize}</p>
            <p className="text-gray-400 text-sm">Team Members</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{vp.activeProjects}</p>
            <p className="text-gray-400 text-sm">Active Projects</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatCurrency(vp.budgetAllocated)}</p>
            <p className="text-gray-400 text-sm">Budget Allocated</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{vp.budgetUtilization.toFixed(1)}%</p>
            <p className="text-gray-400 text-sm">Budget Utilization</p>
          </div>
        </motion.div>
      </div>

      {/* Budget Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Budget Overview</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-xl font-bold text-green-400">{formatCurrency(vp.budgetAllocated)}</p>
            <p className="text-gray-400 text-sm">Allocated</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-400">{formatCurrency(vp.budgetSpent)}</p>
            <p className="text-gray-400 text-sm">Spent</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-400">{formatCurrency(vp.budgetAllocated - vp.budgetSpent)}</p>
            <p className="text-gray-400 text-sm">Remaining</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${vp.budgetUtilization}%` }}
              transition={{ delay: 0.8, duration: 1 }}
              className={`h-3 rounded-full ${
                vp.budgetUtilization > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                vp.budgetUtilization > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                'bg-gradient-to-r from-green-400 to-emerald-500'
              } shadow-lg`}
            />
          </div>
        </div>
      </motion.div>

      {/* Projects Overview - Show detailed project information */}
      {vp.projects && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Active Projects</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vp.projects.map((project: any, index: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{project.name}</h4>
                    <p className="text-gray-400 text-sm">{project.description}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.priority === 'Critical' ? 'bg-red-800 text-red-200' :
                    project.priority === 'High' ? 'bg-orange-800 text-orange-200' :
                    'bg-blue-800 text-blue-200'
                  }`}>
                    {project.priority}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-white font-semibold">{project.progress}%</p>
                    <p className="text-gray-400 text-xs">Progress</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{project.teamLead}</p>
                    <p className="text-gray-400 text-xs">Team Lead</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Budget Progress</span>
                    <span className="text-white font-semibold">{formatCurrency(project.budgetSpent)} / {formatCurrency(project.budgetAllocated)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(project.budgetSpent / project.budgetAllocated) * 100}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 shadow-lg"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  <p>Start: {new Date(project.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(project.endDate).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Team Members with Project Allocations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Team Members & Project Allocations</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Status</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vp.teamMembers.map((member: any, index: number) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 group cursor-pointer"
              onClick={() => onMemberClick(member)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                    <p className="text-gray-500 text-xs">{member.location} • {member.experience}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{member.performance.toFixed(1)}%</p>
                  <p className="text-gray-400 text-xs">Performance</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-400 text-xs mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {member.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white font-semibold">{formatCurrency(member.budgetAllocated)}</p>
                  <p className="text-gray-400 text-xs">Budget Allocated</p>
                </div>
                <div>
                  <p className="text-white font-semibold">{member.currentProjects.length}</p>
                  <p className="text-gray-400 text-xs">Active Projects</p>
                </div>
              </div>

              {/* Project Allocations with Percentages */}
              <div className="mt-3">
                <p className="text-gray-400 text-xs mb-2">Project Allocations:</p>
                {member.projectAllocations ? (
                  <div className="space-y-2">
                    {member.projectAllocations.map((allocation: any) => (
                      <div key={allocation.projectId} className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-xs font-medium truncate">{allocation.projectName}</span>
                          <span className="text-green-400 text-xs font-bold">{allocation.allocation}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">{allocation.role}</span>
                          <div className="w-16 bg-gray-700 rounded-full h-1">
                            <div 
                              className="h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                              style={{ width: `${allocation.allocation}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Show total allocation */}
                    <div className="pt-1 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">Total Allocation:</span>
                        <span className="text-white text-xs font-semibold">
                          {member.projectAllocations.reduce((sum: number, alloc: any) => sum + alloc.allocation, 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {member.currentProjects.slice(0, 2).map((project: string) => (
                      <div key={project} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 text-xs truncate">{project}</span>
                      </div>
                    ))}
                    {member.currentProjects.length > 2 && (
                      <p className="text-gray-500 text-xs">+{member.currentProjects.length - 2} more</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Member Detail View Component
function MemberDetailView({ member, onBack }: { member: any; onBack: () => void }) {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-300" />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{member.name}</h2>
            <p className="text-gray-400">{member.role} • {member.location}</p>
          </div>
        </div>
      </motion.div>

      {/* Member KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{member.performance.toFixed(1)}%</p>
            <p className="text-gray-400 text-sm">Performance</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{member.currentProjects.length}</p>
            <p className="text-gray-400 text-sm">Active Projects</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{member.experience}</p>
            <p className="text-gray-400 text-sm">Experience</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{member.skills.length}</p>
            <p className="text-gray-400 text-sm">Skills</p>
          </div>
        </motion.div>
      </div>

      {/* Budget Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Budget Allocation</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-xl font-bold text-green-400">{formatCurrency(member.budgetAllocated)}</p>
            <p className="text-gray-400 text-sm">Allocated</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-400">{formatCurrency(member.budgetSpent)}</p>
            <p className="text-gray-400 text-sm">Spent</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-400">{formatCurrency(member.budgetAllocated - member.budgetSpent)}</p>
            <p className="text-gray-400 text-sm">Remaining</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(member.budgetSpent / member.budgetAllocated) * 100}%` }}
              transition={{ delay: 0.8, duration: 1 }}
              className={`h-3 rounded-full ${
                (member.budgetSpent / member.budgetAllocated) * 100 > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                (member.budgetSpent / member.budgetAllocated) * 100 > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                'bg-gradient-to-r from-green-400 to-emerald-500'
              } shadow-lg`}
            />
          </div>
        </div>
      </motion.div>

      {/* Skills & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Skills & Expertise</h3>
          <div className="space-y-3">
            {member.skills.map((skill: string, index: number) => (
              <div key={skill} className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-white font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Current Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Current Projects</h3>
          <div className="space-y-3">
            {member.currentProjects.map((project: string, index: number) => (
              <div key={project} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-white font-medium text-sm">{project}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 mt-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Overall Performance</span>
              <span className="text-white font-semibold">{member.performance.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${member.performance}%` }}
                transition={{ delay: 1, duration: 1 }}
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Budget Efficiency</span>
              <span className="text-white font-semibold">{((member.budgetSpent / member.budgetAllocated) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(member.budgetSpent / member.budgetAllocated) * 100}%` }}
                transition={{ delay: 1.2, duration: 1 }}
                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 shadow-lg"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Enhanced VP Overview Card Component
function EnhancedVPOverviewCard({ vpData, onVPClick }: { vpData: any[]; onVPClick: (vp: any) => void }) {
  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">VP Performance Dashboard</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 h-[calc(100%-80px)] overflow-y-auto">
        {vpData.map((vp, index) => (
          <motion.div
            key={vp.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 group cursor-pointer transform hover:scale-[1.02]"
            onClick={() => onVPClick(vp)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${vp.color} rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{vp.avatar}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{vp.name}</h4>
                  <p className="text-gray-400 text-sm">{vp.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-gray-500 text-xs">{vp.topProject}</span>
                    <span className="text-green-400 text-xs">({vp.topProjectProgress}%)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded-full text-xs font-medium mb-1 ${
                  vp.status === 'excellent' ? 'bg-green-800 text-green-200' :
                  vp.status === 'good' ? 'bg-blue-800 text-blue-200' :
                  'bg-yellow-800 text-yellow-200'
                }`}>
                  {vp.status === 'excellent' ? 'Excellent' :
                   vp.status === 'good' ? 'Good' : 'Needs Attention'}
                </div>
                <div className="flex items-center space-x-1">
                  {vp.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-3 w-3 text-green-400" />
                  ) : vp.trend === 'down' ? (
                    <ArrowTrendingDownIcon className="h-3 w-3 text-red-400" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-400">{vp.trend}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 text-sm mb-3">
              <div className="text-center">
                <p className="text-white font-semibold">{vp.teamSize}</p>
                <p className="text-gray-400 text-xs">Team</p>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{vp.activeProjects}</p>
                <p className="text-gray-400 text-xs">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{vp.budgetUtilization.toFixed(1)}%</p>
                <p className="text-gray-400 text-xs">Budget</p>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{vp.performanceScore.toFixed(1)}%</p>
                <p className="text-gray-400 text-xs">Performance</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {vp.criticalProjects > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                    {vp.criticalProjects} Critical
                  </span>
                )}
                {vp.projectsAtRisk > 0 && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                    {vp.projectsAtRisk} At Risk
                  </span>
                )}
              </div>
              <span className="text-gray-500 group-hover:text-green-400 transition-colors">
                Click to drill down →
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Executive Insights Card Component with Interactive Features
function ExecutiveInsightsCard({ vpData }: { vpData: any[] }) {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const needsAttention = vpData.filter(vp => vp.status === 'needs-attention');
  const criticalProjects = vpData.reduce((sum, vp) => sum + vp.criticalProjects, 0);
  const projectsAtRisk = vpData.reduce((sum, vp) => sum + vp.projectsAtRisk, 0);
  const topPerformers = vpData.filter(vp => vp.performanceScore > 90).slice(0, 3);
  const totalBudget = vpData.reduce((sum, vp) => sum + vp.budgetAllocated, 0);
  const avgUtilization = vpData.reduce((sum, vp) => sum + vp.budgetUtilization, 0) / vpData.length;

  // Real-time insights with priority scoring
  const insights = [
    {
      id: 'attention',
      title: 'Requires Attention',
      icon: ExclamationTriangleIcon,
      color: 'yellow',
      priority: 'high',
      count: needsAttention.length,
      items: needsAttention,
      actionable: true,
      description: 'VPs requiring immediate executive intervention'
    },
    {
      id: 'critical',
      title: 'Critical Projects',
      icon: ClockIcon,
      color: 'red',
      priority: 'critical',
      count: criticalProjects,
      items: vpData.filter(vp => vp.criticalProjects > 0),
      actionable: true,
      description: 'High-priority projects requiring executive oversight'
    },
    {
      id: 'risk',
      title: 'Projects at Risk',
      icon: ExclamationTriangleIcon,
      color: 'orange',
      priority: 'medium',
      count: projectsAtRisk,
      items: vpData.filter(vp => vp.projectsAtRisk > 0),
      actionable: true,
      description: 'Projects showing risk indicators'
    },
    {
      id: 'performers',
      title: 'Top Performers',
      icon: CheckCircleIcon,
      color: 'green',
      priority: 'positive',
      count: topPerformers.length,
      items: topPerformers,
      actionable: false,
      description: 'Exceptional performance recognition'
    },
    {
      id: 'budget',
      title: 'Budget Overview',
      icon: CurrencyDollarIcon,
      color: 'blue',
      priority: 'info',
      count: Math.round(avgUtilization),
      items: [],
      actionable: true,
      description: 'Financial performance summary'
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleTakeAction = (insightId: string) => {
    // Simulate taking action
    console.log(`Taking action for insight: ${insightId}`);
    setShowActions(true);
    setTimeout(() => setShowActions(false), 2000);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      red: 'bg-red-500/10 border-red-500/20 text-red-400',
      orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      green: 'bg-green-500/10 border-green-500/20 text-green-400',
      blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">Executive Insights</h3>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs">AI-Powered</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 disabled:opacity-50"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
            >
              <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400" />
            </motion.div>
          </button>
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
      </div>

      <div className="space-y-3 h-[calc(100%-80px)] overflow-y-auto">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${getColorClasses(insight.color)} ${
              selectedInsight === insight.id ? 'ring-2 ring-white/20 scale-[1.02]' : ''
            }`}
            onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <insight.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{insight.title}</span>
                {insight.priority === 'critical' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">{insight.count}</span>
                {insight.actionable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTakeAction(insight.id);
                    }}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-all duration-300"
                  >
                    Action
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-2">{insight.description}</p>

            {/* Expandable Details */}
            <motion.div
              initial={false}
              animate={{ height: selectedInsight === insight.id ? 'auto' : 0, opacity: selectedInsight === insight.id ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {selectedInsight === insight.id && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  {insight.id === 'attention' && needsAttention.map(vp => (
                    <div key={vp.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">{vp.avatar}</span>
                        </div>
                        <span className="text-white text-xs">{vp.name}</span>
                      </div>
                      <span className="text-yellow-400 text-xs font-semibold">{vp.budgetUtilization.toFixed(1)}%</span>
                    </div>
                  ))}

                  {insight.id === 'critical' && vpData.filter(vp => vp.criticalProjects > 0).map(vp => (
                    <div key={vp.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">{vp.avatar}</span>
                        </div>
                        <span className="text-white text-xs">{vp.name}</span>
                      </div>
                      <span className="text-red-400 text-xs font-semibold">{vp.criticalProjects} critical</span>
                    </div>
                  ))}

                  {insight.id === 'risk' && vpData.filter(vp => vp.projectsAtRisk > 0).map(vp => (
                    <div key={vp.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">{vp.avatar}</span>
                        </div>
                        <span className="text-white text-xs">{vp.name}</span>
                      </div>
                      <span className="text-orange-400 text-xs font-semibold">{vp.projectsAtRisk} at risk</span>
                    </div>
                  ))}

                  {insight.id === 'performers' && topPerformers.map(vp => (
                    <div key={vp.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">{vp.avatar}</span>
                        </div>
                        <span className="text-white text-xs">{vp.name}</span>
                      </div>
                      <span className="text-green-400 text-xs font-semibold">{vp.performanceScore.toFixed(1)}%</span>
                    </div>
                  ))}

                  {insight.id === 'budget' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-xs">Total Allocated</span>
                        <span className="text-blue-400 text-xs font-semibold">{formatCurrency(totalBudget)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-xs">Average Utilization</span>
                        <span className="text-blue-400 text-xs font-semibold">{avgUtilization.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-xs">Budget Efficiency</span>
                        <span className={`text-xs font-semibold ${avgUtilization > 85 ? 'text-green-400' : avgUtilization > 75 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {avgUtilization > 85 ? 'Excellent' : avgUtilization > 75 ? 'Good' : 'Needs Attention'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Expandable Sections */}
                  {insight.actionable && selectedInsight === insight.id && (
                    <div className="flex items-center space-x-2 pt-2">
                      <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs rounded-lg transition-all duration-300">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs rounded-lg transition-all duration-300">
                        Take Action
                      </button>
                      {insight.priority === 'critical' && (
                        <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg transition-all duration-300">
                          Escalate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}

        {/* Action Confirmation */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Action Initiated</span>
            </div>
            <p className="text-gray-300 text-xs mt-1">Executive action has been logged and relevant teams notified.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Project Portfolio Summary Component
function ProjectPortfolioSummary({ vpData }: { vpData: any[] }) {
  const totalProjects = vpData.reduce((sum, vp) => sum + vp.activeProjects, 0);
  const criticalProjects = vpData.reduce((sum, vp) => sum + vp.criticalProjects, 0);
  const projectsAtRisk = vpData.reduce((sum, vp) => sum + vp.projectsAtRisk, 0);

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Project Portfolio</h3>
        <ChartBarIcon className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-6 h-[calc(100%-80px)] overflow-y-auto">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-2xl font-bold text-white">{totalProjects}</p>
            <p className="text-gray-400 text-xs">Total Projects</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-2xl font-bold text-red-400">{criticalProjects}</p>
            <p className="text-gray-400 text-xs">Critical</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
          >
            <p className="text-2xl font-bold text-yellow-400">{projectsAtRisk}</p>
            <p className="text-gray-400 text-xs">At Risk</p>
          </motion.div>
        </div>

        {/* Top Projects by VP */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Key Projects by Department</h4>
          {vpData.slice(0, 4).map((vp, index) => (
            <motion.div
              key={vp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{vp.avatar}</span>
                  </div>
                  <span className="text-white text-sm font-medium">{vp.name}</span>
                </div>
                <span className="text-gray-400 text-xs">{vp.activeProjects} projects</span>
              </div>
              <div className="text-xs text-gray-300">
                <p className="truncate">Top: {vp.topProject}</p>
                <div className="flex items-center justify-between mt-1">
                  <span>Progress: {vp.topProjectProgress}%</span>
                  <div className="w-16 bg-gray-700 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                      style={{ width: `${vp.topProjectProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Performance Trends Card Component
function PerformanceTrendsCard({ vpData }: { vpData: any[] }) {
  const avgPerformance = vpData.reduce((sum, vp) => sum + vp.performanceScore, 0) / vpData.length;
  const avgBudgetUtilization = vpData.reduce((sum, vp) => sum + vp.budgetUtilization, 0) / vpData.length;

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
        <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
      </div>

      <div className="space-y-6 h-[calc(100%-80px)] overflow-y-auto">
        {/* Overall Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{avgPerformance.toFixed(1)}%</p>
              <p className="text-gray-400 text-xs">Avg Performance</p>
              <div className="flex items-center justify-center mt-1">
                <ArrowTrendingUpIcon className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400 text-xs">+2.3%</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{avgBudgetUtilization.toFixed(1)}%</p>
              <p className="text-gray-400 text-xs">Avg Budget Use</p>
              <div className="flex items-center justify-center mt-1">
                <ArrowTrendingUpIcon className="h-3 w-3 text-blue-400 mr-1" />
                <span className="text-blue-400 text-xs">+1.8%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Department Performance Ranking */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Department Performance Ranking</h4>
          {vpData
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .map((vp, index) => (
              <motion.div
                key={vp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className={`w-6 h-6 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{vp.avatar}</span>
                  </div>
                  <span className="text-white text-sm">{vp.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-sm">{vp.performanceScore.toFixed(1)}%</span>
                  {vp.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-3 w-3 text-green-400" />
                  ) : vp.trend === 'down' ? (
                    <ArrowTrendingDownIcon className="h-3 w-3 text-red-400" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                </div>
              </motion.div>
            ))}
        </div>

        {/* Budget Efficiency Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Budget Efficiency</h4>
          {vpData.map((vp, index) => (
            <motion.div
              key={vp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{vp.name}</span>
                <span className="text-white font-semibold">{vp.budgetUtilization.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${vp.budgetUtilization}%` }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
                  className={`h-1 rounded-full ${
                    vp.budgetUtilization > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                    vp.budgetUtilization > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-green-400 to-emerald-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Project View Components
function ProjectDetailView({ project, onBack }: { project: any; onBack: () => void }) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'deliverables' | 'team' | 'timeline' | 'risks'>('overview');

  return (
    <div className="h-full p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-300" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <p className="text-gray-400">{project.description}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mb-6">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'deliverables', name: 'Deliverables', icon: '📋' },
            { id: 'team', name: 'Team', icon: '👥' },
            { id: 'timeline', name: 'Timeline', icon: '📅' },
            { id: 'risks', name: 'Risks', icon: '⚠️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'On Track' ? 'bg-green-800 text-green-200' :
                    project.status === 'At Risk' ? 'bg-yellow-800 text-yellow-200' :
                    project.status === 'Delayed' ? 'bg-red-800 text-red-200' :
                    'bg-blue-800 text-blue-200'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Priority</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.priority === 'Critical' ? 'bg-red-800 text-red-200' :
                    project.priority === 'High' ? 'bg-orange-800 text-orange-200' :
                    'bg-blue-800 text-blue-200'
                  }`}>
                    {project.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Budget Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Allocated</span>
                  <span className="text-white font-semibold">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Spent</span>
                  <span className="text-white font-semibold">{formatCurrency(project.spent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Remaining</span>
                  <span className="text-white font-semibold">{formatCurrency(project.budget - project.spent)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"
                    style={{ width: `${(project.spent / project.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'deliverables' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project Deliverables</h3>
            <div className="space-y-3">
              {project.deliverables.map((deliverable: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{deliverable.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deliverable.status === 'Completed' ? 'bg-green-800 text-green-200' :
                      deliverable.status === 'In Progress' ? 'bg-blue-800 text-blue-200' :
                      deliverable.status === 'At Risk' ? 'bg-yellow-800 text-yellow-200' :
                      'bg-gray-800 text-gray-200'
                    }`}>
                      {deliverable.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">Due: {deliverable.dueDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'timeline' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project Timeline</h3>
            <div className="space-y-4">
              {project.milestones.map((milestone: any, index: number) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    milestone.status === 'Completed' ? 'bg-green-500' :
                    milestone.status === 'In Progress' ? 'bg-blue-500' :
                    milestone.status === 'At Risk' ? 'bg-yellow-500' :
                    milestone.status === 'Delayed' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{milestone.name}</span>
                      <span className="text-gray-400 text-sm">{milestone.date}</span>
                    </div>
                    <span className={`text-xs ${
                      milestone.status === 'Completed' ? 'text-green-400' :
                      milestone.status === 'In Progress' ? 'text-blue-400' :
                      milestone.status === 'At Risk' ? 'text-yellow-400' :
                      milestone.status === 'Delayed' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {milestone.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'risks' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
            <div className="space-y-3">
              {project.risks.map((risk: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-white font-medium">{risk.description}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      risk.impact === 'High' ? 'bg-red-800 text-red-200' :
                      risk.impact === 'Medium' ? 'bg-yellow-800 text-yellow-200' :
                      'bg-green-800 text-green-200'
                    }`}>
                      {risk.impact} Impact
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectOverviewView({ projects, onProjectClick }: { projects: any[]; onProjectClick: (project: any) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 h-full overflow-y-auto">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300 cursor-pointer group"
          onClick={() => onProjectClick(project)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">{project.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.priority === 'Critical' ? 'bg-red-800 text-red-200' :
              project.priority === 'High' ? 'bg-orange-800 text-orange-200' :
              'bg-blue-800 text-blue-200'
            }`}>
              {project.priority}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Progress</span>
              <span className="text-white font-semibold">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Budget</span>
              <span className="text-white font-semibold">{formatCurrency(project.spent)} / {formatCurrency(project.budget)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'On Track' ? 'bg-green-800 text-green-200' :
                project.status === 'At Risk' ? 'bg-yellow-800 text-yellow-200' :
                project.status === 'Delayed' ? 'bg-red-800 text-red-200' :
                'bg-blue-800 text-blue-200'
              }`}>
                {project.status}
              </span>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Team Lead</span>
                <span className="text-white">{project.teamLead}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-400">Due Date</span>
                <span className="text-white">{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProjectKanbanView({ projects, onProjectClick }: { projects: any[]; onProjectClick: (project: any) => void }) {
  const columns = [
    { id: 'On Track', title: 'On Track', color: 'green' },
    { id: 'At Risk', title: 'At Risk', color: 'yellow' },
    { id: 'Delayed', title: 'Delayed', color: 'red' },
    { id: 'Completed', title: 'Completed', color: 'blue' }
  ];

  return (
    <div className="grid grid-cols-4 gap-6 h-full">
      {columns.map((column) => (
        <div key={column.id} className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-3 h-3 rounded-full bg-${column.color}-500`}></div>
            <h3 className="text-white font-semibold">{column.title}</h3>
            <span className="text-gray-400 text-sm">
              ({projects.filter(p => p.status === column.id).length})
            </span>
          </div>
          
          <div className="space-y-3 max-h-[calc(100%-60px)] overflow-y-auto">
            {projects
              .filter(project => project.status === column.id)
              .map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer"
                  onClick={() => onProjectClick(project)}
                >
                  <h4 className="text-white font-medium text-sm mb-2">{project.name}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className="h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Team Lead</span>
                      <span className="text-white">{project.teamLead}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectTimelineView({ projects, onProjectClick }: { projects: any[]; onProjectClick: (project: any) => void }) {
  const sortedProjects = [...projects].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {sortedProjects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-green-500/30 transition-all duration-300 cursor-pointer"
          onClick={() => onProjectClick(project)}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">{project.name}</h3>
              <p className="text-gray-400 text-sm">{project.department} • {project.teamLead}</p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                project.status === 'On Track' ? 'bg-green-800 text-green-200' :
                project.status === 'At Risk' ? 'bg-yellow-800 text-yellow-200' :
                project.status === 'Delayed' ? 'bg-red-800 text-red-200' :
                'bg-blue-800 text-blue-200'
              }`}>
                {project.status}
              </div>
              <p className="text-gray-400 text-sm">Due: {new Date(project.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-white font-semibold text-lg">{project.progress}%</p>
              <p className="text-gray-400 text-sm">Progress</p>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">{formatCurrency(project.spent)}</p>
              <p className="text-gray-400 text-sm">Spent</p>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">{project.teamSize}</p>
              <p className="text-gray-400 text-sm">Team Size</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Timeline Progress</span>
              <span className="text-white">{Math.round((new Date().getTime() - new Date(project.startDate).getTime()) / (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"
                style={{ width: `${Math.round((new Date().getTime() - new Date(project.startDate).getTime()) / (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) * 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProjectAnalyticsView({ projects }: { projects: any[] }) {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;

  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityCounts = projects.reduce((acc, project) => {
    acc[project.priority] = (acc[project.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto">
      {/* Portfolio Overview */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Portfolio Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-white/5">
            <p className="text-2xl font-bold text-white">{projects.length}</p>
            <p className="text-gray-400 text-sm">Total Projects</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <p className="text-2xl font-bold text-green-400">{avgProgress.toFixed(1)}%</p>
            <p className="text-gray-400 text-sm">Avg Progress</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalBudget)}</p>
            <p className="text-gray-400 text-sm">Total Budget</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalSpent)}</p>
            <p className="text-gray-400 text-sm">Total Spent</p>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
        <div className="space-y-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'On Track' ? 'bg-green-500' :
                  status === 'At Risk' ? 'bg-yellow-500' :
                  status === 'Delayed' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></div>
                <span className="text-white">{status}</span>
              </div>
              <span className="text-gray-400">{String(count)} projects</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
        <div className="space-y-3">
          {Object.entries(priorityCounts).map(([priority, count]) => (
            <div key={priority} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  priority === 'Critical' ? 'bg-red-500' :
                  priority === 'High' ? 'bg-orange-500' :
                  priority === 'Medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <span className="text-white">{priority}</span>
              </div>
              <span className="text-gray-400">{String(count)} projects</span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Analysis */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Budget Analysis</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Budget Utilization</span>
            <span className="text-white font-semibold">{((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"
              style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-400 text-sm">Remaining Budget</p>
              <p className="text-white font-semibold">{formatCurrency(totalBudget - totalSpent)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Project Budget</p>
              <p className="text-white font-semibold">{formatCurrency(totalBudget / projects.length)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectChatView({ projects }: { projects: any[] }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello! I'm your AI Project Assistant. I can help you analyze your ${projects.length} active projects. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: generateAIResponse(inputMessage, projects),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInputMessage('');
  };

  const generateAIResponse = (input: string, projects: any[]) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('status') || lowerInput.includes('overview')) {
      const onTrack = projects.filter(p => p.status === 'On Track').length;
      const atRisk = projects.filter(p => p.status === 'At Risk').length;
      const delayed = projects.filter(p => p.status === 'Delayed').length;
      
      return `Here's your project status overview:
      
📊 **Project Status Summary:**
• ${onTrack} projects are On Track
• ${atRisk} projects are At Risk  
• ${delayed} projects are Delayed

The projects at risk are: ${projects.filter(p => p.status === 'At Risk').map(p => p.name).join(', ')}

Would you like me to dive deeper into any specific project?`;
    }
    
    if (lowerInput.includes('budget')) {
      const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
      const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
      const utilization = (totalSpent / totalBudget) * 100;
      
      return `💰 **Budget Analysis:**
      
• Total Allocated: ${formatCurrency(totalBudget)}
• Total Spent: ${formatCurrency(totalSpent)}
• Budget Utilization: ${utilization.toFixed(1)}%
• Remaining: ${formatCurrency(totalBudget - totalSpent)}

Would you like me to analyze specific project budgets?`;
    }
    
    if (lowerInput.includes('risk') || lowerInput.includes('delayed')) {
      const atRiskProjects = projects.filter(p => p.status === 'At Risk' || p.status === 'Delayed');
      
      return `⚠️ **Risk Analysis:**
      
Projects requiring attention:
${atRiskProjects.map(p => `• ${p.name} (${p.status}) - ${p.progress}% complete`).join('\n')}

These projects may need additional resources or timeline adjustments.`;
    }
    
    return `I can help you with:
    
📊 Project status and overview
💰 Budget analysis and utilization
⚠️ Risk assessment and delayed projects
📈 Performance metrics and trends
📋 Specific project details

What would you like to explore?`;
  };

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">AI Project Assistant</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">AI Powered</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-green-500/20 text-white border border-green-500/30'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'ai' && (
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about your projects..."
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function PersonalizedARIATicker({ svpData }: { svpData: SVPData }) {
  // Personalized messages for Vinod Kumar
  const personalizedMessages = [
    { icon: UserGroupIcon, text: `Good morning, ${svpData.user.name}! Your team of ${svpData.teamOverview.totalTeamSize} members is performing at ${svpData.teamOverview.performanceScore.toFixed(1)}% efficiency`, type: 'success' },
    { icon: ShieldCheckIcon, text: `Compliance Update: Your department maintains ${svpData.teamOverview.complianceRate.toFixed(1)}% regulatory compliance - excellent leadership!`, type: 'success' },
    { icon: CurrencyDollarIcon, text: `Budget Alert: ${svpData.user.name}, your team's budget utilization is at ${svpData.teamOverview.budgetUtilization.toFixed(1)}% - within optimal range`, type: 'info' },
    { icon: ArrowTrendingUpIcon, text: `Team Performance: Sarah Chen's Regulatory Affairs team showing excellent performance at 94.5% - great mentoring!`, type: 'success' },
    { icon: ExclamationTriangleIcon, text: `Action Required: Priya Patel's Internal Audit team needs attention - budget utilization at 91.2%`, type: 'warning' },
    { icon: CheckCircleIcon, text: `Project Success: Q1 Regulatory Compliance Audit is 75% complete and on track - well managed, ${svpData.user.name}!`, type: 'success' },
    { icon: ClockIcon, text: `Deadline Alert: AML System Enhancement requires your review - assigned to Carlos Rodriguez`, type: 'warning' },
    { icon: ArrowTrendingUpIcon, text: `Leadership Insight: Your ${svpData.teamOverview.directReports} VPs are delivering ${svpData.teamOverview.activeProjects} active projects successfully`, type: 'info' },
    { icon: ShieldCheckIcon, text: `Regulatory Excellence: ${svpData.user.name}, your Compliance & Risk division leads the organization in regulatory standards`, type: 'success' },
    { icon: UserGroupIcon, text: `Team Development: David Kim and Maria Gonzalez showing excellent performance - your leadership development is working!`, type: 'success' }
  ];

  // Create continuous stream with unique keys
  const continuousStream: ReactNode[] = personalizedMessages.map((msg, index) => {
    const IconComponent = msg.icon;
    return (
      <div key={`msg-${index}`} className={`flex items-center space-x-3 mx-12 ${
        msg.type === 'success' ? 'text-green-400' :
        msg.type === 'warning' ? 'text-yellow-400' :
        msg.type === 'critical' ? 'text-red-400' :
        'text-blue-400'
      }`}>
        <IconComponent className="h-4 w-4 flex-shrink-0" />
        <span className="text-white text-sm font-medium whitespace-nowrap">
          {msg.text}
        </span>
      </div>
    );
  });

  // Create second copy with different keys
  const continuousStreamCopy: ReactNode[] = personalizedMessages.map((msg, index) => {
    const IconComponent = msg.icon;
    return (
      <div key={`msg-copy-${index}`} className={`flex items-center space-x-3 mx-12 ${
        msg.type === 'success' ? 'text-green-400' :
        msg.type === 'warning' ? 'text-yellow-400' :
        msg.type === 'critical' ? 'text-red-400' :
        'text-blue-400'
      }`}>
        <IconComponent className="h-4 w-4 flex-shrink-0" />
        <span className="text-white text-sm font-medium whitespace-nowrap">
          {msg.text}
        </span>
      </div>
    );
  });

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-green-900 to-gray-900 border-b border-green-500/20 backdrop-blur-xl">
      <div className="flex items-center h-10 overflow-hidden">
        {/* ARIA Branding */}
        <div className="flex items-center space-x-2 px-4 flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 z-20">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">AI</span>
          </div>
          <span className="text-white font-semibold text-xs">ARIA</span>
        </div>

        {/* Continuous Scrolling Ticker - Personalized for SVP */}
        <div className="flex-1 relative overflow-hidden">
          <motion.div
            animate={{ x: [0, '-100%'] }}
            transition={{ 
              duration: 80, 
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop'
            }}
            className="flex items-center whitespace-nowrap"
            style={{ width: '200%' }}
          >
            {/* First copy of all messages */}
            {continuousStream}
            {/* Second copy for seamless loop */}
            {continuousStreamCopy}
          </motion.div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center space-x-2 px-4 flex-shrink-0 z-20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-medium">LIVE</span>
        </div>
      </div>
    </div>
  );
}
