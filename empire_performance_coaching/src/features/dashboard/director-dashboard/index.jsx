import React from 'react';

import AuthGuard from '../../components/ui/AuthGuard';
import SEO from '../../components/SEO';
import DashboardLayout from '../../components/layouts/DashboardLayout';


import MetricsCard from './components/MetricsCard';
const RevenueChart = React.lazy(() => import('./components/RevenueChart'));
import CoachPerformanceTable from './components/CoachPerformanceTable';
import ActivityFeed from './components/ActivityFeed';
import AlertsPanel from './components/AlertsPanel';
const BookingPatterns = React.lazy(() => import('./components/BookingPatterns'));
const CustomerAnalytics = React.lazy(() => import('./components/CustomerAnalytics'));
import Icon from '../../components/AppIcon';


const DirectorDashboard = () => {
  return (
    <DashboardLayout>
      <SEO title="Director Dashboard - Empire Performance Coaching" canonical="/director-dashboard" />
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0E0E10] to-[#141416] border-b border-[#2A2A2E] px-6 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Left: Logo + Director Info */}
          <div className="flex items-center space-x-6">
            {/* Empire Performance Logo - consistent h-8 sizing */}
            <div className="flex items-center">
              <img 
                src="/assets/images/Empire_Logo-1756660728269.png" 
                alt="Empire Performance Coaching" 
                className="h-8 w-auto object-contain"
                loading="lazy" decoding="async"
              />
              <div className="ml-2">
                <div className="text-[#C9A43B] font-bold text-sm tracking-wide">
                  EMPIRE
                </div>
                <div className="text-[#C9A43B] font-medium text-xs tracking-widest -mt-1">
                  PERFORMANCE
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="h-8 w-px bg-[#2A2A2E]"></div>
            
            {/* Director Welcome */}
            <div>
              <p className="text-sm text-[#CFCFCF]">Director Dashboard</p>
              <h1 className="text-xl font-semibold text-[#F5F5F5]">Empire Performance Overview</h1>
            </div>
          </div>

          {/* Right: Date + Notifications */}
          <div className="flex items-center space-x-2 bg-[#C9A43B]/10 border border-[#C9A43B]/20 rounded-lg px-3 py-2">
            <Icon name="Shield" size={20} className="text-[#C9A43B]" />
            <span className="text-sm font-medium text-[#C9A43B]">Director Access</span>
          </div>
        </div>
      </header>

      {/* Role-gated access for director only */}
      <AuthGuard allowedRoles={["director"]}>
        <div className="w-full px-6 md:px-8 py-8">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCard
              title="Total Revenue"
              value="£24,850"
              change="+12.3%"
              changeType="positive"
              trend="up"
              icon="DollarSign"
              description="This month"
            />
            <MetricsCard
              title="Active Athletes"
              value="187"
              change="+8.2%"
              changeType="positive"
              trend="up"
              icon="Users"
              description="Currently enrolled"
            />
            <MetricsCard
              title="Sessions Completed"
              value="342"
              change="+15.7%"
              changeType="positive"
              trend="up"
              icon="Calendar"
              description="This month"
            />
            <MetricsCard
              title="Coach Utilization"
              value="78%"
              change="-2.1%"
              changeType="negative"
              trend="down"
              icon="TrendingUp"
              description="Average across all coaches"
            />
          </div>

          {/* Main Analytics Grid */}
          <div className="grid gap-8 lg:grid-cols-3 mb-8">
            {/* Revenue & Booking Charts */}
            <div className="lg:col-span-2 space-y-6">
              <React.Suspense fallback={<div style={{ color: '#CFCFCF' }}>Loading charts...</div>}>
                <RevenueChart />
              </React.Suspense>
              <React.Suspense fallback={<div style={{ color: '#CFCFCF' }}>Loading booking patterns...</div>}>
                <BookingPatterns />
              </React.Suspense>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              <React.Suspense fallback={<div style={{ color: '#CFCFCF' }}>Loading analytics...</div>}>
                <CustomerAnalytics />
              </React.Suspense>
              <AlertsPanel />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CoachPerformanceTable />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </AuthGuard>
    </DashboardLayout>
  );
};

export default DirectorDashboard;