'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Toaster } from 'react-hot-toast'
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CogIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

// Import components
import BudgetSection from '../components/BudgetSection'
import BudgetAnalytics from '../components/BudgetAnalytics'
import ProjectsSection from '../components/ProjectsSection'
import ProjectsAnalytics from '../components/ProjectsAnalytics'
import ActivitiesSection from '../components/ActivitiesSection'
import RiskSection from '../components/RiskSection'
import RiskAnalytics from '../components/RiskAnalytics'
import ComplianceSection from '../components/ComplianceSection'
import ComplianceAnalytics from '../components/ComplianceAnalytics'
import ChatbotSection from '../components/ChatbotSection'
import ARIATicker from '../components/ARIATicker'
import SanctionsTicker from '../components/SanctionsTicker'
import ConnectionDropdown from '../components/ConnectionDropdown'
import NotificationDropdown from '../components/NotificationDropdown'
import SettingsDropdown from '../components/SettingsDropdown'

// Import pages
import ConnectedDataPage from './connected-data/page'
import AIAnalyticsPage from './ai-analytics/page'

export default function Dashboard() {
  const { socket, connected } = useSocket()
  const router = useRouter()
  const [rawData, setRawData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentExecutive, setCurrentExecutive] = useState<any>(null)

  useEffect(() => {
    const executiveData = localStorage.getItem('currentExecutive')
    if (!executiveData) {
      router.push('/login')
      return
    }
    
    const executive = JSON.parse(executiveData)
    setCurrentExecutive(executive)
    
    loadRawData()
    if (connected && socket) {
      socket.emit('join-dashboard', executive.id)
    }
  }, [connected, socket, router])

  const loadRawData = async () => {
    try {
      setLoading(true)
      
      // Just fetch the raw data without any complex processing
      const [budgetRes, svpRes, projectsRes, activitiesRes, complianceRes, risksRes] = await Promise.all([
        fetch('https://banking.scnfinc.com/api/budget/overview').catch(() => ({ ok: false })),
        fetch('https://banking.scnfinc.com/api/budget/by-svp').catch(() => ({ ok: false })),
        fetch('https://banking.scnfinc.com/api/projects').catch(() => ({ ok: false })),
        fetch('https://banking.scnfinc.com/api/activities').catch(() => ({ ok: false })),
        fetch('https://banking.scnfinc.com/api/compliance').catch(() => ({ ok: false })),
        fetch('https://banking.scnfinc.com/api/risk').catch(() => ({ ok: false }))
      ])

      const rawData = {
        budget: budgetRes.ok ? await budgetRes.json().catch(() => null) : null,
        svp: svpRes.ok ? await svpRes.json().catch(() => []) : [],
        projects: projectsRes.ok ? await projectsRes.json().catch(() => []) : [],
        activities: activitiesRes.ok ? await activitiesRes.json().catch(() => []) : [],
        compliance: complianceRes.ok ? await complianceRes.json().catch(() => null) : null,
        risks: risksRes.ok ? await risksRes.json().catch(() => []) : []
      }
      
      setRawData(rawData)
    } catch (error) {
      console.error('Error loading data:', error)
      setRawData({})
    } finally {
      setLoading(false)
    }
  }

  const navigation = [
    { id: 'overview', name: 'Overview', icon: HomeIcon },
    { id: 'budget', name: 'Budget', icon: CurrencyDollarIcon },
    { id: 'projects', name: 'Projects', icon: ChartBarIcon },
    { id: 'compliance', name: 'Compliance', icon: ShieldCheckIcon },
    { id: 'risks', name: 'Risks', icon: ExclamationTriangleIcon },
    { id: 'ai-analytics', name: 'AI Analytics', icon: EyeIcon },
    { id: 'connected-data', name: 'Connected Data', icon: CogIcon },
    { id: 'components', name: 'Components', icon: UserGroupIcon },
  ]

  if (loading) {
    return <LoadingScreen />
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

      <Header connected={connected} />
      <ARIATicker />
      <SanctionsTicker />

      <div className="flex h-[calc(100vh-140px)]">
        <Sidebar 
          navigation={navigation}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 relative" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="h-full p-1 pb-16">
            {selectedView === 'overview' && <SimpleOverview rawData={rawData} />}
            {selectedView === 'budget' && <BudgetDashboard />}
            {selectedView === 'projects' && <ProjectsDashboard />}
            {selectedView === 'compliance' && <ComplianceDashboard />}
            {selectedView === 'risks' && <RisksDashboard />}
            {selectedView === 'ai-analytics' && <AIAnalyticsPage />}
            {selectedView === 'connected-data' && <ConnectedDataPage />}
            {selectedView === 'components' && <ComponentsDashboard />}
          </div>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

function SimpleOverview({ rawData }: { rawData: any }) {
  return (
    <div className="h-full grid grid-cols-12 grid-rows-8 gap-2 p-2">
      <div className="col-span-12 row-span-2">
        <SimpleKPICards rawData={rawData} />
      </div>
      <div className="col-span-6 row-span-6">
        <SimpleActivityFeed rawData={rawData} />
      </div>
      <div className="col-span-6 row-span-3">
        <SimpleBudgetOverview rawData={rawData} />
      </div>
      <div className="col-span-6 row-span-3">
        <SimpleSVPPerformance rawData={rawData} />
      </div>
    </div>
  )
}

function SimpleKPICards({ rawData }: { rawData: any }) {
  const budget = rawData.budget || {};
  const projects = Array.isArray(rawData.projects) ? rawData.projects : [];
  const risks = Array.isArray(rawData.risks) ? rawData.risks : [];
  
  const kpis = [
    {
      title: 'Total Budget',
      value: formatCurrency(budget.total_allocated || 0),
      subtitle: `${formatCurrency(budget.total_spent || 0)} spent`,
      progress: budget.avg_utilization || 0,
      icon: CurrencyDollarIcon,
      color: 'from-green-400 to-emerald-600',
      change: '+12%'
    },
    {
      title: 'Active Projects',
      value: projects.length,
      subtitle: `${projects.filter(p => p.Status === 'In Progress' || p.status === 'In Progress').length} in progress`,
      progress: 75,
      icon: ChartBarIcon,
      color: 'from-blue-400 to-cyan-600',
      change: '+5%'
    },
    {
      title: 'Compliance Rate',
      value: '94%',
      subtitle: 'Regulatory standards',
      progress: 94,
      icon: ShieldCheckIcon,
      color: 'from-purple-400 to-pink-600',
      change: '+2%'
    },
    {
      title: 'Critical Risks',
      value: risks.filter(r => r.risk_level === 'High' || r['Risk Level'] === 'High').length,
      subtitle: 'High priority items',
      progress: 15,
      icon: ExclamationTriangleIcon,
      color: 'from-red-400 to-orange-600',
      change: '-8%'
    }
  ]

  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-cyan-500/30 transition-all duration-300 group relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-white/10">
                  <kpi.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-semibold ${kpi.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {kpi.change}
                </span>
                {kpi.change.startsWith('+') ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 inline ml-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-400 inline ml-1" />
                )}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-1">{kpi.value}</h3>
            <p className="text-gray-400 text-sm mb-3">{kpi.title}</p>
            <p className="text-gray-500 text-xs mb-4">{kpi.subtitle}</p>
            
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${kpi.progress}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                className={`h-2 rounded-full bg-gradient-to-r ${kpi.color} shadow-lg`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function SimpleBudgetOverview({ rawData }: { rawData: any }) {
  const budget = rawData.budget || {};
  
  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-cyan-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Budget Overview</h3>
        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
      </div>

      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-3">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#budgetGradient)"
              strokeWidth="2"
              strokeDasharray={`${budget.avg_utilization || 0}, 100`}
            />
            <defs>
              <linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-lg font-bold text-white">
            {budget.avg_utilization?.toFixed(0) || 0}%
          </span>
        </div>
        <p className="text-gray-400 text-sm">Budget Utilization</p>
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{formatCurrency(budget.total_allocated || 0)}</div>
          <div className="text-sm text-gray-400">Total Allocated</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-cyan-400">{formatCurrency(budget.total_spent || 0)}</div>
          <div className="text-sm text-gray-400">Total Spent</div>
        </div>
      </div>
    </div>
  )
}

function SimpleSVPPerformance({ rawData }: { rawData: any }) {
  const svpData = Array.isArray(rawData.svp) ? rawData.svp.slice(0, 4) : [];
  
  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-cyan-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">SVP Performance</h3>
        <UserGroupIcon className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3 h-[calc(100%-60px)] overflow-y-auto">
        {svpData.map((svp, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-white font-medium text-sm truncate">{svp.svp_name}</h4>
                <p className="text-gray-400 text-xs truncate">{svp.department}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-cyan-400 font-semibold text-sm">{svp.utilization_rate?.toFixed(1)}%</p>
                <p className="text-gray-400 text-xs">Utilization</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SimpleActivityFeed({ rawData }: { rawData: any }) {
  const activities = Array.isArray(rawData.activities) ? rawData.activities.slice(0, 10) : [];
  
  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-cyan-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Live Activity Feed</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Live</span>
        </div>
      </div>

      <div className="space-y-3 h-[calc(100%-60px)] overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={activity.id || index}
            className="flex items-start space-x-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className={`w-3 h-3 rounded-full mt-1 ${
              activity.priority === 'High' ? 'bg-red-500' :
              activity.priority === 'Medium' ? 'bg-yellow-500' :
              'bg-green-500'
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
              <p className="text-xs text-gray-300 mb-1">{activity.title}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>{activity.user}</span>
                <span>•</span>
                <span>{activity.department}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Rest of the components remain the same...
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-cyan-500/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2 tracking-wider"
        >
          CITI LATAM
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-cyan-400 text-lg mb-4"
        >
          RegInsight Dashboard
        </motion.p>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400"
        >
          Initializing Executive Interface...
        </motion.p>
      </motion.div>
    </div>
  )
}

function Header({ connected }: { connected: boolean }) {
  const [currentExecutive, setCurrentExecutive] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const executiveData = localStorage.getItem('currentExecutive')
    if (executiveData) {
      setCurrentExecutive(JSON.parse(executiveData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('currentExecutive')
    router.push('/login')
  }

  if (!currentExecutive) {
    return null
  }

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 bg-black/20 backdrop-blur-xl border-b border-cyan-500/20 relative z-50"
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              LATAM RegInsight
            </h1>
            <p className="text-cyan-400 text-sm">Executive Dashboard • {currentExecutive.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <ConnectionDropdown connected={connected} />
          <NotificationDropdown notificationCount={3} />
          <SettingsDropdown userInfo={{
            name: currentExecutive.name,
            role: currentExecutive.title,
            avatar: currentExecutive.avatar
          }} />

          <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <div className={`w-8 h-8 bg-gradient-to-br ${currentExecutive.color} rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold text-sm">{currentExecutive.avatar}</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">{currentExecutive.name}</p>
              <p className="text-gray-400 text-xs">{currentExecutive.title}</p>
            </div>
          </div>

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
  )
}

function Sidebar({ navigation, selectedView, setSelectedView, collapsed, setCollapsed }: any) {
  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`${collapsed ? 'w-20' : 'w-72'} bg-black/20 backdrop-blur-xl border-r border-cyan-500/20 transition-all duration-300 relative z-40`}
    >
      <div className="p-6">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 mb-6"
        >
          {collapsed ? (
            <Bars3Icon className="h-5 w-5 text-gray-300" />
          ) : (
            <XMarkIcon className="h-5 w-5 text-gray-300" />
          )}
        </button>

        <nav className="space-y-2">
          {navigation.map((item: any) => (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id)}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group ${
                selectedView === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white shadow-lg shadow-cyan-500/10'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              <item.icon className="h-6 w-6 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </motion.aside>
  )
}

function BudgetDashboard() {
  const [activeTab, setActiveTab] = useState('basic')
  
  return (
    <div className="h-full p-4 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-2xl font-bold text-white">Budget Management</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'basic'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Basic View
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'analytics'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Advanced Analytics
          </button>
        </div>
      </motion.div>
      
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'basic' && <BudgetSection />}
        {activeTab === 'analytics' && <BudgetAnalytics />}
      </div>
    </div>
  )
}

function ProjectsDashboard() {
  const [activeTab, setActiveTab] = useState('basic')
  
  return (
    <div className="h-full p-4 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-2xl font-bold text-white">Project Management</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'basic'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Basic View
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'analytics'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Advanced Analytics
          </button>
        </div>
      </motion.div>
      
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'basic' && <ProjectsSection />}
        {activeTab === 'analytics' && <ProjectsAnalytics />}
      </div>
    </div>
  )
}

function ComplianceDashboard() {
 const [activeTab, setActiveTab] = useState('basic')
 
 return (
   <div className="h-full p-4 flex flex-col">
     <motion.div
       initial={{ opacity: 0, y: -20 }}
       animate={{ opacity: 1, y: 0 }}
       className="flex items-center justify-between mb-6"
     >
       <h2 className="text-2xl font-bold text-white">Compliance Management</h2>
       
       <div className="flex space-x-2">
         <button
           onClick={() => setActiveTab('basic')}
           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
             activeTab === 'basic'
               ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
               : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
           }`}
         >
           Basic View
         </button>
         <button
           onClick={() => setActiveTab('analytics')}
           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
             activeTab === 'analytics'
               ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
               : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
           }`}
         >
           Advanced Analytics
         </button>
       </div>
     </motion.div>
     
     <div className="flex-1 min-h-0 overflow-y-auto">
       {activeTab === 'basic' && <ComplianceSection />}
       {activeTab === 'analytics' && <ComplianceAnalytics />}
     </div>
   </div>
 )
}

function RisksDashboard() {
 const [activeTab, setActiveTab] = useState('basic')
 
 return (
   <div className="h-full p-4 flex flex-col">
     <motion.div
       initial={{ opacity: 0, y: -20 }}
       animate={{ opacity: 1, y: 0 }}
       className="flex items-center justify-between mb-6"
     >
       <h2 className="text-2xl font-bold text-white">Risk Management</h2>
       
       <div className="flex space-x-2">
         <button
           onClick={() => setActiveTab('basic')}
           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
             activeTab === 'basic'
               ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
               : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
           }`}
         >
           Basic View
         </button>
         <button
           onClick={() => setActiveTab('analytics')}
           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
             activeTab === 'analytics'
               ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
               : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
           }`}
         >
           Advanced Analytics
         </button>
       </div>
     </motion.div>
     
     <div className="flex-1 min-h-0 overflow-y-auto">
       {activeTab === 'basic' && <RiskSection />}
       {activeTab === 'analytics' && <RiskAnalytics />}
     </div>
   </div>
 )
}

function ComponentsDashboard() {
 return (
   <div className="h-full p-4 overflow-y-auto">
     <motion.h2 
       initial={{ opacity: 0, y: -20 }}
       animate={{ opacity: 1, y: 0 }}
       className="text-2xl font-bold text-white mb-6"
     >
       Dashboard Components
     </motion.h2>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div>
         <ActivitiesSection />
       </div>
       <div>
         <RiskSection />
       </div>
       <div>
         <ComplianceSection />
       </div>
       <div>
         <ChatbotSection />
       </div>
     </div>
   </div>
 )
}
