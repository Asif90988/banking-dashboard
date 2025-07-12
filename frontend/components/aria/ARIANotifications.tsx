'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useARIA } from './ARIAProvider'
import { XMarkIcon, InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function ARIANotifications() {
  const { notifications, setIsOpen } = useARIA()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10'
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10'
      default:
        return 'border-blue-500/30 bg-blue-500/10'
    }
  }

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`w-96 p-4 rounded-xl backdrop-blur-xl border ${getColors(notification.type)} shadow-xl cursor-pointer group`}
            onClick={() => setIsOpen(true)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400 text-sm font-medium">ARIA</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-100 group-hover:text-white transition-colors">
                  {notification.message}
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8 }}
                  className="mt-2 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
