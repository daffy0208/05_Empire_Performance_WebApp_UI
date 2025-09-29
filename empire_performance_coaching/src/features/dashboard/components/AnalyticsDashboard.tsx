import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../shared/components/AppIcon';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';

// Types for dashboard data
interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

interface SessionData {
  date: string;
  sessions: number;
  revenue: number;
  clients: number;
}

interface CoachPerformance {
  name: string;
  sessions: number;
  revenue: number;
  rating: number;
  clients: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
  sessions: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Revenue',
      value: '£12,450',
      change: '+15.3%',
      changeType: 'positive',
      icon: 'TrendingUp'
    },
    {
      title: 'Active Clients',
      value: 87,
      change: '+12%',
      changeType: 'positive',
      icon: 'Users'
    },
    {
      title: 'Sessions This Month',
      value: 156,
      change: '+8%',
      changeType: 'positive',
      icon: 'Calendar'
    },
    {
      title: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive',
      icon: 'Star'
    }
  ]);

  const sessionData: SessionData[] = [
    { date: '2025-01-20', sessions: 12, revenue: 900, clients: 8 },
    { date: '2025-01-21', sessions: 15, revenue: 1125, clients: 12 },
    { date: '2025-01-22', sessions: 18, revenue: 1350, clients: 14 },
    { date: '2025-01-23', sessions: 22, revenue: 1650, clients: 16 },
    { date: '2025-01-24', sessions: 19, revenue: 1425, clients: 13 },
    { date: '2025-01-25', sessions: 25, revenue: 1875, clients: 18 },
    { date: '2025-01-26', sessions: 28, revenue: 2100, clients: 20 }
  ];

  const revenueData: RevenueData[] = [
    { month: 'Jan', revenue: 8500, target: 10000, sessions: 120 },
    { month: 'Feb', revenue: 9200, target: 10000, sessions: 135 },
    { month: 'Mar', revenue: 11800, target: 12000, sessions: 165 },
    { month: 'Apr', revenue: 10500, target: 11000, sessions: 148 },
    { month: 'May', revenue: 12450, target: 12000, sessions: 178 },
    { month: 'Jun', revenue: 13200, target: 13000, sessions: 190 }
  ];

  const coachPerformance: CoachPerformance[] = [
    { name: 'Sarah Johnson', sessions: 45, revenue: 3375, rating: 4.9, clients: 12 },
    { name: 'Mike Chen', sessions: 38, revenue: 2850, rating: 4.8, clients: 10 },
    { name: 'Emma Wilson', sessions: 42, revenue: 3150, rating: 4.7, clients: 14 },
    { name: 'David Brown', sessions: 31, revenue: 2325, rating: 4.6, clients: 8 }
  ];

  const clientTypeData = [
    { name: 'New Clients', value: 35, color: '#C9A43B' },
    { name: 'Returning', value: 45, color: '#8B7355' },
    { name: 'Premium', value: 20, color: '#D4AF37' }
  ];

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRange]);

  const formatCurrency = (value: number) => `£${value.toLocaleString()}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Analytics Dashboard</h1>
          <p className="text-[#CFCFCF]">Track your coaching performance and business metrics</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border-[#2A2A2E]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#CFCFCF]">{metric.title}</p>
                  <p className="text-2xl font-bold text-[#F5F5F5] mt-1">{metric.value}</p>
                  <p className={`text-sm mt-1 ${
                    metric.changeType === 'positive' ? 'text-success' :
                    metric.changeType === 'negative' ? 'text-error' : 'text-[#CFCFCF]'
                  }`}>
                    {metric.change} from last period
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  metric.changeType === 'positive' ? 'bg-success/10' :
                  metric.changeType === 'negative' ? 'bg-error/10' : 'bg-[#2A2A2E]'
                }`}>
                  <Icon
                    name={metric.icon as any}
                    size={20}
                    className={
                      metric.changeType === 'positive' ? 'text-success' :
                      metric.changeType === 'negative' ? 'text-error' : 'text-[#CFCFCF]'
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Trends */}
        <Card className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border-[#2A2A2E]">
          <CardHeader>
            <CardTitle className="text-[#F5F5F5]">Session Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#CFCFCF', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A2E' }}
                  tickFormatter={formatDate}
                />
                <YAxis
                  tick={{ fill: '#CFCFCF', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A2E' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1D',
                    border: '1px solid #2A2A2E',
                    borderRadius: '8px',
                    color: '#F5F5F5'
                  }}
                  labelFormatter={formatDate}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="#C9A43B"
                  fill="url(#sessionsGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A43B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C9A43B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Overview */}
        <Card className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border-[#2A2A2E]">
          <CardHeader>
            <CardTitle className="text-[#F5F5F5]">Revenue vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#CFCFCF', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A2E' }}
                />
                <YAxis
                  tick={{ fill: '#CFCFCF', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A2E' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1D',
                    border: '1px solid #2A2A2E',
                    borderRadius: '8px',
                    color: '#F5F5F5'
                  }}
                  formatter={(value: any, name: string) => [
                    formatCurrency(value),
                    name === 'revenue' ? 'Revenue' : 'Target'
                  ]}
                />
                <Bar dataKey="target" fill="#2A2A2E" name="target" />
                <Bar dataKey="revenue" fill="#C9A43B" name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coach Performance */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-[#1A1A1D] to-[#141416] border-[#2A2A2E]">
          <CardHeader>
            <CardTitle className="text-[#F5F5F5]">Coach Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coachPerformance.map((coach, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#1A1A1D]/50 rounded-lg border border-[#2A2A2E]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-[#F5F5F5]">{coach.name}</p>
                      <p className="text-sm text-[#CFCFCF]">{coach.clients} active clients</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#F5F5F5]">{coach.sessions} sessions</p>
                    <p className="text-sm text-[#CFCFCF]">{formatCurrency(coach.revenue)}</p>
                    <div className="flex items-center mt-1">
                      <Icon name="Star" size={14} className="text-yellow-500 mr-1" />
                      <span className="text-sm text-[#CFCFCF]">{coach.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Distribution */}
        <Card className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border-[#2A2A2E]">
          <CardHeader>
            <CardTitle className="text-[#F5F5F5]">Client Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clientTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {clientTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1D',
                    border: '1px solid #2A2A2E',
                    borderRadius: '8px',
                    color: '#F5F5F5'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {clientTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-[#CFCFCF]">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-[#F5F5F5]">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;