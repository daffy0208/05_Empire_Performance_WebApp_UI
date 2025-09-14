import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeHeader = ({ parentName, children }) => {
  const currentTime = new Date();
  const greeting = currentTime?.getHours() < 12 ? 'Good morning' : 
                  currentTime?.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="bg-gradient-to-r from-[#0E0E10] to-[#141416] border-b border-[#2A2A2E]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Parent Info */}
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
            
            {/* Parent Welcome */}
            <div>
              <p className="text-sm text-[#CFCFCF]">Family Dashboard</p>
              <h1 className="text-xl font-semibold text-[#F5F5F5]">
                Welcome, {parentName || 'Parent'}
              </h1>
            </div>
          </div>

          {/* Right: Notifications and Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-header">Parent Dashboard</div>
              <div className="text-xs text-primary font-header font-semibold">Building Excellence</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-header font-bold text-foreground mb-1">
              {greeting}, {parentName}!
            </h1>
            <p className="text-muted-foreground font-body">
              Here's your training overview for today
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center bg-primary/10 rounded-lg px-4 py-2 border border-primary/20">
              <Icon name="Calendar" size={20} className="text-primary mr-2" />
              <div className="text-center">
                <div className="text-lg font-header font-bold text-foreground">{children}</div>
                <div className="text-xs text-muted-foreground font-header">Upcoming</div>
              </div>
            </div>
            
            <div className="flex items-center bg-success/10 rounded-lg px-4 py-2 border border-success/20">
              <Icon name="Users" size={20} className="text-success mr-2" />
              <div className="text-center">
                <div className="text-lg font-header font-bold text-foreground">{children}</div>
                <div className="text-xs text-muted-foreground font-header">Active</div>
              </div>
            </div>
            
            <div className="flex items-center bg-accent/10 rounded-lg px-4 py-2 border border-accent/20">
              <Icon name="Clock" size={20} className="text-accent mr-2" />
              <div className="text-center">
                <div className="text-lg font-header font-bold text-foreground">{children}</div>
                <div className="text-xs text-muted-foreground font-header">Hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;