'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
import { useSocket, useDashboardEvents } from '@/hooks/useSocket'
import {
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  CpuChipIcon,
  SignalIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

interface DataSource {
  id: string
  name: string
  type: 'database' | 'api' | 'stream' | 'file' | 'external'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastUpdate: Date
  recordsProcessed: number
  errorCount: number
  latency: number
  description: string
  icon: any
  metrics: {
    throughput: number
    availability: number
    errorRate: number
  }
}

export default function ConnectedDataPage() {
  const { socket, connected } = useSocket()
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Initialize data sources
  useEffect(() => {
    initializeDataSources()
    fetchRealStreamingStatus() // Fetch real status on mount
    const interval = setInterval(() => {
      updateDataSourceMetrics()
      fetchRealStreamingStatus() // Fetch real status every 5 seconds
      setLastRefresh(new Date())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Listen for real-time updates
  useDashboardEvents('stream-update', (data) => {
    updateDataSourceFromStream(data)
  })

  const initializeDataSources = () => {
    const sources: DataSource[] = [
      {
        id: 'kafka-streaming',
        name: 'Kafka Transaction Stream',
        type: 'stream',
        status: connected ? 'connected' : 'disconnected',
        lastUpdate: new Date(),
        recordsProcessed: Math.floor(Math.random() * 10000) + 5000,
        errorCount: Math.floor(Math.random() * 10),
        latency: Math.floor(Math.random() * 50) + 10,
        description: 'Real-time transaction processing and financial data streaming',
        icon: BoltIcon,
        metrics: {
          throughput: Math.floor(Math.random() * 1000) + 500,
          availability: 99.8,
          errorRate: 0.2
        }
      },
      {
        id: 'budget-api',
        name: 'Budget Management API',
        type: 'api',
        status: 'connected',
        lastUpdate: new Date(Date.now() - Math.random() * 60000),
        recordsProcessed: Math.floor(Math.random() * 5000) + 2000,
        errorCount: Math.floor(Math.random() * 5),
        latency: Math.floor(Math.random() * 100) + 20,
        description: 'SVP budget allocations, spending, and utilization data',
        icon: CurrencyDollarIcon,
        metrics: {
          throughput: Math.floor(Math.random() * 500) + 200,
          availability: 99.9,
          errorRate: 0.1
        }
      },
      {
        id: 'compliance-db',
        name: 'Compliance Database',
        type: 'database',
        status: 'connected',
        lastUpdate: new Date(Date.now() - Math.random() * 120000),
        recordsProcessed: Math.floor(Math.random() * 3000) + 1500,
        errorCount: Math.floor(Math.random() * 3),
        latency: Math.floor(Math.random() * 80) + 15,
        description: 'Regulatory compliance monitoring and audit trails',
        icon: ShieldCheckIcon,
        metrics: {
          throughput: Math.floor(Math.random() * 300) + 150,
          availability: 99.95,
          errorRate: 0.05
        }
      },
      {
        id: 'project-management',
        name: 'Project Management System',
        type: 'api',
        status: 'connected',
        lastUpdate: new Date(Date.now() - Math.random() * 180000),
        recordsProcessed: Math.floor(Math.random() * 2000) + 800,
        errorCount: Math.floor(Math.random() * 7),
        latency: Math.floor(Math.random() * 120) + 30,
        description: 'Project status, milestones, and resource allocation',
        icon: ChartBarIcon,
        metrics: {
          throughput: Math.floor(Math.random() * 200) + 100,
          availability: 99.7,
          errorRate: 0.3
        }
      },
      {
        id: 'risk-analytics',
        name: 'Risk Analytics Engine',
        type: 'external',
        status: 'syncing',
        lastUpdate: new Date(Date.now() - Math.random() * 300000),
        recordsProcessed: Math.floor(Math.random() * 1500) + 600,
        errorCount: Math.floor(Math.random() * 12),
        latency: Math.floor(Math.random() * 200) + 50,
        description: 'Risk assessment and predictive analytics',
        icon: ExclamationTriangleIcon,
        metrics: {
          throughput: Math.floor(Math.random() * 150) + 75,
          availability: 98.5,
          errorRate: 1.5
        }
      },
      {
        id: 'hr-system',
        name: 'HR Management System',
        type: 'api',
        status: 'error',
        lastUpdate: new Date(Date.now() - Math.random() * 600000),
        recordsProcessed: Math.floor(Math.random() * 1000) + 400,
        errorCount: Math.floor(Math.random() * 25) + 15,
        latency: Math.floor(Math.random() * 500) + 200,
        description: 'Employee data and organizational structure',
        icon: UserGroupIcon,
        metrics: {
          throughput: Math.floor(Math.random() * 100) + 50,
          availability: 95.2,
          errorRate: 4.8
        }
      },
      {
        id: 'document-store',
        name: 'Document Repository',
        type: 'file',
        status: 'connected',
        lastUpdate: new Date(Date.now() - Math.random() * 240000),
        recordsProcessed: Math.floor(Math.random() * 800) + 300,
        errorCount: Math.floor(Math.random() * 5),
        latency: Math.floor(Math.random() * 150) + 40,
        description: 'Regulatory documents and policy files',
        icon: DocumentTextIcon,
        metrics: {
          throughput: Math.floor(Math.random() * 80) + 40,
          availability: 99.1,
          errorRate: 0.9
        }
      },
      {
        id: 'ai-integration',
        name: 'AI Data Integration',
        type: 'external',
        status: connected ? 'connected' : 'disconnected',
        lastUpdate: new Date(),
        recordsProcessed: Math.floor(Math.random() * 500) + 200,
        errorCount: Math.floor(Math.random() * 8),
        latency: Math.floor(Math.random() * 300) + 100,
        description: 'AI-powered data processing and insights',
        icon: CpuChipIcon,
        metrics: {
          throughput: Math.floor(Math.random() * 120) + 60,
          availability: 97.8,
          errorRate: 2.2
        }
      }
    ]

    setDataSources(sources)
    setLoading(false)
  }

  const updateDataSourceMetrics = () => {
    setDataSources(prev => prev.map(source => ({
      ...source,
      recordsProcessed: source.recordsProcessed + Math.floor(Math.random() * 50),
      latency: Math.max(10, source.latency + (Math.random() - 0.5) * 20),
      metrics: {
        ...source.metrics,
        throughput: Math.max(0, source.metrics.throughput + (Math.random() - 0.5) * 100)
      }
    })))
  }

  const fetchRealStreamingStatus = async () => {
    try {
      // Try to fetch from the streaming status endpoint
      const response = await fetch('http://localhost:5050/api/streaming/status')
      if (response.ok) {
        const streamingStatus = await response.json()
        
        // Update Kafka streaming status based on real backend data
        setDataSources(prev => prev.map(source => {
          if (source.id === 'kafka-streaming') {
            const kafkaStats = streamingStatus.kafka
            const isKafkaConnected = kafkaStats?.isConnected || false
            const isSimulationMode = kafkaStats?.simulationMode || false
            
            return {
              ...source,
              status: isKafkaConnected ? 'connected' : 'disconnected',
              lastUpdate: kafkaStats?.lastActivity ? new Date(kafkaStats.lastActivity) : source.lastUpdate,
              recordsProcessed: kafkaStats?.messagesConsumed || source.recordsProcessed,
              errorCount: kafkaStats?.errors || source.errorCount,
              metrics: {
                ...source.metrics,
                throughput: kafkaStats?.messagesProduced || source.metrics.throughput,
                availability: isKafkaConnected ? (isSimulationMode ? 99.5 : 99.8) : 0,
                errorRate: kafkaStats?.errors ? (kafkaStats.errors / Math.max(kafkaStats.messagesConsumed, 1)) * 100 : source.metrics.errorRate
              }
            }
          }
          return source
        }))
      }
    } catch (error) {
      console.warn('Could not fetch streaming status:', error)
      // If we can't fetch the status, mark Kafka as disconnected
      setDataSources(prev => prev.map(source => {
        if (source.id === 'kafka-streaming') {
          return {
            ...source,
            status: 'disconnected' as const
          }
        }
        return source
      }))
    }
  }

  const updateDataSourceFromStream = (data: any) => {
    if (data.topic) {
      setDataSources(prev => prev.map(source => {
        if (source.id === 'kafka-streaming') {
          return {
            ...source,
            lastUpdate: new Date(),
            recordsProcessed: source.recordsProcessed + 1,
            status: 'connected' as const
          }
        }
        return source
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'syncing':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'disconnected':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'syncing':
        return <ArrowPathIcon className="h-5 w-5 animate-spin" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'disconnected':
        return <WifiIcon className="h-5 w-5" />
      default:
        return <ClockIcon className="h-5 w-5" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <CircleStackIcon className="h-6 w-6" />
      case 'api':
        return <CloudIcon className="h-6 w-6" />
      case 'stream':
        return <SignalIcon className="h-6 w-6" />
      case 'file':
        return <DocumentTextIcon className="h-6 w-6" />
      case 'external':
        return <ServerIcon className="h-6 w-6" />
      default:
        return <CpuChipIcon className="h-6 w-6" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const connectedCount = dataSources.filter(s => s.status === 'connected').length
  const totalCount = dataSources.length
  const overallHealth = (connectedCount / totalCount) * 100

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
          <p className="text-white text-lg">Loading Data Sources...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Connected Data Sources</h1>
              <p className="text-cyan-400 text-lg">Real-time monitoring of all data integrations</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Last Refresh</div>
              <div className="text-white font-medium">{formatTimeAgo(lastRefresh)}</div>
            </div>
          </div>
        </motion.div>

        {/* Overall Health Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{connectedCount}</div>
                <div className="text-sm text-gray-400">Connected</div>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                style={{ width: `${(connectedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <SignalIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{overallHealth.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Health Score</div>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"
                style={{ width: `${overallHealth}%` }}
              />
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <ChartBarIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {dataSources.reduce((sum, s) => sum + s.recordsProcessed, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Records Processed</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Total across all sources</div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <BoltIcon className="h-8 w-8 text-cyan-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {Math.round(dataSources.reduce((sum, s) => sum + s.metrics.throughput, 0))}
                </div>
                <div className="text-sm text-gray-400">Records/min</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Combined throughput</div>
          </div>
        </motion.div>

        {/* Data Sources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dataSources.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-cyan-500/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-white/5">
                    {getTypeIcon(source.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{source.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{source.type} Source</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(source.status)}`}>
                  {getStatusIcon(source.status)}
                  <span className="text-sm font-medium capitalize">{source.status}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4">{source.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Records Processed</div>
                  <div className="text-lg font-semibold text-white">{source.recordsProcessed.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Latency</div>
                  <div className="text-lg font-semibold text-white">{Math.round(source.latency)}ms</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Throughput</div>
                  <div className="text-lg font-semibold text-white">{Math.round(source.metrics.throughput)}/min</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Availability</div>
                  <div className="text-lg font-semibold text-white">{source.metrics.availability}%</div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Availability</span>
                  <span className="text-white">{source.metrics.availability}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      source.metrics.availability > 99 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                      source.metrics.availability > 95 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${source.metrics.availability}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-gray-400">
                  Last Update: {formatTimeAgo(source.lastUpdate)}
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  {source.errorCount > 0 && (
                    <span className="text-red-400">
                      {source.errorCount} errors
                    </span>
                  )}
                  <span className="text-gray-400">
                    {source.metrics.errorRate}% error rate
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
