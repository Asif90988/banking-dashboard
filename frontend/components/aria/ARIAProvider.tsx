'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { chatbotApi } from '@/lib/api'

interface ARIAContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  messages: ARIAMessage[]
  sendMessage: (message: string) => void
  isTyping: boolean
  suggestedPrompts: string[]
  showNotification: (message: string, type: 'info' | 'warning' | 'success') => void
  notifications: ARIANotification[]
}

interface ARIAMessage {
  id: string
  type: 'user' | 'aria'
  content: string
  timestamp: Date
  animation?: 'typing' | 'complete'
}

interface ARIANotification {
  id: string
  message: string
  type: 'info' | 'warning' | 'success'
  timestamp: Date
  dismissed: boolean
}

const ARIAContext = createContext<ARIAContextType | undefined>(undefined)

export function useARIA() {
  const context = useContext(ARIAContext)
  if (!context) {
    throw new Error('useARIA must be used within ARIAProvider')
  }
  return context
}

export function ARIAProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ARIAMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [notifications, setNotifications] = useState<ARIANotification[]>([])
  const [conversationId] = useState(`aria-${Date.now()}`)

  const suggestedPrompts = [
    "What's my current budget utilization across all SVPs?",
    "Which projects are at risk and need immediate attention?",
    "Show me compliance issues that require action today",
    "How are Vinod, Sandeep, and Manju performing this quarter?",
    "What are the critical risks I should focus on?",
    "Generate an executive summary for the board meeting",
    "Compare this month's performance to last month",
    "What regulatory deadlines are coming up?"
  ]

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      id: 'welcome',
      type: 'aria',
      content: "Hello Alex! I'm ARIA, your AI Regulatory Intelligence Assistant. I'm here 24/7 to help you navigate your LATAM RegInsight dashboard, analyze complex data, and provide strategic insights. What would you like to explore today?",
      timestamp: new Date(),
      animation: 'complete'
    }])

    // Smart notifications based on time and data - with much longer intervals
    setTimeout(() => {
      showNotification(" Your cybersecurity project is 15% over budget - would you like me to analyze the cost drivers?", 'warning')
    }, 600000) // 10 minutes

    setTimeout(() => {
      showNotification(" New compliance alert: 3 high-priority items need review before tomorrow's deadline", 'warning')
    }, 1200000) // 20 minutes

    setTimeout(() => {
      showNotification(" Great news! Your team's overall project completion rate improved by 12% this month", 'success')
    }, 1800000) // 30 minutes
  }, [])

  const sendMessage = async (message: string) => {
    const userMessage: ARIAMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
      animation: 'complete'
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await chatbotApi.sendMessage(message, conversationId)
      
      // Simulate typing delay for realism
      setTimeout(() => {
        const ariaMessage: ARIAMessage = {
          id: `aria-${Date.now()}`,
          type: 'aria',
          content: response.response || response.data?.response || 'Sorry, I couldn\'t process your request.',
          timestamp: new Date(),
          animation: 'typing'
        }
        
        setMessages(prev => [...prev, ariaMessage])
        setIsTyping(false)
        
        // Complete animation after typing effect
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === ariaMessage.id ? { ...msg, animation: 'complete' } : msg
          ))
        }, 1500)
      }, 800)
      
    } catch (error) {
      console.error('ARIA Error:', error)
      setIsTyping(false)
      
      const errorMessage: ARIAMessage = {
        id: `aria-error-${Date.now()}`,
        type: 'aria',
        content: "I apologize, but I'm experiencing some technical difficulties. However, I can see your dashboard shows strong performance across most metrics. Please try again, or feel free to ask me about specific data points you'd like me to analyze.",
        timestamp: new Date(),
        animation: 'complete'
      }
      
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const showNotification = (message: string, type: 'info' | 'warning' | 'success') => {
    const notification: ARIANotification = {
      id: `notif-${Date.now()}`,
      message,
      type,
      timestamp: new Date(),
      dismissed: false
    }
    
    setNotifications(prev => [...prev, notification])
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 8000)
  }

  return (
    <ARIAContext.Provider value={{
      isOpen,
      setIsOpen,
      messages,
      sendMessage,
      isTyping,
      suggestedPrompts,
      showNotification,
      notifications
    }}>
      {children}
    </ARIAContext.Provider>
  )
}
