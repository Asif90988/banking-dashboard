'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface NotificationDropdownProps {
  notificationCount?: number
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'alert' | 'warning' | 'info' | 'success' | 'error'
  priority: 'high' | 'medium' | 'low'
  timestamp: string
  read: boolean
  source: string
  actionRequired?: boolean
}

export default function NotificationDropdown({ notificationCount = 3 }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock notification data - in real app this would come from props or API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Risk Analysis Alert',
        message: 'Market volatility detected - recommend reviewing hedge positions in LATAM portfolio',
        type: 'alert',
        priority: 'high',
        timestamp: '2 minutes ago',
        read: false,
        source: 'ARIA Risk Engine',
        actionRequired: true
      },
      {
        id: '2',
        title: 'Budget Threshold Warning',
        message: 'Technology department has exceeded 85% of allocated budget for Q4',
        type: 'warning',
        priority: 'medium',
        timestamp: '15 minutes ago',
        read: false,
        source: 'Budget Management',
        actionRequired: true
      },
      {
        id: '3',
        title: 'Compliance Update',
        message: 'New regulatory requirements published for LATAM operations',
        type: 'info',
        priority: 'medium',
        timestamp: '1 hour ago',
        read: false,
        source: 'Compliance Monitor',
        actionRequired: false
      },
      {
        id: '4',
        title: 'Process Optimization',
        message: 'AI-driven process optimization saved $2.3M in operations this quarter',
        type: 'success',
        priority: 'low',
        timestamp: '2 hours ago',
        read: true,
        source: 'Efficiency Report',
        actionRequired: false
      },
      {
        id: '5',
        title: 'Data Connection Error',
        message: 'Kafka Transaction Stream connection lost - attempting reconnection',
        type: 'error',
        priority: 'high',
        timestamp: '3 hours ago',
        read: true,
        source: 'Data Pipeline',
        actionRequired: false
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
      case 'info':
        return <InformationCircleIcon className="h-4 w-4 text-blue-400" />
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-400" />
      default:
        return <BellIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 group"
      >
        <BellIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-96 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-black/50 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <span className="text-sm text-gray-400">
                    {unreadCount} unread
                  </span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-lg font-bold text-red-400">
                    {notifications.filter(n => n.priority === 'high' && !n.read).length}
                  </div>
                  <div className="text-xs text-red-300">High Priority</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-lg font-bold text-yellow-400">
                    {notifications.filter(n => n.actionRequired && !n.read).length}
                  </div>
                  <div className="text-xs text-yellow-300">Action Required</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-lg font-bold text-blue-400">
                    {notifications.length}
                  </div>
                  <div className="text-xs text-blue-300">Total</div>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-xl border-l-4 ${getPriorityColor(notification.priority)} ${
                        notification.read 
                          ? 'bg-white/5 border-white/10' 
                          : 'bg-white/10 border-white/20'
                      } hover:bg-white/15 transition-all duration-300 group`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-300' : 'text-white'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 rounded hover:bg-white/10"
                                  title="Mark as read"
                                >
                                  <EyeIcon className="h-3 w-3 text-gray-400 hover:text-white" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 rounded hover:bg-white/10"
                                title="Delete"
                              >
                                <TrashIcon className="h-3 w-3 text-gray-400 hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                          
                          <p className={`text-xs mb-2 ${
                            notification.read ? 'text-gray-500' : 'text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <ClockIcon className="h-3 w-3" />
                              <span>{notification.timestamp}</span>
                              <span>•</span>
                              <span>{notification.source}</span>
                            </div>
                            
                            {notification.actionRequired && (
                              <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                Action Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-white/10">
                <button className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
