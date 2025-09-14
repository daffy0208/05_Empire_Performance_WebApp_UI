import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      title: "Payment Processing Issue",
      message: "3 payments failed to process automatically. Manual intervention required.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      actionRequired: true,
      dismissed: false
    },
    {
      id: 2,
      type: 'warning',
      title: "Low Coach Utilization",
      message: "2 coaches have utilization rates below 70% this week.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actionRequired: true,
      dismissed: false
    },
    {
      id: 3,
      type: 'info',
      title: "Monthly Report Ready",
      message: "August performance report is ready for review and export.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      actionRequired: false,
      dismissed: false
    },
    {
      id: 4,
      type: 'warning',
      title: "Upcoming Session Conflicts",
      message: "5 potential scheduling conflicts detected for next week.",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      actionRequired: true,
      dismissed: false
    }
  ]);

  const handleDismiss = (alertId) => {
    setAlerts(prev => prev?.map(alert => 
      alert?.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const handleAction = (alertId) => {
    // Handle specific alert actions
    console.log('Taking action for alert:', alertId);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  const getAlertColors = (type) => {
    switch (type) {
      case 'critical': 
        return {
          icon: 'text-error',
          bg: 'bg-error/10',
          border: 'border-error/20'
        };
      case 'warning': 
        return {
          icon: 'text-warning',
          bg: 'bg-warning/10',
          border: 'border-warning/20'
        };
      case 'info': 
        return {
          icon: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary/20'
        };
      default: 
        return {
          icon: 'text-muted-foreground',
          bg: 'bg-muted/10',
          border: 'border-border'
        };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return `${hours}h ago`;
    }
  };

  const activeAlerts = alerts?.filter(alert => !alert?.dismissed);
  const criticalCount = activeAlerts?.filter(alert => alert?.type === 'critical')?.length;
  const warningCount = activeAlerts?.filter(alert => alert?.type === 'warning')?.length;

  return (
    <div className="bg-card rounded-lg border border-border shadow-elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Alerts</h3>
            <p className="text-sm text-muted-foreground">
              {criticalCount} critical, {warningCount} warnings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {criticalCount > 0 && (
                <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
              )}
              <Icon name="Bell" size={20} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {activeAlerts?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-3" />
            <p className="text-foreground font-medium">All Clear!</p>
            <p className="text-sm text-muted-foreground">No active alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts?.map((alert) => {
              const colors = getAlertColors(alert?.type);
              return (
                <div 
                  key={alert?.id} 
                  className={`p-4 rounded-lg border ${colors?.bg} ${colors?.border} transition-smooth`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${colors?.bg}`}>
                      <Icon name={getAlertIcon(alert?.type)} size={14} className={colors?.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{alert?.title}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(alert?.timestamp)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert?.message}</p>
                      
                      {alert?.actionRequired && (
                        <div className="flex items-center space-x-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAction(alert?.id)}
                          >
                            Take Action
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDismiss(alert?.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                      
                      {!alert?.actionRequired && (
                        <div className="flex items-center justify-end mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDismiss(alert?.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {activeAlerts?.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activeAlerts?.length} active alert{activeAlerts?.length !== 1 ? 's' : ''}
            </p>
            <button className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
              View Alert History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;