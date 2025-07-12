'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useARIA } from './ARIAProvider'
import { SparklesIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function ARIAFloatingButton() {
  const { isOpen, setIsOpen } = useARIA()

  if (isOpen) return null

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", damping: 20, stiffness: 300 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full shadow-2xl shadow-cyan-500/30 flex items-center justify-center group hover:shadow-cyan-500/50 transition-all duration-300"
    >
      {/* Pulsing Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ opacity: 0.3 }}
      />
      
      {/* Rotating Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Icon */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative"
      >
        <SparklesIcon className="h-6 w-6 text-white" />
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          animate={{
            y: [-20, -40, -20],
            x: [0, 10 * (i - 1), 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 3 }}
        className="absolute -left-40 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap border border-cyan-500/30 shadow-lg"
      >
        <BoltIcon className="h-4 w-4 inline mr-2 text-cyan-400" />
        Chat with ARIA
        <motion.div
          className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-r-0 border-t-4 border-b-4 border-l-black/80 border-t-transparent border-b-transparent"
        />
      </motion.div>
    </motion.button>
  )
}
