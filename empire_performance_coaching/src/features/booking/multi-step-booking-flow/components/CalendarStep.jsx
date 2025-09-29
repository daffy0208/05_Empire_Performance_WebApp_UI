import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/AppIcon';
import { supabase } from '../../../../shared/lib/supabase';
import { startOfMonth, addMonths, subMonths, setHours } from 'date-fns';

// Add monthNames array declaration
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarStep = ({ selectedDate, onDateSelect, selectedTimeSlot, onTimeSlotSelect, selectedLocation }) => {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const isSupabaseConfigured = Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY);

  const today = new Date();
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Fetch availability across all days (no DOW restriction)
  const fetchAvailableTimeSlots = async (date) => {
    if (!date) return;

    setLoadingTimeSlots(true);
    try {
      let potentialSlots = [];
      if (isSupabaseConfigured) {
        const monthStart = startOfMonth(date);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        // Try new availability table first, fallback to coach_availability
        let { data: availability, error } = await supabase.from('availability').select(`
            id,
            coach_id,
            starts_at as start_time,
            ends_at as end_time,
            location_id,
            status
          `).eq('status', 'open').gte('starts_at', monthStart.toISOString()).lte('starts_at', monthEnd.toISOString());

        // Fallback to coach_availability table if new table fails
        if (error || !availability) {
          const fallbackQuery = await supabase.from('coach_availability').select(`
              id,
              coach_id,
              start_time,
              end_time,
              location,
              is_active
            `).eq('is_active', true);

          availability = fallbackQuery.data;
          error = fallbackQuery.error;
        }

        if (error) {
          console.error('Error fetching availability:', error);
        }

        for (let hour = 8; hour <= 20; hour++) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, 0, 0, 0);

          let hasAvailability = false;

          if (availability && availability.length > 0) {
            hasAvailability = availability.some(slot => {
              // Handle both new and old table formats
              const startTime = slot.start_time || slot.starts_at;
              const endTime = slot.end_time || slot.ends_at;

              if (typeof startTime === 'string' && startTime.includes('T')) {
                // Full timestamp format (new table)
                const slotStart = new Date(startTime);
                const slotEnd = new Date(endTime);
                return slotTime >= slotStart && slotTime < slotEnd;
              } else {
                // Time-only format (old table)
                const slotStart = new Date(`1970-01-01T${startTime}`);
                const slotEnd = new Date(`1970-01-01T${endTime}`);
                const currentHour = slotTime.getHours();
                return currentHour >= slotStart.getHours() && currentHour < slotEnd.getHours();
              }
            });
          }

          if (hasAvailability) {
            const endTime = new Date(slotTime);
            endTime.setHours(hour + 1, 0, 0, 0);
            potentialSlots.push({
              id: `${date.toDateString()}-${hour}`,
              start_time: slotTime,
              end_time: endTime,
              display_time: slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              available: true
            });
          }
        }
      } else {
        // Fallback slots when Supabase isn't configured: 9 AM - 5 PM hourly
        for (let hour = 9; hour <= 17; hour++) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, 0, 0, 0);
          const endTime = new Date(slotTime);
          endTime.setHours(hour + 1, 0, 0, 0);
          potentialSlots.push({
            id: `${date.toDateString()}-${hour}`,
            start_time: slotTime,
            end_time: endTime,
            display_time: slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            available: true
          });
        }
      }

      // If no slots were generated, always provide fallback time slots
      if (potentialSlots.length === 0) {
        console.warn('No time slots found, generating fallback slots');
        for (let hour = 9; hour <= 17; hour++) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, 0, 0, 0);
          const endTime = new Date(slotTime);
          endTime.setHours(hour + 1, 0, 0, 0);
          potentialSlots.push({
            id: `fallback-${date.toDateString()}-${hour}`,
            start_time: slotTime,
            end_time: endTime,
            display_time: slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            available: true
          });
        }
      }

      setAvailableTimeSlots(potentialSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Always provide fallback time slots even on error
      const fallbackSlots = [];
      for (let hour = 9; hour <= 17; hour++) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(slotTime);
        endTime.setHours(hour + 1, 0, 0, 0);
        fallbackSlots.push({
          id: `error-fallback-${date.toDateString()}-${hour}`,
          start_time: slotTime,
          end_time: endTime,
          display_time: slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          available: true
        });
      }
      setAvailableTimeSlots(fallbackSlots);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Get available dates from availability data
  const getAvailableDates = async (month) => {
    try {
      const results = [];
      const daysInMonthLocal = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

      // Always provide fallback dates to ensure calendar is functional
      const generateFallbackDates = () => {
        const fallbackDates = [];
        for (let day = 1; day <= daysInMonthLocal; day++) {
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          if (date >= today) {
            fallbackDates.push(date);
          }
        }
        return fallbackDates;
      };

      if (isSupabaseConfigured) {
        // Try new availability table first
        let { data: availability, error } = await supabase.from('availability').select('starts_at, location_id, status').eq('status', 'open');

        // Fallback to coach_availability if new table fails
        if (error || !availability || availability.length === 0) {
          const fallbackQuery = await supabase.from('coach_availability').select('day_of_week, location').eq('is_active', true);
          availability = fallbackQuery.data;
          error = fallbackQuery.error;

          if (error || !availability || availability.length === 0) {
            console.warn('No availability data found, using fallback dates');
            return generateFallbackDates();
          }

          // Handle old table format
          for (let day = 1; day <= daysInMonthLocal; day++) {
            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const dayOfWeek = date.getDay();
            const hasAvailability = availability && availability.some(slot => {
              const matchesDow = slot.day_of_week === dayOfWeek;
              if (!selectedLocation || !selectedLocation.name) return matchesDow;
              const locName = selectedLocation.name;
              const locCity = selectedLocation.city;
              return matchesDow && (slot.location === locName || slot.location === locCity);
            });
            if (hasAvailability && date >= today) {
              results.push(date);
            }
          }
        } else {
          // Handle new table format
          for (let day = 1; day <= daysInMonthLocal; day++) {
            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const hasAvailability = availability && availability.some(slot => {
              const slotDate = new Date(slot.starts_at);
              return slotDate.toDateString() === date.toDateString();
            });
            if (hasAvailability && date >= today) {
              results.push(date);
            }
          }
        }
      } else {
        // Fallback: allow all future weekdays (Mon-Fri)
        for (let day = 1; day <= daysInMonthLocal; day++) {
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const dow = date.getDay();
          const isWeekday = dow !== 0 && dow !== 6;
          if (isWeekday && date >= today) {
            results.push(date);
          }
        }
      }

      // If no results from database queries, always provide fallback dates
      if (results.length === 0) {
        for (let day = 1; day <= daysInMonthLocal; day++) {
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          if (date >= today) {
            results.push(date);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting available dates:', error);
      // Always provide fallback dates even on error
      const fallbackDates = [];
      const daysInMonthLocal = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonthLocal; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        if (date >= today) {
          fallbackDates.push(date);
        }
      }
      return fallbackDates;
    }
  };

  // Fetch available dates when month changes
  const [availableDates, setAvailableDates] = useState([]);
  
  useEffect(() => {
    const fetchAvailableDates = async () => {
      const dates = await getAvailableDates(currentMonth);
      setAvailableDates(dates);
    };
    
    fetchAvailableDates();
  }, [currentMonth, selectedLocation]);

  // Effect to fetch time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots(selectedDate);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate]);

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();

  // Fixed navigation function to prevent rapid clicking and ensure single month increment
  const navigateMonth = async (direction) => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    
    try {
      // Use functional updates with normalized time to prevent jump bug
      setCurrentMonth(current => {
        const normalized = setHours(current, 12); // Set to noon to avoid DST issues
        return direction > 0 ? addMonths(normalized, 1) : subMonths(normalized, 1);
      });
      
      // Clear selected date if it's not in the new month
      if (selectedDate) {
        const selectedDateMonth = selectedDate.getMonth();
        const selectedDateYear = selectedDate.getFullYear();
        const newMonth = direction > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1);
        const newMonthIndex = newMonth.getMonth();
        const newYear = newMonth.getFullYear();

        if (selectedDateMonth !== newMonthIndex || selectedDateYear !== newYear) {
          onDateSelect && onDateSelect(null);
          onTimeSlotSelect && onTimeSlotSelect(null);
        }
      }
      
      // Debounce to prevent rapid navigation
      await new Promise(resolve => setTimeout(resolve, 200));
    } finally {
      setIsNavigating(false);
    }
  };

  // Keyboard navigation support
  const handleKeyboardNavigation = (e, direction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateMonth(direction);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateMonth(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateMonth(1);
    }
  };

  const isDateAvailable = (date) => {
    return availableDates && availableDates.some(availableDate =>
      availableDate.toDateString() === date.toDateString()
    );
  };

  const isDateSelected = (date) => {
    return selectedDate && selectedDate.toDateString() === date.toDateString();
  };

  const isDatePast = (date) => {
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return candidate < todayStart;
  };

  const handleDateClick = (date) => {
    if (!isDatePast(date) && isDateAvailable(date)) {
      onDateSelect(date);
      // Clear selected time slot when date changes
      if (onTimeSlotSelect) {
        onTimeSlotSelect(null);
      }
    }
  };

  const handleTimeSlotSelect = (timeSlot) => {
    if (onTimeSlotSelect) {
      onTimeSlotSelect(timeSlot);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonthIndex, day);
      const isPast = isDatePast(date);
      const isAvailable = isDateAvailable(date);
      const isSelected = isDateSelected(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isPast || !isAvailable}
          className={`h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 focus:ring-offset-1 focus:ring-offset-[#0E0E10] ${
            isSelected
              ? 'bg-[#C9A43B] text-[#000000] shadow-md font-semibold'
              : isAvailable && !isPast
              ? 'bg-[#1A1A1D] hover:bg-[#C9A43B]/20 text-[#F5F5F5] border border-[#2A2A2E] hover:border-[#C9A43B]/50'
              : isPast
              ? 'text-[#6B6B75] cursor-not-allowed opacity-50 bg-[#141416]'
              : 'text-[#6B6B75] cursor-not-allowed bg-[#141416]'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#F5F5F5' }}>
          Select Training Date & Time
        </h2>
        <p style={{ color: '#CFCFCF' }}>
          Choose an available date and time slot for your football training session
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 shadow-lg">
        {/* Calendar Header - Fixed navigation with debouncing */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            onKeyDown={(e) => handleKeyboardNavigation(e, -1)}
            disabled={isNavigating}
            className="p-2 rounded-lg hover:bg-[#2A2A2E] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous month"
          >
            <Icon name="ChevronLeft" size={20} className="text-[#CFCFCF]" />
          </button>
          
          <h3 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
            {monthNames[currentMonthIndex]} {currentYear}
          </h3>
          
          <button
            onClick={() => navigateMonth(1)}
            onKeyDown={(e) => handleKeyboardNavigation(e, 1)}
            disabled={isNavigating}
            className="p-2 rounded-lg hover:bg-[#2A2A2E] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <Icon name="ChevronRight" size={20} className="text-[#CFCFCF]" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center">
              <span className="text-sm font-medium" style={{ color: '#CFCFCF' }}>{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 select-none">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-[#2A2A2E]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#C9A43B] rounded"></div>
            <span className="text-sm" style={{ color: '#CFCFCF' }}>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#1A1A1D] border border-[#2A2A2E] rounded"></div>
            <span className="text-sm" style={{ color: '#CFCFCF' }}>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#141416] rounded opacity-50"></div>
            <span className="text-sm" style={{ color: '#CFCFCF' }}>Unavailable</span>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="bg-[#C9A43B]/10 border border-[#C9A43B]/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Calendar" size={20} className="text-[#C9A43B]" />
            <span className="font-medium" style={{ color: '#F5F5F5' }}>
              Selected: {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Time Slots Section */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3" style={{ color: '#F5F5F5' }}>Available Time Slots</h4>
            
            {loadingTimeSlots ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={20} className="text-[#C9A43B] animate-spin" />
                <span className="ml-2 text-sm" style={{ color: '#CFCFCF' }}>Loading available times...</span>
              </div>
            ) : availableTimeSlots && availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableTimeSlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className={`px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 focus:ring-offset-1 focus:ring-offset-[#0E0E10] ${
                      selectedTimeSlot && selectedTimeSlot.id === slot.id
                        ? 'bg-[#C9A43B] text-[#000000] font-semibold shadow-md'
                        : 'bg-[#1A1A1D] text-[#CFCFCF] border border-[#2A2A2E] hover:border-[#C9A43B]/50 hover:bg-[#C9A43B]/10'
                    }`}
                  >
                    {slot.display_time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Icon name="Clock" size={24} className="mx-auto mb-2" style={{ color: '#CFCFCF' }} />
                <p className="text-sm" style={{ color: '#CFCFCF' }}>No available time slots for this date</p>
                <p className="text-xs mt-1" style={{ color: '#6B6B75' }}>Please select a different date</p>
              </div>
            )}
          </div>

          {selectedTimeSlot && (
            <div className="mt-4 pt-3 border-t border-[#C9A43B]/20">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} className="text-[#C9A43B]" />
                <span className="text-sm font-medium" style={{ color: '#F5F5F5' }}>
                  Selected Time: {selectedTimeSlot.display_time} - {new Date(selectedTimeSlot.end_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarStep;