import React from 'react';

import Button from '../../../../shared/components/ui/Button';

const CoachHeader = ({ coachName, currentDate, todaySessionCount, notifications = [] }) => {
  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date()?.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const hasUnreadNotifications = notifications?.some(n => !n?.read);

  return (
    <header className="bg-gradient-to-r from-[#0E0E10] to-[#141416] border-b border-[#2A2A2E] px-6 py-4">
      <div className="flex items-center justify-between w-full">
        {/* Left: Logo + Coach Info */}
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
          
          {/* Coach Welcome */}
          <div>
            <p className="text-sm text-[#CFCFCF]">Welcome back,</p>
            <h1 className="text-xl font-semibold text-[#F5F5F5]">{coachName || 'Coach'}</h1>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              iconName="Bell"
              className="relative"
            >
              {hasUnreadNotifications && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
              )}
            </Button>
          </div>

          {/* Quick Actions Dropdown */}
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
            className="font-header font-semibold"
          >
            Quick Action
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CoachHeader;