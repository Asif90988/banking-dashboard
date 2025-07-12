"use client";

import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function ARIATicker() {
  // Continuous stream of messages like Times Square
  const tickerMessages = [
    { icon: CurrencyDollarIcon, text: 'Budget Alert: Cybersecurity project 15% over allocation - optimization opportunities identified', type: 'warning' },
    { icon: ShieldCheckIcon, text: 'Compliance Update: 3 high-priority regulatory items require review before tomorrow\'s deadline', type: 'critical' },
    { icon: ArrowTrendingUpIcon, text: 'Performance Insight: Team project completion rate improved 12% this month - exceeding Q4 targets', type: 'success' },
    { icon: ExclamationTriangleIcon, text: 'Risk Analysis: Market volatility detected - recommend reviewing hedge positions in LATAM portfolio', type: 'warning' },
    { icon: ChartBarIcon, text: 'Efficiency Report: AI-driven process optimization saved $2.3M in operational costs this quarter', type: 'success' },
    { icon: ArrowTrendingUpIcon, text: 'Market Update: Brazilian real strengthening against USD - positive impact on regional revenue projections', type: 'info' },
    { icon: InformationCircleIcon, text: 'Strategic Insight: Cross-border regulatory alignment opportunities identified in Mexico operations', type: 'info' },
    { icon: CurrencyDollarIcon, text: 'Budget Optimization: Technology refresh cycle can be extended 6 months, saving $1.8M', type: 'success' },
    { icon: ShieldCheckIcon, text: 'Risk Mitigation: New compliance framework reduces regulatory exposure by 34%', type: 'success' },
    { icon: ArrowTrendingUpIcon, text: 'Performance Alert: SVP targets exceeded in 4 out of 6 departments this quarter', type: 'success' }
  ];

  // Create continuous stream by joining all messages
  const continuousStream = tickerMessages.map((msg, index) => (
    <div key={index} className={`flex items-center space-x-3 mx-12 ${
      msg.type === 'success' ? 'text-green-400' :
      msg.type === 'warning' ? 'text-yellow-400' :
      msg.type === 'critical' ? 'text-red-400' :
      'text-blue-400'
    }`}>
      <msg.icon className="h-4 w-4 flex-shrink-0" />
      <span className="text-white text-sm font-medium whitespace-nowrap">
        {msg.text}
      </span>
    </div>
  ));

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 border-b border-cyan-500/20 backdrop-blur-xl">
      <div className="flex items-center h-10 overflow-hidden">
        {/* ARIA Branding */}
        <div className="flex items-center space-x-2 px-4 flex-shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 z-20">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">AI</span>
          </div>
          <span className="text-white font-semibold text-xs">ARIA</span>
        </div>

        {/* Continuous Scrolling Ticker - Times Square Style */}
        <div className="flex-1 relative overflow-hidden">
          <motion.div
            animate={{ x: [0, '-100%'] }}
            transition={{ 
              duration: 60, 
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop'
            }}
            className="flex items-center whitespace-nowrap"
            style={{ width: '200%' }}
          >
            {/* First copy of all messages */}
            {continuousStream}
            {/* Second copy for seamless loop */}
            {continuousStream}
          </motion.div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center space-x-2 px-4 flex-shrink-0 z-20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-medium">LIVE</span>
        </div>
      </div>
    </div>
  );
}
