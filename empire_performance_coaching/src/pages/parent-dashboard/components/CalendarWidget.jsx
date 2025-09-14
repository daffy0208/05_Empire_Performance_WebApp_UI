import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const CalendarWidget = ({ sessions, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const year = currentDate?.getFullYear();
  const month = currentDate?.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth?.getDay();
  const daysInMonth = lastDayOfMonth?.getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };
  
  const getSessionsForDate = (date) => {
    const dateString = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(date)?.padStart(2, '0')}`;
    return sessions?.filter(session => session?.date === dateString);
  };
  
  const isToday = (date) => {
    return today?.getDate() === date && 
           today?.getMonth() === month && 
           today?.getFullYear() === year;
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days?.push(
        <div key={`empty-${i}`} className="h-10 w-10"></div>
      );
    }
    
    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const sessionsForDate = getSessionsForDate(date);
      const hasSession = sessionsForDate?.length > 0;
      const isCurrentDay = isToday(date);
      
      days?.push(
        <button
          key={date}
          onClick={() => onDateSelect && onDateSelect(new Date(year, month, date))}
          className={`h-10 w-10 rounded-lg text-sm font-medium transition-smooth relative ${
            isCurrentDay 
              ? 'bg-primary text-primary-foreground' 
              : hasSession
                ? 'bg-accent/20 text-accent hover:bg-accent/30' :'text-foreground hover:bg-muted'
          }`}
        >
          {date}
          {hasSession && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className={`w-1 h-1 rounded-full ${
                isCurrentDay ? 'bg-primary-foreground' : 'bg-accent'
              }`}></div>
            </div>
          )}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {monthNames?.[month]} {year}
        </h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(-1)}
            iconName="ChevronLeft"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(1)}
            iconName="ChevronRight"
          />
        </div>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames?.map(day => (
          <div key={day} className="h-8 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-accent/20 rounded-full mr-2"></div>
              <span className="text-muted-foreground">Sessions</span>
            </div>
          </div>
          <span className="text-muted-foreground">
            {sessions?.filter(s => {
              const sessionDate = new Date(s.date);
              return sessionDate?.getMonth() === month && sessionDate?.getFullYear() === year;
            })?.length} sessions this month
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;