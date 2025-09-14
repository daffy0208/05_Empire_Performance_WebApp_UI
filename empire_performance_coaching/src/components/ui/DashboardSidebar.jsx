import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const DashboardSidebar = ({ 
  userRole = 'director', 
  isCollapsed = false, 
  onToggle,
  className = '' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['main']);

  const sidebarSections = {
    director: [
      {
        id: 'main',
        label: 'Overview',
        items: [
          { label: 'Dashboard', path: '/director-dashboard', icon: 'Home' },
          { label: 'Analytics', path: '/director-dashboard?tab=analytics', icon: 'BarChart3' },
          { label: 'Reports', path: '/director-dashboard?tab=reports', icon: 'FileText' }
        ]
      },
      {
        id: 'management',
        label: 'Management',
        items: [
          { label: 'Coaches', path: '/director-dashboard?tab=coaches', icon: 'Users' },
          { label: 'Athletes', path: '/director-dashboard?tab=athletes', icon: 'User' },
          { label: 'Programs', path: '/director-dashboard?tab=programs', icon: 'BookOpen' }
        ]
      },
      {
        id: 'business',
        label: 'Business',
        items: [
          { label: 'Revenue', path: '/director-dashboard?tab=revenue', icon: 'DollarSign' },
          { label: 'Payments', path: '/director-dashboard?tab=payments', icon: 'CreditCard' },
          { label: 'Billing', path: '/director-dashboard?tab=billing', icon: 'Receipt' }
        ]
      },
      {
        id: 'settings',
        label: 'Settings',
        items: [
          { label: 'Organization', path: '/director-dashboard?tab=organization', icon: 'Building' },
          { label: 'Integrations', path: '/director-dashboard?tab=integrations', icon: 'Plug' },
          { label: 'Security', path: '/director-dashboard?tab=security', icon: 'Shield' }
        ]
      }
    ],
    coach: [
      {
        id: 'main',
        label: 'Daily Tools',
        items: [
          { label: 'Dashboard', path: '/coach-dashboard', icon: 'Home' },
          { label: 'Today\'s Schedule', path: '/coach-dashboard?tab=schedule', icon: 'Calendar' },
          { label: 'Quick Actions', path: '/coach-dashboard?tab=actions', icon: 'Zap' }
        ]
      },
      {
        id: 'athletes',
        label: 'Athletes',
        items: [
          { label: 'My Athletes', path: '/coach-dashboard?tab=athletes', icon: 'Users' },
          { label: 'Progress Tracking', path: '/coach-dashboard?tab=progress', icon: 'TrendingUp' },
          { label: 'Attendance', path: '/coach-dashboard?tab=attendance', icon: 'CheckCircle' }
        ]
      },
      {
        id: 'sessions',
        label: 'Sessions',
        items: [
          { label: 'Session History', path: '/coach-dashboard?tab=sessions', icon: 'Activity' },
          { label: 'Session Plans', path: '/coach-dashboard?tab=plans', icon: 'FileText' },
          { label: 'Evaluations', path: '/coach-dashboard?tab=evaluations', icon: 'Star' }
        ]
      }
    ]
  };

  const currentSections = sidebarSections?.[userRole] || sidebarSections?.director;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSection = (sectionId) => {
    if (isCollapsed) return;
    
    setExpandedSections(prev => 
      prev?.includes(sectionId) 
        ? prev?.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (path) => {
    if (path?.includes('?')) {
      const [basePath, query] = path?.split('?');
      return location?.pathname === basePath && location?.search?.includes(query);
    }
    return location?.pathname === path;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:w-64 ${isCollapsed ? 'lg:w-16' : ''} ${className}`}>
        <div className="flex flex-col flex-grow bg-card border-r border-border pt-16">
          {/* Logo Section */}
          <div className="flex items-center justify-center px-4 py-6 border-b border-border">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <img 
                  src="/assets/images/1000022092-1756649639106.png" 
                  alt="Empire Performance Coaching" 
                  className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                  loading="lazy" decoding="async"
                  style={{ filter: 'sepia(100%) saturate(200%) hue-rotate(35deg) brightness(1.2) contrast(1.1) invert(1)' }}
                />
                <div>
                  <h2 className="text-sm font-header font-bold text-secondary leading-tight">
                    EMPIRE PERFORMANCE
                  </h2>
                  <p className="text-xs font-header font-semibold text-primary -mt-1">
                    COACHING
                  </p>
                </div>
              </div>
            ) : (
              <img 
                src="/assets/images/1000022092-1756649639106.png" 
                alt="Empire Performance Coaching" 
                className="h-6 sm:h-8 w-auto object-contain"
                loading="lazy" decoding="async"
                style={{ filter: 'sepia(100%) saturate(200%) hue-rotate(35deg) brightness(1.2) contrast(1.1) invert(1)' }}
              />
            )}
          </div>

          {/* Toggle Button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            {!isCollapsed && (
              <h2 className="text-lg font-header font-semibold text-foreground">Navigation</h2>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-muted transition-smooth"
            >
              <Icon 
                name={isCollapsed ? "ChevronRight" : "ChevronLeft"} 
                size={16} 
                className="text-muted-foreground" 
              />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {currentSections?.map((section) => (
              <div key={section?.id} className="space-y-1">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleSection(section?.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-header font-medium text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    <span>{section?.label}</span>
                    <Icon 
                      name={expandedSections?.includes(section?.id) ? "ChevronDown" : "ChevronRight"} 
                      size={14} 
                    />
                  </button>
                )}
                
                {(isCollapsed || expandedSections?.includes(section?.id)) && (
                  <div className={`space-y-1 ${!isCollapsed ? 'ml-2' : ''}`}>
                    {section?.items?.map((item) => (
                      <button
                        key={item?.path}
                        onClick={() => handleNavigation(item?.path)}
                        className={`flex items-center w-full px-3 py-2 text-sm font-header font-medium rounded-md transition-smooth ${
                          isActive(item?.path)
                            ? 'bg-primary text-secondary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        title={isCollapsed ? item?.label : undefined}
                      >
                        <Icon name={item?.icon} size={16} className={isCollapsed ? '' : 'mr-3'} />
                        {!isCollapsed && <span>{item?.label}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
      {/* Mobile Drawer Overlay */}
      <div className="lg:hidden">
        {/* This would be implemented with a mobile drawer component */}
        {/* For now, mobile navigation is handled by RoleNavigation bottom tabs */}
      </div>
      {/* Desktop Content Spacer */}
      <div className={`hidden lg:block ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}></div>
    </>
  );
};

export default DashboardSidebar;