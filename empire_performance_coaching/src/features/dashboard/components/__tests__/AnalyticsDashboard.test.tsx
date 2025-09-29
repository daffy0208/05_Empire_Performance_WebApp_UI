import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AnalyticsDashboard from '../AnalyticsDashboard';

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}));

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock performance.now for loading simulation
    vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      fn();
      return 1 as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dashboard header correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Track your coaching performance and business metrics')).toBeInTheDocument();
    });
  });

  it('displays metric cards with correct data', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('£12,450')).toBeInTheDocument();
      expect(screen.getByText('Active Clients')).toBeInTheDocument();
      expect(screen.getByText('87')).toBeInTheDocument();
      expect(screen.getByText('Sessions This Month')).toBeInTheDocument();
      expect(screen.getByText('156')).toBeInTheDocument();
      expect(screen.getByText('Average Rating')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    // Mock setTimeout to not auto-complete
    vi.spyOn(global, 'setTimeout').mockImplementation(() => 1 as any);

    render(<AnalyticsDashboard />);

    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('renders time range selector', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const select = screen.getByDisplayValue('Last 7 days');
      expect(select).toBeInTheDocument();
    });
  });

  it('changes time range when selector is used', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const select = screen.getByDisplayValue('Last 7 days');
      fireEvent.change(select, { target: { value: '30d' } });
      expect(select).toHaveValue('30d');
    });
  });

  it('displays all chart components', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Session Trends')).toBeInTheDocument();
      expect(screen.getByText('Revenue vs Target')).toBeInTheDocument();
      expect(screen.getByText('Coach Performance')).toBeInTheDocument();
      expect(screen.getByText('Client Types')).toBeInTheDocument();
    });

    // Check that chart components are rendered
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('shows coach performance data correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Mike Chen')).toBeInTheDocument();
      expect(screen.getByText('Emma Wilson')).toBeInTheDocument();
      expect(screen.getByText('David Brown')).toBeInTheDocument();

      // Check session counts
      expect(screen.getByText('45 sessions')).toBeInTheDocument();
      expect(screen.getByText('38 sessions')).toBeInTheDocument();
    });
  });

  it('displays client type distribution', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('New Clients')).toBeInTheDocument();
      expect(screen.getByText('Returning')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();

      // Check percentages
      expect(screen.getByText('35%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
    });
  });

  it('handles responsive design elements', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      // Check for responsive container components
      const responsiveContainers = screen.getAllByTestId('responsive-container');
      expect(responsiveContainers.length).toBeGreaterThan(0);
    });
  });

  it('displays change indicators correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('+15.3%')).toBeInTheDocument();
      expect(screen.getByText('+12%')).toBeInTheDocument();
      expect(screen.getByText('+8%')).toBeInTheDocument();
      expect(screen.getByText('+0.2')).toBeInTheDocument();
    });
  });

  it('renders with proper accessibility attributes', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      // Check that heading hierarchy is correct
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Analytics Dashboard');
    });
  });

  it('handles time range options correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const select = screen.getByDisplayValue('Last 7 days');

      // Check all options are present
      fireEvent.click(select);

      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
      expect(screen.getByText('Last 3 months')).toBeInTheDocument();
      expect(screen.getByText('Last year')).toBeInTheDocument();
    });
  });

  it('formats currency values correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      // Check for proper currency formatting
      expect(screen.getByText('£12,450')).toBeInTheDocument();
      expect(screen.getByText('£3,375')).toBeInTheDocument();
      expect(screen.getByText('£2,850')).toBeInTheDocument();
    });
  });
});