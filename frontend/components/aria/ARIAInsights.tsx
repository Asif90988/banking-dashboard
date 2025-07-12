'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useARIA } from './ARIAProvider'
import { useState, useEffect } from 'react'
import { BoltIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon, ChartBarIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Insight {
  id: string
  type: 'trend' | 'alert' | 'suggestion' | 'achievement'
  title: string
  description: string
  action: string
  priority: 'high' | 'medium' | 'low'
}

export default function ARIAInsights() {
  const { setIsOpen, sendMessage } = useARIA()
  const [currentInsight, setCurrentInsight] = useState<Insight | null>(null)
  const [showInsight, setShowInsight] = useState(false)

  const insights: Insight[] = [
    {
      id: 'budget-trend',
      type: 'trend',
      title: 'Budget Optimization Opportunity',
      description: 'Priya Singh\'s Technology Risk team is 15% under budget while Cybersecurity project is over. I can help reallocate funds.',
      action: 'Optimize budget allocation',
      priority: 'high'
    },
    {
      id: 'compliance-alert',
      type: 'alert',
      title: 'Compliance Deadline Alert',
      description: '3 regulatory filings due in 48 hours. Sandeep\'s team has 2 pending items that need immediate attention.',
      action: 'Review compliance status',
      priority: 'high'
    },
    {
      id: 'performance-achievement',
      type: 'achievement',
      title: 'Team Performance Milestone',
      description: 'Congratulations! Vinod\'s Regulatory Compliance team achieved 95% on-time delivery this quarter.',
      action: 'View detailed performance',
      priority: 'medium'
    },
    {
      id: 'risk-suggestion',
      type: 'suggestion',
      title: 'Risk Mitigation Strategy',
      description: 'Based on current risk patterns, I recommend implementing additional controls for the AML project.',
      action: 'Explore risk mitigation',
      priority: 'medium'
    }
  ]

  useEffect(() => {
    const showInsights = () => {
      const randomInsight = insights[Math.floor(Math.random() * insights.length)]
      setCurrentInsight(randomInsight)
      setShowInsight(true)
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setShowInsight(false)
        setCurrentInsight(null)
      }, 10000)
    }

    // Show first insight after 15 minutes
    const initialTimer = setTimeout(showInsights, 900000)
    
    // Then show insights every 45 minutes
    const interval = setInterval(showInsights, 2700000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  const handleInsightAction = () => {
    if (currentInsight) {
      setIsOpen(true)
      sendMessage(currentInsight.action)
      setShowInsight(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-blue-400" />
      case 'alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
      case 'achievement':
        return <ChartBarIcon className="h-5 w-5 text-green-400" />
      case 'suggestion':
        return <BoltIcon className="h-5 w-5 text-purple-400" />
      default:
        return <BoltIcon className="h-5 w-5 text-cyan-400" />
    }
  }

  const getColors = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'border-red-500/30 bg-red-500/10'
    }
    switch (type) {
      case 'trend':
        return 'border-blue-500/30 bg-blue-500/10'
      case 'alert':
        return 'border-red-500/30 bg-red-500/10'
      case 'achievement':
        return 'border-green-500/30 bg-green-500/10'
      case 'suggestion':
        return 'border-purple-500/30 bg-purple-500/10'
      default:
        return 'border-cyan-500/30 bg-cyan-500/10'
    }
  }

  return (
    <AnimatePresence>
      {showInsight && currentInsight && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-24 left-6 z-50"
        >
          <div className={`w-80 p-4 rounded-xl backdrop-blur-xl border ${getColors(currentInsight.type, currentInsight.priority)} shadow-2xl`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getIcon(currentInsight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400 text-sm font-medium">ARIA Insight</span>
                    {currentInsight.priority === 'high' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-red-400 rounded-full"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => setShowInsight(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  {currentInsight.title}
                </h4>
                <p className="text-xs text-gray-300 mb-3">
                  {currentInsight.description}
                </p>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInsightAction}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg"
                  >
                    Ask ARIA
                  </motion.button>
                  <button
                    onClick={() => setShowInsight(false)}
                    className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
