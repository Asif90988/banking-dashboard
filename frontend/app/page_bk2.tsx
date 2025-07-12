'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

interface DashboardData {
  budget: any
  projects: any[]
  compliance: any[]
  risks: any[]
  activities: any[]
  svpPerformance: any[]
}

export default function Dashboard() {
  const { socket, connected } = useSocket()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    loadAllData()
    if (connected && socket) {
      socket.emit('join-dashboard', 'alex-rodriguez')
    }
  }, [connected, socket])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const mockData = {
        budget: { total_allocated: 2500000, total_spent: 1875000, avg_utilization: 75 },
        projects: [
          { status: 'On Track', count: 12 },
          { status: 'At Risk', count: 3 },
          { status: 'Delayed', count: 1 },
          { status: 'Completed', count: 8 }
        ],
        compliance: [
          { status: 'Compliant', count: 85 },
          { status: 'Non-Compliant', count: 12 },
          { status: 'Under Review', count: 23 }
        ],
        risks: [
          { risk_level: 'High', count: 2 },
          { risk_level: 'Medium', count: 8 },
          { risk_level: 'Low', count: 15 }
        ],
        activities: [
          { id: 1, type: 'Budget Review', priority: 'High', description: 'Q4 budget reallocation approved', svp_name: 'Maria Rodriguez', project_name: 'Compliance Audit' },
          { id: 2, type: 'Risk Assessment', priority: 'Medium', description: 'New vendor risk evaluation completed', svp_name: 'Carlos Santos', project_name: 'KYC Enhancement' },
          { id: 3, type: 'Project Update', priority: 'Low', description: 'Monthly status report submitted', svp_name: 'Ana Gutierrez', project_name: 'AML Monitoring' }
        ],
        svpPerformance: [
          { id: 1, name: 'Maria Rodriguez', department: 'Risk Management', utilization_percentage: 92, total_projects: 15, completed_projects: 12, on_track_projects: 2, at_risk_projects: 1, delayed_projects: 0 },
          { id: 2, name: 'Carlos Santos', department: 'Compliance', utilization_percentage: 78, total_projects: 12, completed_projects: 9, on_track_projects: 2, at_risk_projects: 1, delayed_projects: 0 },
          { id: 3, name: 'Ana Gutierrez', department: 'Operations', utilization_percentage: 65, total_projects: 10, completed_projects: 8, on_track_projects: 1, at_risk_projects: 1, delayed_projects: 0 },
          { id: 4, name: 'Roberto Silva', department: 'Technology', utilization_percentage: 89, total_projects: 14, completed_projects: 10, on_track_projects: 3, at_risk_projects: 1, delayed_projects: 0 }
        ]
      }
      setDashboardData(mockData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
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
    { id: 'team', name: 'Team', icon: UserGroupIcon },
  ]

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,245,255,0.15)_1px,transparent_0)] bg-[size:50px_50px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
      </div>

      <Header connected={connected} />

      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar 
          navigation={navigation}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 overflow-hidden relative">
          <div className="h-full p-1">
            <OverviewDashboard data={dashboardData} />
          </div>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  )
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
            <p className="text-cyan-400 text-sm">Executive Dashboard • Alex Rodriguez</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'} animate-pulse`}></div>
            <span className="text-sm text-gray-300">
              {connected ? 'Live Connection' : 'Disconnected'}
            </span>
          </div>

          <button className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group">
            <BellIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
              3
            </span>
          </button>

          <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group">
            <CogIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
          </button>

          <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">AR</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Alex Rodriguez</p>
              <p className="text-gray-400 text-xs">Director</p>
            </div>
          </div>
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

function OverviewDashboard({ data }: { data: DashboardData | null }) {
  if (!data) return <div className="text-white text-center p-8">Loading...</div>

  return (
    <div className="h-full grid grid-cols-12 grid-rows-8 gap-2 p-2">
      <div className="col-span-12 row-span-2">
        <KPICards data={data} />
      </div>
      <div className="col-span-6 row-span-6">
        <ActivityFeedCard data={data} />
      </div>
      <div className="col-span-6 row-span-3">
        <BudgetOverviewCard data={data} />
      </div>
      <div className="col-span-6 row-span-3">
        <SVPPerformanceCard data={data} />
      </div>
    </div>
  )
}

function KPICards({ data }: { data: DashboardData }) {
  const kpis = [
    {
      title: 'Total Budget',
      value: formatCurrency(data.budget?.total_allocated || 0),
      subtitle: `${formatCurrency(data.budget?.total_spent || 0)} spent`,
      progress: data.budget?.avg_utilization || 0,
      icon: CurrencyDollarIcon,
      color: 'from-green-400 to-emerald-600',
      change: '+12%'
    },
    {
      title: 'Active Projects',
      value: data.projects?.reduce((acc, p) => acc + p.count, 0) || 0,
      subtitle: `${data.projects?.find(p => p.status === 'On Track')?.count || 0} on track`,
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
      value: data.risks?.find(r => r.risk_level === 'High')?.count || 0,
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
              <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                <kpi.icon className="h-6 w-6 text-white" />
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
            
            <h3 className="text-3xl font-bold text-white mb-1">{kpi.value}</h3>
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

function BudgetOverviewCard({ data }: { data: DashboardData }) {
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
              strokeDasharray={`${data.budget?.avg_utilization || 0}, 100`}
            />
            <defs>
              <linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-lg font-bold text-white">
            {data.budget?.avg_utilization?.toFixed(0) || 0}%
          </span>
        </div>
        <p className="text-gray-400 text-sm">Budget Utilization</p>
      </div>

      <div className="space-y-3">
        {data.svpPerformance?.slice(0, 4).map((svp, index) => (
          <motion.div
            key={svp.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">{svp.name}</span>
              <span className="text-cyan-400">{formatPercentage(svp.utilization_percentage)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${svp.utilization_percentage}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                className={`h-2 rounded-full ${
                  svp.utilization_percentage > 85 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                  svp.utilization_percentage > 75 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  'bg-gradient-to-r from-green-400 to-emerald-500'
                } shadow-lg`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SVPPerformanceCard({ data }: { data: DashboardData }) {
  return (
    <div className="h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-cyan-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">SVP Performance</h3>
        <UserGroupIcon className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {data.svpPerformance?.slice(0, 4).map((svp, index) => (
          <motion.div
            key={svp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-white font-medium text-sm">{svp.name}</h4>
                <p className="text-gray-400 text-xs">{svp.department}</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 font-semibold">{svp.total_projects}</p>
                <p className="text-gray-400 text-xs">Projects</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">{svp.completed_projects}</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">{svp.on_track_projects}</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-400">{svp.at_risk_projects}</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-400">{svp.delayed_projects}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ActivityFeedCard({ data }: { data: DashboardData }) {
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
        {data.activities?.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start space-x-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
          >
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
                <span>{activity.svp_name}</span>
                {activity.project_name && (
                  <>
                    <span>•</span>
                    <span>{activity.project_name}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
