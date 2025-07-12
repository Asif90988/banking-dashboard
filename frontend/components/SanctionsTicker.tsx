"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  UserIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useSocket } from '@/hooks/useSocket';

interface SanctionsAlert {
  id: string;
  type: 'flagged_transaction' | 'sanctions_match' | 'compliance_alert';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  customerName?: string;
  amount?: number;
  currency?: string;
  matchedEntity?: string;
  confidence?: number;
}

export default function SanctionsTicker() {
  const { socket, connected } = useSocket();
  const [sanctionsAlerts, setSanctionsAlerts] = useState<SanctionsAlert[]>([]);

  // Default/sample sanctions alerts for demonstration
  const defaultAlerts: SanctionsAlert[] = [
    {
      id: '1',
      type: 'flagged_transaction',
      message: 'High-risk transaction flagged: $50,000 transfer to sanctioned jurisdiction - requires immediate review',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      customerName: 'ACME Corp',
      amount: 50000,
      currency: 'USD'
    },
    {
      id: '2',
      type: 'sanctions_match',
      message: 'Potential sanctions match detected: Customer name similarity 85% with OFAC list entry',
      severity: 'high',
      timestamp: new Date().toISOString(),
      matchedEntity: 'Sanctioned Individual',
      confidence: 85
    },
    {
      id: '3',
      type: 'compliance_alert',
      message: 'AML screening completed: 3 transactions require enhanced due diligence procedures',
      severity: 'medium',
      timestamp: new Date().toISOString()
    },
    {
      id: '4',
      type: 'flagged_transaction',
      message: 'Wire transfer blocked: Destination bank on restricted list - transaction automatically rejected',
      severity: 'high',
      timestamp: new Date().toISOString(),
      amount: 25000,
      currency: 'EUR'
    },
    {
      id: '5',
      type: 'sanctions_match',
      message: 'PEP screening alert: Customer identified as Politically Exposed Person - enhanced monitoring required',
      severity: 'medium',
      timestamp: new Date().toISOString()
    },
    {
      id: '6',
      type: 'compliance_alert',
      message: 'Sanctions list updated: 47 new entities added to watchlist - system automatically rescreening all customers',
      severity: 'low',
      timestamp: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Initialize with default alerts
    setSanctionsAlerts(defaultAlerts);

    if (connected && socket) {
      // Listen for real-time sanctions alerts
      socket.on('flagged-transaction', (data: any) => {
        const alert: SanctionsAlert = {
          id: Date.now().toString(),
          type: 'flagged_transaction',
          message: `Transaction flagged: ${data.customerName} - $${data.amount} ${data.currency} - Match confidence: ${data.matchScore}%`,
          severity: data.matchScore > 90 ? 'critical' : data.matchScore > 75 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
          customerName: data.customerName,
          amount: data.amount,
          currency: data.currency,
          confidence: data.matchScore
        };
        
        setSanctionsAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      });

      socket.on('sanctions-update', (data: any) => {
        const alert: SanctionsAlert = {
          id: Date.now().toString(),
          type: 'sanctions_match',
          message: `Sanctions database updated: ${data.entriesCount} new entries processed`,
          severity: 'low',
          timestamp: new Date().toISOString()
        };
        
        setSanctionsAlerts(prev => [alert, ...prev.slice(0, 9)]);
      });

      socket.on('compliance-update', (data: any) => {
        const alert: SanctionsAlert = {
          id: Date.now().toString(),
          type: 'compliance_alert',
          message: data.message || 'Compliance alert received',
          severity: data.severity || 'medium',
          timestamp: new Date().toISOString()
        };
        
        setSanctionsAlerts(prev => [alert, ...prev.slice(0, 9)]);
      });

      // Join sanctions monitoring room
      socket.emit('join-sanctions-monitoring');
    }

    return () => {
      if (socket) {
        socket.off('flagged-transaction');
        socket.off('sanctions-update');
        socket.off('compliance-update');
      }
    };
  }, [connected, socket]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'flagged_transaction':
        return BanknotesIcon;
      case 'sanctions_match':
        return UserIcon;
      case 'compliance_alert':
        return ShieldExclamationIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Create continuous stream by joining all alerts
  const continuousStream = sanctionsAlerts.map((alert, index) => {
    const IconComponent = getAlertIcon(alert.type);
    return (
      <div key={`${alert.id}-${index}`} className={`flex items-center space-x-3 mx-12 ${getAlertColor(alert.severity)}`}>
        <IconComponent className="h-4 w-4 flex-shrink-0" />
        <span className="text-white text-sm font-medium whitespace-nowrap">
          {alert.message}
        </span>
        <div className="flex items-center space-x-1 text-xs text-gray-400">
          <ClockIcon className="h-3 w-3" />
          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    );
  });

  return (
    <div className="w-full bg-gradient-to-r from-red-900/50 via-orange-900/50 to-red-900/50 border-b border-red-500/20 backdrop-blur-xl">
      <div className="flex items-center h-10 overflow-hidden">
        {/* Sanctions Branding */}
        <div className="flex items-center space-x-2 px-4 flex-shrink-0 bg-gradient-to-r from-red-600 to-orange-600 z-20">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <ShieldExclamationIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-semibold text-xs">SANCTIONS</span>
        </div>

        {/* Continuous Scrolling Ticker */}
        <div className="flex-1 relative overflow-hidden">
          <motion.div
            animate={{ x: [0, '-100%'] }}
            transition={{ 
              duration: 45, // Slightly faster than ARIA ticker
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop'
            }}
            className="flex items-center whitespace-nowrap"
            style={{ width: '200%' }}
          >
            {/* First copy of all alerts */}
            {continuousStream}
            {/* Second copy for seamless loop */}
            {continuousStream}
          </motion.div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 px-4 flex-shrink-0 z-20">
          <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className={`text-xs font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? 'MONITORING' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
}
