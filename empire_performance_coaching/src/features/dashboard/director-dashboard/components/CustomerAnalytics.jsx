import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import Button from '../../../../shared/components/ui/Button';

const CustomerAnalytics = () => {
  const [timeRange, setTimeRange] = useState('6months');

  const customerData = [
    { month: 'Mar', newCustomers: 15, activeCustomers: 85, churnRate: 5.2, ltv: 1250 },
    { month: 'Apr', newCustomers: 22, activeCustomers: 98, churnRate: 4.8, ltv: 1320 },
    { month: 'May', newCustomers: 18, activeCustomers: 108, churnRate: 3.9, ltv: 1380 },
    { month: 'Jun', newCustomers: 25, activeCustomers: 125, churnRate: 4.2, ltv: 1420 },
    { month: 'Jul', newCustomers: 20, activeCustomers: 135, churnRate: 3.5, ltv: 1480 },
    { month: 'Aug', newCustomers: 28, activeCustomers: 152, churnRate: 2.8, ltv: 1550 }
  ];

  const retentionData = [
    { cohort: 'Jan 2024', month1: 100, month2: 85, month3: 72, month4: 65, month5: 58, month6: 52 },
    { cohort: 'Feb 2024', month1: 100, month2: 88, month3: 75, month4: 68, month5: 62, month6: 55 },
    { cohort: 'Mar 2024', month1: 100, month2: 90, month3: 78, month4: 71, month5: 65, month6: 58 },
    { cohort: 'Apr 2024', month1: 100, month2: 92, month3: 82, month4: 75, month5: 68, month6: 62 },
    { cohort: 'May 2024', month1: 100, month2: 94, month3: 85, month4: 78, month5: 72, month6: 65 },
    { cohort: 'Jun 2024', month1: 100, month2: 96, month3: 88, month4: 82, month5: 75, month6: 68 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    })?.format(value);
  };

  const getRetentionColor = (value) => {
    if (value >= 80) return 'bg-success text-success-foreground';
    if (value >= 60) return 'bg-warning text-warning-foreground';
    if (value >= 40) return 'bg-error/70 text-error-foreground';
    return 'bg-error text-error-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Customer Growth Chart */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Customer Growth</h3>
            <p className="text-sm text-muted-foreground">New vs active customers over time</p>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e?.target?.value)}
              className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground"
            >
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="12months">12 Months</option>
            </select>
            <Button variant="outline" size="sm" iconName="Download">
              Export
            </Button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'newCustomers' ? 'New Customers' : 'Active Customers'
                ]}
                labelStyle={{ color: 'var(--color-foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="activeCustomers" 
                stackId="1"
                stroke="var(--color-primary)" 
                fill="var(--color-primary)"
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="newCustomers" 
                stackId="2"
                stroke="var(--color-success)" 
                fill="var(--color-success)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">152</p>
            <p className="text-sm text-muted-foreground">Active Customers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">+28</p>
            <p className="text-sm text-muted-foreground">New This Month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-error">2.8%</p>
            <p className="text-sm text-muted-foreground">Churn Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(1550)}</p>
            <p className="text-sm text-muted-foreground">Avg LTV</p>
          </div>
        </div>
      </div>
      {/* Customer Retention Cohort Analysis */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Customer Retention Cohorts</h3>
            <p className="text-sm text-muted-foreground">Monthly retention rates by signup cohort</p>
          </div>
          <Button variant="outline" size="sm" iconName="Info">
            How to Read
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-foreground">Cohort</th>
                <th className="text-center p-3 font-medium text-foreground">Month 1</th>
                <th className="text-center p-3 font-medium text-foreground">Month 2</th>
                <th className="text-center p-3 font-medium text-foreground">Month 3</th>
                <th className="text-center p-3 font-medium text-foreground">Month 4</th>
                <th className="text-center p-3 font-medium text-foreground">Month 5</th>
                <th className="text-center p-3 font-medium text-foreground">Month 6</th>
              </tr>
            </thead>
            <tbody>
              {retentionData?.map((cohort, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/30 transition-smooth">
                  <td className="p-3 font-medium text-foreground">{cohort?.cohort}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-primary text-primary-foreground">
                      {cohort?.month1}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort?.month2)}`}>
                      {cohort?.month2}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort?.month3)}`}>
                      {cohort?.month3}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort?.month4)}`}>
                      {cohort?.month4}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort?.month5)}`}>
                      {cohort?.month5}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort?.month6)}`}>
                      {cohort?.month6}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">68%</p>
              <p className="text-sm text-muted-foreground">6-Month Retention</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">Jun 2024</p>
              <p className="text-sm text-muted-foreground">Best Cohort</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">+12%</p>
              <p className="text-sm text-muted-foreground">Improvement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;