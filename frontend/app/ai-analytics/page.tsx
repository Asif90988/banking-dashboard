'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
)

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AIInsight {
  id: string
  type: string
  title: string
  content: string
  confidence: number
  priority: string
}

export default function AIAnalyticsPage() {
  const router = useRouter()
  const [aiHealth, setAiHealth] = useState<any>(null)
  const [predictions, setPredictions] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [complianceData, setComplianceData] = useState<any>(null)
  const [budgetData, setBudgetData] = useState<any>(null)
  const [riskData, setRiskData] = useState<any>(null)
  const [projectData, setProjectData] = useState<any>(null)

  const handleLogout = () => {
    localStorage.removeItem('currentExecutive')
    router.push('/login')
  }

  const handleBackToDashboard = () => {
    router.push('/')
  }

  useEffect(() => {
    loadAIAnalyticsData()
    loadBankingData()
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadAIAnalyticsData()
      loadBankingData()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAIAnalyticsData = async () => {
    try {
      // Load AI health status
      const healthRes = await fetch('http://localhost:5050/api/ai-analytics/health')
      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setAiHealth(healthData.data)
      }

      // Load predictions
      const predictionsRes = await fetch('http://localhost:5050/api/ai-analytics/predictions')
      if (predictionsRes.ok) {
        const predictionsData = await predictionsRes.json()
        setPredictions(predictionsData.data)
      }

      // Load anomalies
      const anomaliesRes = await fetch('http://localhost:5050/api/ai-analytics/anomalies?limit=20')
      if (anomaliesRes.ok) {
        const anomaliesData = await anomaliesRes.json()
        setAnomalies(anomaliesData.data)
      }

      // Load insights
      const insightsRes = await fetch('http://localhost:5050/api/ai-analytics/insights')
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        setInsights(insightsData.data.insights)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading AI analytics data:', error)
      setLoading(false)
    }
  }

  const loadBankingData = async () => {
    try {
      // Load compliance data
      const complianceRes = await fetch('http://localhost:5050/api/compliance')
      if (complianceRes.ok) {
        const complianceData = await complianceRes.json()
        setComplianceData(complianceData)
      }

      // Load budget data
      const budgetRes = await fetch('http://localhost:5050/api/budget/overview')
      if (budgetRes.ok) {
        const budgetData = await budgetRes.json()
        setBudgetData(budgetData)
      }

      // Load risk data
      const riskRes = await fetch('http://localhost:5050/api/risk')
      if (riskRes.ok) {
        const riskData = await riskRes.json()
        setRiskData(riskData)
      }

      // Load project data
      const projectRes = await fetch('http://localhost:5050/api/projects')
      if (projectRes.ok) {
        const projectData = await projectRes.json()
        setProjectData(projectData)
      }
    } catch (error) {
      console.error('Error loading banking data:', error)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    setChatHistory(prev => [...prev, { role: 'user', content: message }])
    setChatMessage('')

    try {
      const response = await fetch('http://localhost:5050/api/ai-analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          context: { 
            user: 'Alex Rodriguez', 
            role: 'Director',
            timestamp: new Date() 
          } 
        })
      })

      if (response.ok) {
        const data = await response.json()
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.data.response }])
      }
    } catch (error) {
      console.error('Error sending chat message:', error)
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again.' 
      }])
    }
  }

  // Calculate key banking metrics
  const calculateComplianceScore = () => {
    if (!complianceData?.data) return 0
    const total = complianceData.data.length
    const compliant = complianceData.data.filter((item: any) => item.status === 'Compliant').length
    return total > 0 ? Math.round((compliant / total) * 100) : 0
  }

  const calculateBudgetUtilization = () => {
    if (!budgetData) return 0
    const allocated = parseFloat(budgetData.total_allocated) || 0
    const spent = parseFloat(budgetData.total_spent) || 0
    return allocated > 0 ? Math.round((spent / allocated) * 100) : 0
  }

  const calculateRiskScore = () => {
    if (!riskData || !Array.isArray(riskData)) return 0
    const highRisks = riskData.filter((risk: any) => risk.risk_level === 'High').length
    const totalRisks = riskData.length
    return totalRisks > 0 ? Math.round((highRisks / totalRisks) * 100) : 0
  }

  const getProjectHealth = () => {
    if (!projectData || !Array.isArray(projectData)) return 0
    const onTrack = projectData.filter((project: any) => project.status === 'On Track').length
    const total = projectData.length
    return total > 0 ? Math.round((onTrack / total) * 100) : 0
  }

  // Banking-specific chart data
  const complianceScoreData = {
    datasets: [{
      data: [calculateComplianceScore(), 100 - calculateComplianceScore()],
      backgroundColor: ['#10B981', '#374151'],
      borderWidth: 0,
    }]
  }

  const budgetTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Budget Utilization %',
      data: [65, 72, 68, 75, 82, calculateBudgetUtilization()],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }, {
      label: 'Compliance Score %',
      data: [88, 91, 89, 93, 95, calculateComplianceScore()],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  const riskDistributionData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
    datasets: [{
      data: [
        riskData?.filter((r: any) => r.risk_level === 'Low').length || 0,
        riskData?.filter((r: any) => r.risk_level === 'Medium').length || 0,
        riskData?.filter((r: any) => r.risk_level === 'High').length || 0,
        riskData?.filter((r: any) => r.risk_level === 'Critical').length || 0
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#7C2D12'],
      borderWidth: 2,
      borderColor: '#1F2937'
    }]
  }

  const departmentBudgetData = {
    labels: ['Technology', 'Risk Management', 'Operations', 'Compliance', 'Legal'],
    datasets: [{
      label: 'Budget Allocated (M)',
      data: [2.5, 1.8, 3.2, 1.2, 0.8],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }, {
      label: 'Budget Spent (M)',
      data: [2.1, 1.6, 2.8, 1.1, 0.7],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#FFFFFF' }
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
      }
    }
  }

  if (loading) {
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
          <h2 className="text-2xl font-bold text-white mb-2">Initializing AI Analytics</h2>
          <p className="text-cyan-400">Loading banking compliance and regulatory data...</p>
        </motion.div>
      </div>
    )
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

      <div className="relative z-10 p-6">
        {/* Header with Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Analytics Dashboard</h1>
                <p className="text-cyan-400">Advanced Banking Compliance & Regulatory Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">AI Systems Online</span>
              </div>
              <div className="text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
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
        </motion.div>

        {/* AI Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CpuChipIcon className="h-6 w-6 mr-2 text-cyan-400" />
              AI System Health
            </h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-medium">Predictive Analytics</h3>
                <p className="text-green-400 text-sm">
                  {aiHealth?.predictiveAnalytics?.initialized ? 'Online' : 'Initializing...'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-medium">Anomaly Detection</h3>
                <p className="text-cyan-400 text-sm">
                  {aiHealth?.anomalyDetection?.initialized ? 'Monitoring' : 'Loading...'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
                  <EyeIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-medium">Insights Engine</h3>
                <p className="text-purple-400 text-sm">
                  {insights.length > 0 ? `${insights.length} Active` : 'Generating...'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-medium">AI Assistant</h3>
                <p className="text-orange-400 text-sm">Ready</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Banking Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-green-400" />
                <span className="text-green-400 text-sm font-medium">+2.1%</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{calculateComplianceScore()}%</h3>
              <p className="text-gray-400">Compliance Score</p>
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${calculateComplianceScore()}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">
                  {budgetData ? `$${(parseFloat(budgetData.total_spent) / 1000000).toFixed(1)}M` : 'Loading...'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{calculateBudgetUtilization()}%</h3>
              <p className="text-gray-400">Budget Utilization</p>
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${calculateBudgetUtilization()}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                <span className="text-red-400 text-sm font-medium">
                  {riskData ? `${riskData.filter((r: any) => r.risk_level === 'High').length} High` : 'Loading...'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{calculateRiskScore()}%</h3>
              <p className="text-gray-400">Risk Exposure</p>
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${calculateRiskScore()}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="h-8 w-8 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">
                  {projectData ? `${projectData.length} Total` : 'Loading...'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{getProjectHealth()}%</h3>
              <p className="text-gray-400">Project Health</p>
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${getProjectHealth()}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Compliance Score Gauge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Regulatory Compliance</h3>
            <div className="relative h-64 flex items-center justify-center">
              <Doughnut 
                data={complianceScoreData} 
                options={{
                  ...chartOptions,
                  cutout: '70%',
                  plugins: { legend: { display: false } }
                }} 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{calculateComplianceScore()}</div>
                  <div className="text-gray-400 text-sm">Compliance %</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                {complianceData?.data ? `${complianceData.data.filter((item: any) => item.status === 'Compliant').length} of ${complianceData.data.length} requirements met` : 'Loading compliance data...'}
              </p>
            </div>
          </motion.div>

          {/* Budget vs Compliance Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Performance Trends</h3>
            <div className="h-64">
              <Line data={budgetTrendData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Risk Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Risk Distribution</h3>
            <div className="h-64">
              <Doughnut data={riskDistributionData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Department Budget Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Department Budget Analysis</h3>
            <div className="h-64">
              <Bar data={departmentBudgetData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        {/* AI Insights and Chat */}
        <div className="grid grid-cols-3 gap-6">
          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <EyeIcon className="h-6 w-6 mr-2 text-cyan-400" />
              AI-Generated Insights
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {insights.length > 0 ? insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      insight.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      insight.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {insight.priority.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <h4 className="text-white font-medium mb-2">{insight.title}</h4>
                  <p className="text-gray-300 text-sm">{insight.content}</p>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">AI is analyzing your data to generate insights...</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Chat Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-purple-400" />
              AI Assistant
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {chatHistory.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm mb-4">Ask me about compliance, risks, budgets, or projects</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSendMessage('What are our current compliance risks?')}
                      className="block w-full text-left text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded p-2 transition-colors"
                    >
                      "What are our current compliance risks?"
                    </button>
                    <button
                      onClick={() => handleSendMessage('Show me budget utilization by department')}
                      className="block w-full text-left text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded p-2 transition-colors"
                    >
                      "Show me budget utilization by department"
                    </button>
                    <button
                      onClick={() => handleSendMessage('Which projects need immediate attention?')}
                      className="block w-full text-left text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded p-2 transition-colors"
                    >
                      "Which projects need immediate attention?"
                    </button>
                  </div>
                </div>
              )}
              
              {chatHistory.map((msg, index) => (
                <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-xs p-3 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white/10 text-gray-300'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(chatMessage)}
                placeholder="Ask about compliance, risks, budgets..."
                className="flex-1 bg-white/10 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={() => handleSendMessage(chatMessage)}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-2 rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
