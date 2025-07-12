# 📱 Mobile Optimization Guide - Citi LATAM RegInsight Dashboard

**Project**: Banking Regulatory Compliance Dashboard  
**Strategy**: Dedicated Mobile Routes (/m/ routes)  
**Status**: Implementation Ready  
**Created**: January 12, 2025  
**Version**: 1.0  

---

## 📋 Executive Summary

This guide outlines the complete strategy for adding mobile competence to the Citi LATAM RegInsight Dashboard without disturbing the existing desktop functionality. The chosen approach uses dedicated mobile routes (`/m/`) to provide a completely separate, optimized mobile experience.

### **🎯 Key Benefits:**
- ✅ **Zero Risk**: Existing desktop functionality remains completely untouched
- ✅ **Optimal Mobile UX**: Purpose-built mobile interfaces for complex executive dashboards
- ✅ **Safe Testing**: Isolated mobile development and testing environment
- ✅ **Gradual Rollout**: Can launch mobile features incrementally
- ✅ **Easy Maintenance**: Clear separation between desktop and mobile codebases

---

## 🏗️ Technical Architecture

### **Route Structure**
```
Current Desktop Routes (Unchanged):     New Mobile Routes:
/                                      /m                    (mobile dashboard)
/svp/vinod                            /m/svp/vinod          (mobile executive)
/budget-test                          /m/budget             (mobile budget)
/compliance-test                      /m/compliance         (mobile compliance)
/ai-analytics                         /m/analytics          (mobile analytics)
/connected-data                       /m/data               (mobile data)
/insights                             /m/insights           (mobile insights)
```

### **File Structure**
```
frontend/
├── app/
│   ├── (existing routes - unchanged)
│   └── m/                           # NEW: Mobile routes
│       ├── page.tsx                 # Mobile dashboard
│       ├── layout.tsx               # Mobile layout
│       ├── svp/
│       │   └── [id]/
│       │       └── page.tsx         # Mobile executive dashboard
│       ├── budget/
│       │   └── page.tsx             # Mobile budget management
│       ├── compliance/
│       │   └── page.tsx             # Mobile compliance
│       ├── analytics/
│       │   └── page.tsx             # Mobile AI analytics
│       ├── data/
│       │   └── page.tsx             # Mobile connected data
│       └── insights/
│           └── page.tsx             # Mobile insights
├── components/
│   ├── (existing components - unchanged)
│   └── mobile/                      # NEW: Mobile components
│       ├── MobileNavigation.tsx
│       ├── MobileHeader.tsx
│       ├── MobileVinodBudgetDashboard.tsx
│       ├── MobileVinodComplianceDashboard.tsx
│       ├── MobileChartComponents.tsx
│       ├── MobileDataTable.tsx
│       └── MobileTouchOptimized.tsx
└── hooks/
    ├── (existing hooks - unchanged)
    └── useDeviceDetection.ts          # NEW: Device detection
```

---

## ⚡ Implementation Phases

### **Phase 1: Mobile Foundation (Week 1)**

#### **Day 1-2: Mobile Route Structure**
1. Create `/m/` route directory structure
2. Set up mobile layout component
3. Implement basic mobile navigation
4. Create device detection utilities

#### **Day 3-4: Mobile Navigation System**
1. Bottom tab navigation for primary sections
2. Mobile hamburger menu for secondary features
3. Touch-optimized navigation interactions
4. Swipe gesture support

#### **Day 5-7: Basic Mobile Dashboard**
1. Mobile-optimized main dashboard
2. Key metrics cards for mobile
3. Touch-friendly interactions
4. Basic responsive layouts

### **Phase 2: Executive Mobile Features (Week 2)**

#### **Day 8-10: Mobile Executive Dashboard**
1. Mobile VinodBudgetDashboard with swipeable charts
2. Mobile VinodComplianceDashboard with simplified views
3. Mobile-friendly VP performance cards
4. Touch-optimized team navigation

#### **Day 11-12: Mobile Data Visualizations**
1. Mobile-optimized pie charts (one at a time)
2. Swipeable chart sections
3. Touch-friendly chart interactions
4. Mobile-appropriate data density

#### **Day 13-14: Mobile Forms & Interactions**
1. Mobile budget allocation interface
2. Touch-optimized form controls
3. Mobile-friendly modals and dropdowns
4. Gesture-based interactions

### **Phase 3: Polish & Optimization (Week 3)**

#### **Day 15-17: Performance Optimization**
1. Mobile-specific performance optimizations
2. Lazy loading for mobile components
3. Touch response optimization
4. Mobile asset optimization

#### **Day 18-19: PWA Features**
1. Progressive Web App setup
2. Offline functionality
3. App-like mobile experience
4. Mobile app installation prompts

#### **Day 20-21: Testing & Refinement**
1. Cross-device testing
2. Performance benchmarking
3. User experience refinement
4. Executive feedback integration

---

## 💻 Detailed Implementation Steps

### **Step 1: Create Mobile Route Structure**

```bash
# Create mobile route directories
mkdir -p frontend/app/m/svp/[id]
mkdir -p frontend/app/m/budget
mkdir -p frontend/app/m/compliance
mkdir -p frontend/app/m/analytics
mkdir -p frontend/app/m/data
mkdir -p frontend/app/m/insights

# Create mobile components directory
mkdir -p frontend/components/mobile
```

### **Step 2: Mobile Layout Component**

**File: `frontend/app/m/layout.tsx`**
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { ARIAProvider } from '../../components/aria/ARIAProvider'
import MobileNavigation from '../../components/mobile/MobileNavigation'
import MobileHeader from '../../components/mobile/MobileHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Citi LATAM Mobile - RegInsight Dashboard',
  description: 'Mobile-optimized regulatory compliance and risk management dashboard',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function MobileRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} mobile-optimized`}>
        <ARIAProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            <MobileHeader />
            <main className="pb-20">
              {children}
            </main>
            <MobileNavigation />
          </div>
        </ARIAProvider>
      </body>
    </html>
  )
}
```

### **Step 3: Mobile Navigation Component**

**File: `frontend/components/mobile/MobileNavigation.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, path: '/m' },
  { id: 'budget', name: 'Budget', icon: CurrencyDollarIcon, path: '/m/budget' },
  { id: 'compliance', name: 'Compliance', icon: ShieldCheckIcon, path: '/m/compliance' },
  { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, path: '/m/analytics' },
  { id: 'insights', name: 'Insights', icon: EyeIcon, path: '/m/insights' },
];

export default function MobileNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50"
    >
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                className={`p-2 rounded-lg ${
                  isActive ? 'bg-cyan-500/20' : 'bg-transparent'
                }`}
              >
                <item.icon className="h-6 w-6" />
              </motion.div>
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
```

### **Step 4: Mobile Dashboard**

**File: `frontend/app/m/page.tsx`**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import MobileKPICards from '../../components/mobile/MobileKPICards';
import MobileExecutiveCards from '../../components/mobile/MobileExecutiveCards';
import MobileActivityFeed from '../../components/mobile/MobileActivityFeed';

export default function MobileDashboard() {
  const router = useRouter();
  const [currentExecutive, setCurrentExecutive] = useState<any>(null);

  useEffect(() => {
    const executiveData = localStorage.getItem('currentExecutive');
    if (!executiveData) {
      router.push('/login');
      return;
    }
    setCurrentExecutive(JSON.parse(executiveData));
  }, [router]);

  if (!currentExecutive) {
    return <MobileLoadingScreen />;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, {currentExecutive.name}
        </h1>
        <p className="text-gray-400">{currentExecutive.title}</p>
      </motion.div>

      {/* KPI Cards */}
      <MobileKPICards />

      {/* Executive Quick Access */}
      <MobileExecutiveCards currentExecutive={currentExecutive} />

      {/* Activity Feed */}
      <MobileActivityFeed />
    </div>
  );
}

function MobileLoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full mb-4 mx-auto">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">CITI LATAM</h2>
        <p className="text-cyan-400">Loading Mobile Dashboard...</p>
      </motion.div>
    </div>
  );
}
```

### **Step 5: Mobile VinodBudgetDashboard**

**File: `frontend/components/mobile/MobileVinodBudgetDashboard.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CurrencyDollarIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

interface MobileVinodBudgetDashboardProps {
  vpBudgetData: any[];
}

export default function MobileVinodBudgetDashboard({ vpBudgetData }: MobileVinodBudgetDashboardProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'charts' | 'details'>('overview');
  const [selectedVP, setSelectedVP] = useState(0);

  const totalBudgetAllocated = vpBudgetData.reduce((sum, vp) => sum + vp.budgetAllocated, 0);
  const totalBudgetSpent = vpBudgetData.reduce((sum, vp) => sum + vp.budgetSpent, 0);
  const avgUtilization = vpBudgetData.reduce((sum, vp) => sum + vp.budgetUtilization, 0) / vpBudgetData.length;

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-white mb-2">Budget Management</h1>
        <p className="text-gray-400">Executive Budget Control</p>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex space-x-2 p-1 bg-black/20 rounded-xl">
        {[
          { id: 'overview', name: 'Overview', icon: ChartBarIcon },
          { id: 'charts', name: 'Charts', icon: ChartBarIcon },
          { id: 'details', name: 'Details', icon: CurrencyDollarIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              currentView === tab.id
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content Views */}
      <AnimatePresence mode="wait">
        {currentView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Mobile KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(totalBudgetAllocated)}</p>
                  <p className="text-gray-400 text-sm">Total Allocated</p>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalBudgetSpent)}</p>
                  <p className="text-gray-400 text-sm">Total Spent</p>
                </div>
              </div>
            </div>

            {/* Mobile VP Cards */}
            <div className="space-y-3">
              {vpBudgetData.map((vp, index) => (
                <motion.div
                  key={vp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold">{vp.avatar}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{vp.name}</h3>
                        <p className="text-gray-400 text-sm">{vp.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{vp.budgetUtilization.toFixed(1)}%</p>
                      <p className="text-gray-400 text-xs">Utilization</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${vp.budgetUtilization}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className={`h-2 rounded-full ${
                        vp.budgetUtilization > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        vp.budgetUtilization > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        'bg-gradient-to-r from-green-400 to-emerald-500'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {currentView === 'charts' && (
          <motion.div
            key="charts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Swipeable Chart Section */}
            <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedVP(Math.max(0, selectedVP - 1))}
                  disabled={selectedVP === 0}
                  className="p-2 rounded-lg bg-white/10 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-white" />
                </button>
                <h3 className="text-white font-semibold">VP Budget Distribution</h3>
                <button
                  onClick={() => setSelectedVP(Math.min(vpBudgetData.length - 1, selectedVP + 1))}
                  disabled={selectedVP === vpBudgetData.length - 1}
                  className="p-2 rounded-lg bg-white/10 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5 text-white" />
                </button>
              </div>
              
              {/* Mobile-optimized chart would go here */}
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
                <p className="text-gray-400">Mobile Chart: {vpBudgetData[selectedVP]?.name}</p>
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Detailed VP Information */}
            {vpBudgetData.map((vp, index) => (
              <div key={vp.id} className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${vp.color} rounded-xl flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">{vp.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{vp.name}</h3>
                    <p className="text-gray-400">{vp.title}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-xl font-bold text-green-400">{formatCurrency(vp.budgetAllocated)}</p>
                    <p className="text-gray-400 text-xs">Allocated</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-xl font-bold text-blue-400">{formatCurrency(vp.budgetSpent)}</p>
                    <p className="text-gray-400 text-xs">Spent</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 📱 Mobile-Specific Features

### **1. Touch Optimization**
- **Minimum Touch Target**: 44px (Apple guidelines)
- **Touch Feedback**: Visual feedback for all interactions
- **Gesture Support**: Swipe navigation between sections
- **Haptic Feedback**: Where supported by device

### **2. Mobile Navigation Patterns**
- **Bottom Tab Navigation**: Primary sections always accessible
- **Hamburger Menu**: Secondary features and settings
- **Swipe Gestures**: Navigate between charts and data views
- **Pull-to-Refresh**: Update data with pull gesture

### **3. Data Visualization Adaptations**
- **Single Chart View**: One chart at a time for mobile
- **Swipeable Charts**: Navigate between different visualizations
- **Simplified Legends**: Mobile-appropriate chart legends
- **Touch Interactions**: Tap to highlight, pinch to zoom

### **4. Progressive Web App (PWA) Features**
- **App Installation**: Add to home screen capability
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Executive alerts and updates
- **App-like Experience**: Full-screen mobile app feel

---

## 🧪 Testing Strategy

### **Device Testing Checklist**
- [ ] iPhone 12/13/14/15 (various sizes)
- [ ] Samsung Galaxy S21/S22/S23
- [ ] iPad (tablet optimization)
- [ ] Android tablets
- [ ] Various screen densities and orientations

### **Performance Benchmarks**
- [ ] **Load Time**: < 3 seconds on 3G
- [ ] **Touch Response**: < 100ms
- [ ] **Smooth Animations**: 60fps
- [ ] **Memory Usage**: < 100MB
- [ ] **Battery Impact**: Minimal drain

### **User Experience Criteria**
- [ ] **Navigation**: Intuitive mobile navigation
- [ ] **Readability**: Text legible on small screens
- [ ] **Touch Targets**: All buttons easily tappable
- [ ] **Data Density**: Appropriate information hierarchy
- [ ] **Performance**: Smooth interactions throughout

---

## 🚀 Deployment Strategy

### **Phase 1: Internal Testing**
1. Deploy mobile routes to staging environment
2. Test with internal team members
3. Gather feedback and iterate
4. Performance optimization

### **Phase 2: Executive Beta**
1. Invite select executives to test mobile version
2. Provide `/m/` URLs for testing
3. Collect usage analytics and feedback
4. Refine based on executive needs

### **Phase 3: Automatic Redirection**
1. Implement device detection
2. Automatically redirect mobile users to `/m/` routes
3. Provide option to switch to desktop version
4. Monitor usage patterns and performance

### **Rollback Plan**
- Remove automatic redirection
- Keep `/m/` routes available for manual access
- No impact on desktop functionality
- Easy to disable mobile features if needed

---

## ⚙️ Technical Requirements

### **Dependencies to Add**
```json
{
  "dependencies": {
    "react-spring": "^9.7.3",
    "react-intersection-observer": "^9.5.3",
    "workbox-webpack-plugin": "^7.0.0",
    "react-swipeable": "^7.0.1"
  }
}
```

### **Configuration Changes**

**Update `next.config.ts`:**
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing config...
  
  // PWA Configuration
  experimental: {
    appDir: true,
  },
  
  // Mobile optimizations
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
```

**Add to `tailwind.config.js`:**
```javascript
module.exports = {
  // Existing config...
  
  theme: {
    extend: {
      // Mobile-specific utilities
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // Touch-friendly sizes
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
}
```

---

## 📋 Component Mapping

### **Desktop → Mobile Component Mapping**
```
Desktop Component                    Mobile Component
├── Dashboard                       ├── MobileDashboard
├── VinodBudgetDashboard           ├── MobileVinodBudgetDashboard
├── VinodComplianceDashboard       ├── MobileVinodComplianceDashboard
├── BudgetAnalytics                ├── MobileBudgetAnalytics
├── ComplianceAnalytics            ├── MobileComplianceAnalytics
├── ProjectsAnalytics              ├── MobileProjectsAnalytics
├── RiskAnalytics                  ├── MobileRiskAnalytics
├── Sidebar Navigation             ├── MobileBottomNavigation
├── Header                         ├── MobileHeader
├── Modal Components               ├── MobileBottomSheet
├── Dropdown Menus                 ├── MobilePicker
└── Data Tables                    └── MobileCardList
```

### **API Integration**
- **Reuse Existing APIs**: No backend changes required
- **Same Data Sources**: All existing endpoints work with mobile
- **Optimized Payloads**: Consider mobile-specific data filtering
- **Caching Strategy**: Implement mobile-appropriate caching

---

## 🔧 Development Utilities

### **Device Detection Hook**
```typescript
// hooks/useDeviceDetection.ts
import { useState, useEffect } from 'react';

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    userAgent: '',
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      setDeviceInfo({
        isMobile: width < 768 || /iPhone|iPod|Android.*Mobile/i.test(userAgent),
        isTablet: (width >= 768 && width < 1024) || /iPad|Android(?!.*Mobile)/i.test(userAgent),
        isDesktop: width >= 1024 && !/iPhone|iPad|iPod|Android/i.test(userAgent),
        screenWidth: width,
        userAgent,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
}
```

### **Mobile Redirect Utility**
```typescript
// utils/mobileRedirect.ts
export function shouldRedirectToMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isMobile = window.innerWidth < 768 || 
    /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);
  
  const hasDesktopPreference = localStorage.getItem('preferDesktop') === 'true';
  const isAlreadyOnMobile = window.location.pathname.startsWith('/m');
  
  return isMobile && !hasDesktopPreference && !isAlreadyOnMobile;
}

export function redirectToMobile() {
  const currentPath = window.location.pathname;
  const mobileRouteMap: { [key: string]: string } = {
    '/': '/m',
    '/svp/vinod': '/m/svp/vinod',
    '/budget-test': '/m/budget',
    '/compliance-test': '/m/compliance',
    '/ai-analytics': '/m/analytics',
    '/connected-data': '/m/data',
    '/insights': '/m/insights',
  };
  
  const mobilePath = mobileRouteMap[currentPath] || '/m';
  window.location.href = mobilePath;
}
```

---

## 📊 Success Metrics

### **Technical Metrics**
- **Mobile Load Time**: < 3 seconds
- **Touch Response Time**: < 100ms
- **Mobile Conversion Rate**: > 80% of desktop functionality
- **Error Rate**: < 1% on
