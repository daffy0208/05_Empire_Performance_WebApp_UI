import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RevenueChart = () => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('6months');

  const revenueData = [
    { month: 'Mar', revenue: 12500, sessions: 85, target: 15000 },
    { month: 'Apr', revenue: 15200, sessions: 102, target: 15000 },
    { month: 'May', revenue: 18900, sessions: 125, target: 18000 },
    { month: 'Jun', revenue: 22100, sessions: 148, target: 20000 },
    { month: 'Jul', revenue: 19800, sessions: 132, target: 22000 },
    { month: 'Aug', revenue: 25600, sessions: 165, target: 24000 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })?.format(value);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Trends</h3>
          <p className="text-sm text-muted-foreground">Monthly performance vs targets</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-smooth ${
                chartType === 'line' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="TrendingUp" size={16} className="mr-1" />
              Trend
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-smooth ${
                chartType === 'bar' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="BarChart3" size={16} className="mr-1" />
              Compare
            </button>
          </div>
          <Button variant="outline" size="sm" iconName="Download">
            Export
          </Button>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Target']}
                labelStyle={{ color: 'var(--color-foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="var(--color-muted-foreground)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'var(--color-muted-foreground)', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          ) : (
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Actual Revenue' : 'Target']}
                labelStyle={{ color: 'var(--color-foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="var(--color-muted)" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{formatCurrency(25600)}</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">+18.2%</p>
          <p className="text-sm text-muted-foreground">vs Last Month</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">106.7%</p>
          <p className="text-sm text-muted-foreground">Target Achievement</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;