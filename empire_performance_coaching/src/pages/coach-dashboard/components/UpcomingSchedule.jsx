import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingSchedule = ({ upcomingSessions, onViewAll }) => {
  const getTimeUntilSession = (startTime) => {
    const now = new Date();
    const sessionTime = new Date(startTime);
    const diffMs = sessionTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes} min` : 'Starting soon';
    }
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'individual': return 'User';
      case 'group': return 'Users';
      case 'team': return 'Shield';
      default: return 'Calendar';
    }
  };

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'individual': return 'text-primary bg-primary/10';
      case 'group': return 'text-success bg-success/10';
      case 'team': return 'text-accent bg-accent/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Upcoming Sessions</h2>
        {upcomingSessions?.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            iconName="ArrowRight"
            iconPosition="right"
          >
            View All
          </Button>
        )}
      </div>
      {upcomingSessions?.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <Icon name="Calendar" size={32} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">No upcoming sessions</h3>
          <p className="text-sm text-muted-foreground">Your schedule is clear for now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingSessions?.slice(0, 5)?.map((session) => (
            <div key={session?.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-elevation-1 transition-smooth">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSessionTypeColor(session?.type)}`}>
                    <Icon name={getSessionTypeIcon(session?.type)} size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{session?.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={14} />
                        <span>
                          {new Date(session.startTime)?.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })} at {new Date(session.startTime)?.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">
                    {getTimeUntilSession(session?.startTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">away</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{session?.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {session?.playerCount} player{session?.playerCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {session?.hasNotes && (
                    <div className="w-2 h-2 bg-accent rounded-full" title="Has session notes"></div>
                  )}
                  {session?.isRecurring && (
                    <Icon name="Repeat" size={14} className="text-muted-foreground" title="Recurring session" />
                  )}
                  {session?.weatherAlert && (
                    <Icon name="CloudRain" size={14} className="text-warning" title="Weather alert" />
                  )}
                </div>
              </div>

              {session?.specialInstructions && (
                <div className="mt-3 p-2 bg-muted/50 rounded border-l-2 border-primary">
                  <p className="text-sm text-foreground">{session?.specialInstructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Weather Widget */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">Today's Weather</h3>
          <Icon name="Sun" size={20} className="text-warning" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">72°F</div>
            <div className="text-sm text-muted-foreground">Partly Cloudy</div>
          </div>
          
          <div className="text-right text-sm text-muted-foreground">
            <div>Wind: 8 mph</div>
            <div>Humidity: 65%</div>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-success/10 rounded-md">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span className="text-sm text-success font-medium">Great conditions for outdoor training</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingSchedule;