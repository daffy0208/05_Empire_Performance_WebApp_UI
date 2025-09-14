import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-card rounded-lg p-6 shadow-elevation-1">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Zap" size={20} className="mr-2 text-primary" />
          Quick Actions
        </h2>
        
        <div className="space-y-3">
          {quickActions?.map((action, index) => (
            <Button
              key={index}
              variant={action?.variant}
              size="default"
              fullWidth
              onClick={action?.action}
              iconName={action?.icon}
              iconPosition="left"
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">{action?.title}</div>
                <div className="text-sm opacity-70">{action?.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
      {/* Monthly Stats */}
      <div className="bg-card rounded-lg p-6 shadow-elevation-1">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="BarChart3" size={20} className="mr-2 text-primary" />
          This Month
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <Icon name="Calendar" size={16} className="text-success mr-2" />
              <span className="text-sm text-muted-foreground">Sessions Completed</span>
            </div>
            <span className="font-semibold text-foreground">{stats?.monthlyCompleted}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <Icon name="DollarSign" size={16} className="text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Amount Spent</span>
            </div>
            <span className="font-semibold text-foreground">{formatCurrency(stats?.monthlySpent)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <Icon name="TrendingUp" size={16} className="text-accent mr-2" />
              <span className="text-sm text-muted-foreground">Progress Score</span>
            </div>
            <span className="font-semibold text-foreground">{stats?.progressScore}%</span>
          </div>
        </div>
      </div>
      {/* Notifications */}
      <div className="bg-card rounded-lg p-6 shadow-elevation-1">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Bell" size={20} className="mr-2 text-primary" />
          Notifications
        </h2>
        
        <div className="space-y-3">
          {stats?.notifications?.map((notification, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
              <Icon 
                name={notification?.type === 'reminder' ? 'Clock' : 
                      notification?.type === 'payment' ? 'CreditCard' : 'Info'} 
                size={16} 
                className="text-muted-foreground mt-0.5" 
              />
              <div className="flex-1">
                <p className="text-sm text-foreground">{notification?.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification?.time}</p>
              </div>
            </div>
          ))}
          
          {stats?.notifications?.length === 0 && (
            <div className="text-center py-4">
              <Icon name="CheckCircle" size={24} className="text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;