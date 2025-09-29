import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import Button from '../../../../shared/components/ui/Button';

const BookingPatterns = () => {
  const [viewType, setViewType] = useState('hourly');

  const hourlyData = [
    { hour: '8 AM', bookings: 12, revenue: 2400 },
    { hour: '9 AM', bookings: 18, revenue: 3600 },
    { hour: '10 AM', bookings: 25, revenue: 5000 },
    { hour: '11 AM', bookings: 22, revenue: 4400 },
    { hour: '12 PM', bookings: 15, revenue: 3000 },
    { hour: '1 PM', bookings: 8, revenue: 1600 },
    { hour: '2 PM', bookings: 20, revenue: 4000 },
    { hour: '3 PM', bookings: 35, revenue: 7000 },
    { hour: '4 PM', bookings: 42, revenue: 8400 },
    { hour: '5 PM', bookings: 38, revenue: 7600 },
    { hour: '6 PM', bookings: 28, revenue: 5600 },
    { hour: '7 PM', bookings: 15, revenue: 3000 }
  ];

  const weeklyData = [
    { day: 'Mon', bookings: 45, revenue: 9000 },
    { day: 'Tue', bookings: 52, revenue: 10400 },
    { day: 'Wed', bookings: 48, revenue: 9600 },
    { day: 'Thu', bookings: 55, revenue: 11000 },
    { day: 'Fri', bookings: 38, revenue: 7600 },
    { day: 'Sat', bookings: 65, revenue: 13000 },
    { day: 'Sun', bookings: 42, revenue: 8400 }
  ];

  const sessionTypeData = [
    { name: 'Individual Training', value: 45, color: 'var(--color-primary)' },
    { name: 'Small Group (2-3)', value: 30, color: 'var(--color-accent)' },
    { name: 'Team Training', value: 15, color: 'var(--color-success)' },
    { name: 'Goalkeeper Specific', value: 10, color: 'var(--color-warning)' }
  ];

  const currentData = viewType === 'hourly' ? hourlyData : weeklyData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    })?.format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Booking Patterns Chart */}
      <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6 shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Booking Patterns</h3>
            <p className="text-sm text-muted-foreground">Peak hours and demand analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewType('hourly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-smooth ${
                  viewType === 'hourly' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hourly
              </button>
              <button
                onClick={() => setViewType('weekly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-smooth ${
                  viewType === 'weekly' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                Weekly
              </button>
            </div>
            <Button variant="outline" size="sm" iconName="Download">
              Export
            </Button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey={viewType === 'hourly' ? 'hour' : 'day'} 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value, name) => [value, name === 'bookings' ? 'Bookings' : formatCurrency(value)]}
                labelStyle={{ color: 'var(--color-foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="bookings" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {viewType === 'hourly' ? '4 PM' : 'Saturday'}
            </p>
            <p className="text-sm text-muted-foreground">Peak Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {viewType === 'hourly' ? '42' : '65'}
            </p>
            <p className="text-sm text-muted-foreground">Peak Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {viewType === 'hourly' ? '85%' : '92%'}
            </p>
            <p className="text-sm text-muted-foreground">Utilization</p>
          </div>
        </div>
      </div>
      {/* Session Types Distribution */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Session Types</h3>
            <p className="text-sm text-muted-foreground">Distribution breakdown</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sessionTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {sessionTypeData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Share']}
                labelStyle={{ color: 'var(--color-foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 mt-4">
          {sessionTypeData?.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item?.color }}
                ></div>
                <span className="text-sm text-foreground">{item?.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{item?.value}%</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Most Popular</p>
            <p className="text-lg font-semibold text-primary">Individual Training</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPatterns;