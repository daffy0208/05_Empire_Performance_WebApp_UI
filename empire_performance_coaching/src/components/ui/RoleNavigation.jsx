import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';


const RoleNavigation = ({ userRole = 'parent', userName = 'John Smith', onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = {
    parent: [
      { label: 'Dashboard', path: '/parent-dashboard', icon: 'Home' },
      { label: 'Book Session', path: '/multi-step-booking-flow', icon: 'Calendar' },
      { label: 'My Sessions', path: '/parent-dashboard?tab=sessions', icon: 'Clock' },
      { label: 'Payments', path: '/parent-dashboard?tab=payments', icon: 'CreditCard' }
    ],
    coach: [
      { label: 'Dashboard', path: '/coach-dashboard', icon: 'Home' },
      { label: 'Schedule', path: '/coach-dashboard?tab=schedule', icon: 'Calendar' },
      { label: 'Athletes', path: '/coach-dashboard?tab=athletes', icon: 'Users' },
      { label: 'Sessions', path: '/coach-dashboard?tab=sessions', icon: 'Activity' }
    ],
    director: [
      { label: 'Dashboard', path: '/director-dashboard', icon: 'Home' },
      { label: 'Analytics', path: '/director-dashboard?tab=analytics', icon: 'BarChart3' },
      { label: 'Coaches', path: '/director-dashboard?tab=coaches', icon: 'Users' },
      { label: 'Revenue', path: '/director-dashboard?tab=revenue', icon: 'DollarSign' }
    ]
  };

  const currentItems = navigationItems?.[userRole] || navigationItems?.parent;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    if (path?.includes('?')) {
      const [basePath, query] = path?.split('?');
      return location?.pathname === basePath && location?.search?.includes(query);
    }
    return location?.pathname === path;
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      parent: 'Parent',
      coach: 'Coach',
      director: 'Director'
    };
    return roleNames?.[role] || 'User';
  };

  const roleConfigs = {
    parent: {
      title: 'Parent Portal',
      color: 'bg-secondary',
      navigation: [
        { label: 'Dashboard', path: '/parent-dashboard', icon: 'Home' },
        { label: 'Book Session', path: '/multi-step-booking-flow', icon: 'Calendar' },
        { label: 'My Bookings', path: '/parent-dashboard', icon: 'Repeat' },
        { label: 'Invoices', path: '/parent-dashboard', icon: 'Receipt' }
      ]
    },
    coach: {
      title: 'Coach Portal',
      color: 'bg-secondary',
      navigation: [
        { label: 'Dashboard', path: '/coach-dashboard', icon: 'Home' },
        { label: 'My Schedule', path: '/coach-dashboard', icon: 'Calendar' },
        { label: 'Students', path: '/coach-dashboard', icon: 'Users' },
        { label: 'Earnings', path: '/coach-dashboard', icon: 'DollarSign' }
      ]
    },
    director: {
      title: 'Director Portal',
      color: 'bg-secondary',
      navigation: [
        { label: 'Dashboard', path: '/director-dashboard', icon: 'Home' },
        { label: 'Analytics', path: '/director-dashboard', icon: 'BarChart3' },
        { label: 'Coaches', path: '/director-dashboard', icon: 'Users' },
        { label: 'Reports', path: '/director-dashboard', icon: 'FileText' }
      ]
    }
  };

  const config = roleConfigs?.[userRole] || roleConfigs?.parent;

  return (
    <nav className={`${config?.color} text-white shadow-lg`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand with Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/FB_IMG_1755863428093-1756598640896.jpg" 
                alt="Empire Performance Coaching" 
                className="h-8 w-auto object-contain bg-white rounded p-1"
                loading="lazy" decoding="async"
              />
              <div>
                <span className="text-lg font-header font-bold">{config?.title}</span>
                <div className="text-xs text-primary font-header font-medium -mt-1">EMPIRE PERFORMANCE</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 ml-8">
              {config?.navigation?.map((item) => (
                <button
                  key={item?.label}
                  onClick={() => navigate(item?.path)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-header font-medium hover:bg-white/10 transition-smooth"
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-smooth"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} className="text-secondary" />
              </div>
              <span className="hidden sm:block text-sm font-header font-medium">{userName}</span>
              <Icon name="ChevronDown" size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-secondary border-b">
                  <p className="font-header font-medium">{userName}</p>
                  <p className="text-muted-foreground capitalize font-header">{userRole}</p>
                </div>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-secondary hover:bg-gray-100 font-header">
                  <Icon name="Settings" size={16} />
                  <span>Settings</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-secondary hover:bg-gray-100 font-header">
                  <Icon name="HelpCircle" size={16} />
                  <span>Help</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-secondary hover:bg-gray-100 border-t font-header"
                >
                  <Icon name="LogOut" size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4 border-t border-white/20">
          <div className="grid grid-cols-2 gap-2">
            {config?.navigation?.map((item) => (
              <button
                key={item?.label}
                onClick={() => navigate(item?.path)}
                className="flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-header font-medium hover:bg-white/10 transition-smooth"
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RoleNavigation;