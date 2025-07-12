'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  XCircleIcon,
  SignalIcon,
  ServerIcon,
  CloudIcon,
  WifiIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ConnectionDropdownProps {
  connected: boolean
}

interface ConnectionSource {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'warning'
  type: 'database' | 'api' | 'stream' | 'cloud'
  lastSync: string
  latency?: number
  details?: string
}

export default function ConnectionDropdown({ connected }: ConnectionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock connection data - in real app this would come from props or API
  const connectionSources: ConnectionSource[] = [
    {
      id: '1',
      name: 'Budget Management API',
      status: 'connected',
      type: 'api',
      lastSync: '2 seconds ago',
      latency: 45,
      details: 'Real-time budget data streaming'
    },
    {
      id: '2',
      name: 'Kafka Transaction Stream',
      status: 'disconnected',
      type: 'stream',
      lastSync: '5 minutes ago',
      details: 'Connection timeout - attempting reconnect'
    },
    {
      id: '3',
      name: 'PostgreSQL Database',
      status: 'connected',
      type: 'database',
      lastSync: '1 second ago',
      latency: 12,
      details: 'Primary data source active'
    },
    {
      id: '4',
      name: 'Cloud Analytics Service',
      status: 'warning',
      type: 'cloud',
      lastSync: '30 seconds ago',
      latency: 156,
      details: 'High latency detected'
    }
  ]

  const connectedCount = connectionSources.filter(s => s.status === 'connected').length
  const totalCount = connectionSources.length
  const healthScore = Math.round((connectedCount / totalCount) * 100)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />
      case 'disconnected':
        return <XCircleIcon className="h-4 w-4 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
      default:
        return <XCircleIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <ServerIcon className="h-4 w-4 text-blue-400" />
      case 'api':
        return <CloudIcon className="h-4 w-4 text-purple-400" />
      case 'stream':
        return <SignalIcon className="h-4 w-4 text-cyan-400" />
      case 'cloud':
        return <WifiIcon className="h-4 w-4 text-indigo-400" />
      default:
        return <ServerIcon className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 group"
      >
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'} animate-pulse`}></div>
        <span className="text-sm text-gray-300 group-hover:text-white">
          {connected ? 'Live Connection' : 'Disconnected'}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-black/50 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Connection Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{connectedCount}/{totalCount}</div>
                    <div className="text-xs text-gray-400">Connected</div>
                  </div>
                </div>
              </div>
              
              {/* Health Score */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Health Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${healthScore}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-2 rounded-full ${
                        healthScore >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        healthScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${
                    healthScore >= 80 ? 'text-green-400' :
                    healthScore >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {healthScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Sources */}
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {connectionSources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(source.type)}
                    {getStatusIcon(source.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white truncate">{source.name}</h4>
                      {source.latency && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          source.latency < 50 ? 'bg-green-500/20 text-green-400' :
                          source.latency < 100 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {source.latency}ms
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{source.details}</p>
                    <p className="text-xs text-gray-500">Last sync: {source.lastSync}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Last refresh: 0s ago</span>
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Refresh All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
