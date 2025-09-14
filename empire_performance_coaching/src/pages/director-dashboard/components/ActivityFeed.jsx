import React from 'react';
import Icon from '../../../components/AppIcon';


const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: 'booking',
      title: "New session booked",
      description: "Sarah Johnson booked weekly sessions with Marcus Johnson",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      icon: 'Calendar',
      iconColor: 'text-success',
      iconBg: 'bg-success/10'
    },
    {
      id: 2,
      type: 'payment',
      title: "Payment received",
      description: "$200 payment processed for David Rodriguez sessions",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      icon: 'CreditCard',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10'
    },
    {
      id: 3,
      type: 'cancellation',
      title: "Session cancelled",
      description: "Emily Chen cancelled today\'s 3:00 PM session",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'XCircle',
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10'
    },
    {
      id: 4,
      type: 'coach_update',
      title: "Coach availability updated",
      description: "Michael Thompson added weekend availability",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      icon: 'Clock',
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10'
    },
    {
      id: 5,
      type: 'review',
      title: "New review received",
      description: "5-star review for Sarah Williams from parent",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: 'Star',
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10'
    },
    {
      id: 6,
      type: 'alert',
      title: "Low utilization alert",
      description: "Coach utilization below 70% threshold",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      icon: 'AlertTriangle',
      iconColor: 'text-error',
      iconBg: 'bg-error/10'
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest system events and updates</p>
          </div>
          <button className="text-primary hover:text-primary/80 text-sm font-medium transition-smooth">
            View All
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities?.map((activity, index) => (
            <div key={activity?.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity?.iconBg}`}>
                <Icon name={activity?.icon} size={16} className={activity?.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{activity?.title}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(activity?.timestamp)}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-center">
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth flex items-center space-x-1">
            <span>Load more activities</span>
            <Icon name="ChevronDown" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;