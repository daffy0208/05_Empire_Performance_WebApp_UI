import React from 'react';
import Icon from '../../../../shared/components/AppIcon';

const QuickStats = ({ stats, period = 'week' }) => {
  const statItems = [
    {
      id: 'sessions',
      label: 'Total Sessions',
      value: stats?.totalSessions || 0,
      icon: 'Calendar',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: stats?.sessionsChange || 0,
      format: (val) => val?.toString()
    },
    {
      id: 'attendance',
      label: 'Attendance Rate',
      value: stats?.attendanceRate || 0,
      icon: 'Users',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: stats?.attendanceChange || 0,
      format: (val) => `${val?.toFixed(1)}%`
    },
    {
      id: 'earnings',
      label: 'Total Earnings',
      value: stats?.totalEarnings || 0,
      icon: 'DollarSign',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: stats?.earningsChange || 0,
      format: (val) => `$${val?.toFixed(0)}`
    },
    {
      id: 'noShows',
      label: 'No Shows',
      value: stats?.noShows || 0,
      icon: 'AlertCircle',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: stats?.noShowsChange || 0,
      format: (val) => val?.toString()
    }
  ];

  const getChangeIcon = (change) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  const getChangeColor = (change, isNoShows = false) => {
    if (change === 0) return 'text-muted-foreground';
    if (isNoShows) {
      return change > 0 ? 'text-warning' : 'text-success';
    }
    return change > 0 ? 'text-success' : 'text-warning';
  };

  const formatChange = (change) => {
    if (change === 0) return '0%';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change?.toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Quick Stats</h2>
        <span className="text-sm text-muted-foreground capitalize">This {period}</span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {statItems?.map((item) => (
          <div key={item?.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${item?.bgColor} flex items-center justify-center`}>
                <Icon name={item?.icon} size={20} className={item?.color} />
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(item?.change, item?.id === 'noShows')}`}>
                <Icon name={getChangeIcon(item?.change)} size={14} />
                <span className="text-xs font-medium">{formatChange(item?.change)}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {item?.format(item?.value)}
              </div>
              <div className="text-sm text-muted-foreground">
                {item?.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Insights */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-3">Performance Insights</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Peak Session Time</span>
            <span className="text-sm font-medium text-foreground">{stats?.peakTime || '4:00 PM'}</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Most Active Day</span>
            <span className="text-sm font-medium text-foreground">{stats?.mostActiveDay || 'Wednesday'}</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Avg Session Size</span>
            <span className="text-sm font-medium text-foreground">{stats?.avgSessionSize || 8} players</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <span className="text-sm font-medium text-foreground">{stats?.completionRate || 95}%</span>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-smooth text-left">
            <Icon name="MessageSquare" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Message Parents</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-smooth text-left">
            <Icon name="FileText" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Export Reports</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-smooth text-left">
            <Icon name="Settings" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Update Availability</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;