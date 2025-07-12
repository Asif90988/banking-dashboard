'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface SettingsDropdownProps {
  userInfo?: {
    name: string
    role: string
    avatar: string
  }
}

interface SettingItem {
  id: string
  label: string
  icon: any
  type: 'action' | 'toggle' | 'submenu'
  value?: boolean
  action?: () => void
  submenu?: SettingItem[]
}

export default function SettingsDropdown({ userInfo }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const settingsItems: SettingItem[] = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: UserIcon,
      type: 'action',
      action: () => console.log('Profile settings')
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: BellIcon,
      type: 'toggle',
      value: notifications,
      action: () => setNotifications(!notifications)
    },
    {
      id: 'theme',
      label: 'Dark Mode',
      icon: darkMode ? MoonIcon : SunIcon,
      type: 'toggle',
      value: darkMode,
      action: () => setDarkMode(!darkMode)
    },
    {
      id: 'auto-refresh',
      label: 'Auto Refresh',
      icon: ChartBarIcon,
      type: 'toggle',
      value: autoRefresh,
      action: () => setAutoRefresh(!autoRefresh)
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: PaintBrushIcon,
      type: 'submenu',
      submenu: [
        {
          id: 'theme-light',
          label: 'Light Theme',
          icon: SunIcon,
          type: 'action',
          action: () => console.log('Light theme')
        },
        {
          id: 'theme-dark',
          label: 'Dark Theme',
          icon: MoonIcon,
          type: 'action',
          action: () => console.log('Dark theme')
        },
        {
          id: 'theme-auto',
          label: 'System Theme',
          icon: ComputerDesktopIcon,
          type: 'action',
          action: () => console.log('System theme')
        }
      ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: ShieldCheckIcon,
      type: 'action',
      action: () => console.log('Security settings')
    },
    {
      id: 'language',
      label: 'Language & Region',
      icon: GlobeAltIcon,
      type: 'action',
      action: () => console.log('Language settings')
    },
    {
      id: 'api-keys',
      label: 'API Keys',
      icon: KeyIcon,
      type: 'action',
      action: () => console.log('API keys')
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: DocumentTextIcon,
      type: 'action',
      action: () => console.log('Export data')
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: ArrowRightOnRectangleIcon,
      type: 'action',
      action: () => console.log('Sign out')
    }
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (item: SettingItem) => {
    if (item.action) {
      item.action()
    }
    if (item.type !== 'submenu') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 group"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <CogIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-72 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-black/50 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {userInfo?.avatar || 'AR'}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {userInfo?.name || 'Alex Rodriguez'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {userInfo?.role || 'Director'}
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Items */}
            <div className="p-2 max-h-80 overflow-y-auto">
              {settingsItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                      item.id === 'logout' 
                        ? 'hover:bg-red-500/10 hover:border-red-500/30' 
                        : 'hover:bg-white/5 hover:border-white/10'
                    } border border-transparent`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        item.id === 'logout' 
                          ? 'bg-red-500/10 group-hover:bg-red-500/20' 
                          : 'bg-white/5 group-hover:bg-white/10'
                      } transition-colors duration-300`}>
                        <item.icon className={`h-4 w-4 ${
                          item.id === 'logout' 
                            ? 'text-red-400' 
                            : 'text-gray-300 group-hover:text-white'
                        }`} />
                      </div>
                      <span className={`text-sm font-medium ${
                        item.id === 'logout' 
                          ? 'text-red-400' 
                          : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                    </div>

                    {item.type === 'toggle' && (
                      <div className={`w-10 h-6 rounded-full transition-colors duration-300 ${
                        item.value ? 'bg-cyan-500' : 'bg-gray-600'
                      } relative`}>
                        <motion.div
                          animate={{ x: item.value ? 16 : 2 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </div>
                    )}

                    {item.type === 'submenu' && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Dashboard v2.1.0</span>
                <span>LATAM RegInsight</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
