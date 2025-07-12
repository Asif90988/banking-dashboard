'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useARIA } from './ARIAProvider'
import { 
  XMarkIcon, 
  PaperAirplaneIcon,
  SparklesIcon,
  MicrophoneIcon,
  CommandLineIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function ARIAAssistant() {
  const { isOpen, setIsOpen, messages, sendMessage, isTyping, suggestedPrompts } = useARIA()
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isTyping) return

    sendMessage(inputMessage)
    setInputMessage('')
  }

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  const handleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice input functionality would go here
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 100 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed bottom-6 right-6 z-[100] w-96 h-[600px] bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center relative"
          >
            <SparklesIcon className="h-5 w-5 text-white" />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ opacity: 0.3 }}
            />
          </motion.div>
          <div>
            <h3 className="text-white font-bold text-lg">ARIA</h3>
            <p className="text-cyan-400 text-xs">AI Regulatory Intelligence Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${
              message.type === 'user' 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' 
                : 'bg-gradient-to-br from-slate-800 to-slate-700 text-gray-100 border border-cyan-500/20'
            } rounded-xl p-3 shadow-lg`}>
              {message.type === 'aria' && (
                <div className="flex items-center space-x-2 mb-2">
                  <BoltIcon className="h-4 w-4 text-cyan-400" />
                  <span className="text-cyan-400 text-xs font-medium">ARIA</span>
                </div>
              )}
              <motion.p 
                className="text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: message.animation === 'typing' ? 0.5 : 0 }}
              >
                {message.animation === 'typing' ? (
                  <TypewriterText text={message.content} />
                ) : (
                  message.content
                )}
              </motion.p>
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-gray-100 border border-cyan-500/20 rounded-xl p-3 shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BoltIcon className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400 text-xs font-medium">ARIA</span>
              </div>
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />

        {/* Suggested Prompts - Show when there are few messages */}
        {messages.length <= 2 && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <p className="text-xs text-gray-400 mb-2">Try asking me:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full hover:bg-cyan-500/30 transition-colors border border-cyan-500/30"
                >
                  {prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input - Always visible at bottom */}
      <div className="p-4 border-t border-cyan-500/20 bg-slate-900/50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask ARIA anything about your dashboard..."
              className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              disabled={isTyping}
            />
            <motion.button
              type="button"
              onClick={handleVoiceInput}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                isListening ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <MicrophoneIcon className="h-4 w-4" />
            </motion.button>
          </div>
          <motion.button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}

// Typewriter effect component
function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 30)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <span>
      {displayText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-cyan-400 ml-1"
        />
      )}
    </span>
  )
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-gray-400">ARIA is thinking</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 bg-cyan-400 rounded-full"
          />
        ))}
      </div>
    </div>
  )
}
