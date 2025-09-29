import React, { useState } from 'react';
import Icon from '../../../../shared/components/AppIcon';
import Button from '../../../../shared/components/ui/Button';

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
          className={`h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 relative ${
            isCurrentDay
              ? 'bg-[#C9A43B] text-[#000000]'
              : hasSession
                ? 'bg-[#C9A43B]/20 text-[#C9A43B] hover:bg-[#C9A43B]/30'
                : 'text-[#F5F5F5] hover:bg-[#2A2A2E]'
          }`}
        >
          {date}
          {hasSession && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className={`w-1 h-1 rounded-full ${
                isCurrentDay ? 'bg-[#000000]' : 'bg-[#C9A43B]'
              }`}></div>
            </div>
          )}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#F5F5F5' }}>Session Calendar</h2>
        <p className="text-sm mb-4" style={{ color: '#CFCFCF' }}>
          View your scheduled sessions and click dates to book new sessions
        </p>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium" style={{ color: '#F5F5F5' }}>
            {monthNames?.[month]} {year}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg bg-[#2A2A2E] text-[#CFCFCF] hover:bg-[#C9A43B]/20 hover:text-[#C9A43B] transition-all duration-200"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg bg-[#2A2A2E] text-[#CFCFCF] hover:bg-[#C9A43B]/20 hover:text-[#C9A43B] transition-all duration-200"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames?.map(day => (
          <div key={day} className="h-8 flex items-center justify-center">
            <span className="text-xs font-medium" style={{ color: '#CFCFCF' }}>{day}</span>
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#2A2A2E]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#C9A43B] rounded-full mr-2"></div>
              <span style={{ color: '#CFCFCF' }}>Today</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#C9A43B]/20 rounded-full mr-2"></div>
              <span style={{ color: '#CFCFCF' }}>Sessions</span>
            </div>
          </div>
          <span style={{ color: '#CFCFCF' }}>
            {(() => {
              const count = sessions?.filter(s => {
                const sessionDate = new Date(s.date);
                return sessionDate?.getMonth() === month && sessionDate?.getFullYear() === year;
              })?.length || 0;
              return count === 1 ? '1 session this month' : `${count} sessions this month`;
            })()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;