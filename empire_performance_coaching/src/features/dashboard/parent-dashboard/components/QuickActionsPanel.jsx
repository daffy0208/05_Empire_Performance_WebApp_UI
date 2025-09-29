import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/AppIcon';
import Button from '../../../../shared/components/ui/Button';

const QuickActionsPanel = ({ onManagePayments, stats }) => {
  const navigate = useNavigate();

  const handleBookNewSession = () => {
    navigate('/multi-step-booking-flow');
  };

  const quickActions = [
    {
      title: 'Book New Session',
      description: 'Schedule a new training session',
      icon: 'Plus',
      action: handleBookNewSession,
      variant: 'default'
    },
    {
      title: 'Manage Payments',
      description: 'Update payment methods',
      icon: 'CreditCard',
      action: onManagePayments,
      variant: 'outline'
    },
    {
      title: 'Contact Support',
      description: 'Get help with your account',
      icon: 'MessageCircle',
      action: () => console.log('Contact support'),
      variant: 'ghost'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    })?.format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#F5F5F5' }}>
          <Icon name="Zap" size={20} className="mr-2 text-[#C9A43B]" />
          Quick Actions
        </h2>

        <div className="space-y-3">
          {quickActions?.map((action, index) => (
            <button
              key={index}
              onClick={action?.action}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 ${
                action?.variant === 'default'
                  ? 'bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90'
                  : 'bg-[#2A2A2E] text-[#F5F5F5] hover:bg-[#C9A43B]/20 hover:text-[#C9A43B] border border-[#2A2A2E]'
              }`}
            >
              <div className="flex items-center">
                <Icon name={action?.icon} size={20} className="mr-3" />
                <div>
                  <div className="font-medium">{action?.title}</div>
                  <div className="text-sm opacity-70">{action?.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#F5F5F5' }}>
          <Icon name="BarChart3" size={20} className="mr-2 text-[#C9A43B]" />
          This Month
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#2A2A2E]/50 rounded-lg">
            <div className="flex items-center">
              <Icon name="Calendar" size={16} className="text-green-500 mr-2" />
              <span className="text-sm" style={{ color: '#CFCFCF' }}>Sessions Completed</span>
            </div>
            <span className="font-semibold" style={{ color: '#F5F5F5' }}>{stats?.monthlyCompleted}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#2A2A2E]/50 rounded-lg">
            <div className="flex items-center">
              <Icon name="DollarSign" size={16} className="text-[#C9A43B] mr-2" />
              <span className="text-sm" style={{ color: '#CFCFCF' }}>Amount Spent</span>
            </div>
            <span className="font-semibold" style={{ color: '#F5F5F5' }}>{formatCurrency(stats?.monthlySpent)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#2A2A2E]/50 rounded-lg">
            <div className="flex items-center">
              <Icon name="TrendingUp" size={16} className="text-blue-500 mr-2" />
              <span className="text-sm" style={{ color: '#CFCFCF' }}>Progress Score</span>
            </div>
            <span className="font-semibold" style={{ color: '#F5F5F5' }}>{stats?.progressScore}%</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#F5F5F5' }}>
          <Icon name="Bell" size={20} className="mr-2 text-[#C9A43B]" />
          Notifications
        </h2>

        <div className="space-y-3">
          {stats?.notifications?.map((notification, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-[#2A2A2E]/50 rounded-lg">
              <Icon
                name={notification?.type === 'reminder' ? 'Clock' :
                      notification?.type === 'payment' ? 'CreditCard' : 'Info'}
                size={16}
                className="mt-0.5"
                style={{ color: '#CFCFCF' }}
              />
              <div className="flex-1">
                <p className="text-sm" style={{ color: '#F5F5F5' }}>{notification?.message}</p>
                <p className="text-xs mt-1" style={{ color: '#CFCFCF' }}>{notification?.time}</p>
              </div>
            </div>
          ))}

          {(!stats?.notifications || stats?.notifications?.length === 0) && (
            <div className="text-center py-4">
              <Icon name="CheckCircle" size={24} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm" style={{ color: '#CFCFCF' }}>All caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;