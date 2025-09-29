import React, { useState } from 'react';
import Icon from '../../../../shared/components/AppIcon';
import Button from '../../../../shared/components/ui/Button';

const WeeklyOverview = ({ weekData, currentDate }) => {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = next week

  const getWeekDates = (weekOffset = 0) => {
    const today = new Date(currentDate);
    const startOfWeek = new Date(today);
    startOfWeek?.setDate(today?.getDate() - today?.getDay() + (weekOffset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date?.setDate(startOfWeek?.getDate() + i);
      dates?.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);
  const currentWeekData = weekData?.[selectedWeek] || {};

  const getDaySessionCount = (date) => {
    const dateStr = date?.toISOString()?.split('T')?.[0];
    return currentWeekData?.[dateStr]?.length || 0;
  };

  const getDayEarnings = (date) => {
    const dateStr = date?.toISOString()?.split('T')?.[0];
    const sessions = currentWeekData?.[dateStr] || [];
    return sessions?.reduce((total, session) => total + (session?.earnings || 0), 0);
  };

  const isToday = (date) => {
    const today = new Date(currentDate);
    return date?.toDateString() === today?.toDateString();
  };

  const weeklyStats = {
    totalSessions: Object.values(currentWeekData)?.flat()?.length,
    totalEarnings: Object.values(currentWeekData)?.flat()?.reduce((total, session) => total + (session?.earnings || 0), 0),
    averageAttendance: Object.values(currentWeekData)?.flat()?.reduce((total, session, _, arr) => {
      const attendanceRate = session?.attendanceRate || 0;
      return total + attendanceRate / arr?.length;
    }, 0)
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Weekly Overview</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedWeek === 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedWeek(0)}
          >
            This Week
          </Button>
          <Button
            variant={selectedWeek === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedWeek(1)}
          >
            Next Week
          </Button>
        </div>
      </div>
      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Sessions</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{weeklyStats?.totalSessions}</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="DollarSign" size={16} className="text-success" />
            <span className="text-sm font-medium text-muted-foreground">Earnings</span>
          </div>
          <div className="text-2xl font-bold text-foreground">£{weeklyStats?.totalEarnings?.toFixed(0)}</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Users" size={16} className="text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Avg Attendance</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{weeklyStats?.averageAttendance?.toFixed(0)}%</div>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/50">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {weekDates?.map((date, index) => {
            const sessionCount = getDaySessionCount(date);
            const earnings = getDayEarnings(date);
            const todayClass = isToday(date) ? 'bg-primary/10 border-primary' : '';
            
            return (
              <div key={index} className={`min-h-24 p-2 border-r border-b border-border ${todayClass} last:border-r-0`}>
                <div className="flex flex-col h-full">
                  <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-primary' : 'text-foreground'}`}>
                    {date?.getDate()}
                  </div>
                  
                  {sessionCount > 0 && (
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-xs text-muted-foreground">
                          {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {earnings > 0 && (
                        <div className="text-xs text-success font-medium">
                          ${earnings}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Workload Indicator */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">Workload Distribution</h3>
          <span className="text-sm text-muted-foreground">
            {selectedWeek === 0 ? 'Current Week' : 'Next Week'}
          </span>
        </div>
        
        <div className="space-y-2">
          {weekDates?.map((date, index) => {
            const sessionCount = getDaySessionCount(date);
            const maxSessions = Math.max(...weekDates?.map(d => getDaySessionCount(d)), 1);
            const percentage = (sessionCount / maxSessions) * 100;
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-12 text-xs text-muted-foreground">
                  {date?.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-8 text-xs text-muted-foreground text-right">
                  {sessionCount}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyOverview;