import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import RoleNavigation from '../../components/ui/RoleNavigation';
import WelcomeHeader from './components/WelcomeHeader';
import UpcomingSessionCard from './components/UpcomingSessionCard';
import BookingSeriesCard from './components/BookingSeriesCard';
import InvoiceCard from './components/InvoiceCard';
import QuickActionsPanel from './components/QuickActionsPanel';
import CalendarWidget from './components/CalendarWidget';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SEO from '../../components/SEO';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const ParentDashboard = () => {
  const { user, userProfile, signOut } = useAuth();
  const { 
    loading, 
    error, 
    upcomingSessions, 
    bookingSeries, 
    invoices, 
    athletes 
  } = useSupabaseData();
  
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated or not a parent
  useEffect(() => {
    if (!user || (userProfile && userProfile?.role !== 'parent')) {
      // Handle redirect or show error
      return;
    }
  }, [user, userProfile]);

  // Format data for components
  const formattedUpcomingSessions = upcomingSessions?.map(session => {
    const participant = session?.session_participants?.[0];
    return {
      id: session?.id,
      coach: {
        name: session?.coach?.full_name || 'Unknown Coach',
        specialty: 'Sports Coaching',
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      date: session?.start_time?.split('T')?.[0],
      startTime: new Date(session?.start_time)?.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      endTime: new Date(session?.end_time)?.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      location: session?.location || 'TBD',
      athlete: participant?.athlete?.name || 'Unknown Athlete',
      status: session?.status,
      notes: session?.notes || '',
      hasNotes: Boolean(session?.notes)
    };
  }) || [];

  const formattedBookingSeries = bookingSeries?.map(booking => ({
    id: booking?.id,
    seriesName: booking?.series_name,
    coach: {
      name: booking?.coach?.full_name || 'Unknown Coach',
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    frequency: booking?.frequency,
    duration: booking?.duration_minutes,
    athlete: booking?.athlete?.name || 'Unknown Athlete',
    pricePerSession: booking?.price_per_session,
    status: booking?.status,
    totalSessions: booking?.total_sessions,
    completedSessions: booking?.completed_sessions,
    totalPaid: booking?.completed_sessions * booking?.price_per_session,
    nextPaymentDate: booking?.next_payment_date,
    recentSessions: [] // Would need separate query for this
  })) || [];

  const formattedInvoices = invoices?.map(invoice => ({
    id: invoice?.id,
    number: invoice?.invoice_number,
    description: invoice?.description,
    amount: invoice?.amount,
    issueDate: invoice?.issue_date,
    dueDate: invoice?.due_date,
    status: invoice?.status,
    paymentMethod: invoice?.payment_method,
    sessions: invoice?.invoice_items?.map(item => ({
      date: item?.session_date,
      athlete: item?.athlete_name,
      amount: item?.amount
    })) || []
  })) || [];

  const parentData = {
    name: userProfile?.full_name || 'Loading...',
    quickStats: {
      upcomingSessions: formattedUpcomingSessions?.length || 0,
      activeBookings: formattedBookingSeries?.filter(b => b?.status === 'active')?.length || 0,
      totalHours: formattedBookingSeries?.reduce((sum, b) => sum + (b?.completedSessions * (b?.duration / 60)), 0) || 0
    }
  };

  const monthlyStats = {
    monthlyCompleted: formattedBookingSeries?.reduce((sum, b) => sum + b?.completedSessions, 0) || 0,
    monthlySpent: formattedInvoices?.filter(i => i?.status === 'paid')?.reduce((sum, i) => sum + i?.amount, 0) || 0,
    progressScore: 87, // Would need to calculate based on attendance
    notifications: [
      {
        type: "reminder",
        message: "Session with Coach tomorrow",
        time: "2 hours ago"
      }
    ]
  };

  const calendarSessions = formattedUpcomingSessions?.map(session => ({
    date: session?.date,
    coach: session?.coach?.name,
    time: session?.startTime
  }));

  // Add handleLogout function
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleReschedule = (sessionId) => {
    console.log('Reschedule session:', sessionId);
    // Implementation would handle rescheduling
  };

  const handleCancel = (sessionId) => {
    console.log('Cancel session:', sessionId);
    // Implementation would handle cancellation
  };

  const handleViewNotes = (sessionId) => {
    console.log('View notes for session:', sessionId);
    // Implementation would show session notes modal
  };

  const handleModifyBooking = (bookingId) => {
    console.log('Modify booking:', bookingId);
    // Implementation would handle booking modifications
  };

  const handleViewPayments = (bookingId) => {
    console.log('View payments for booking:', bookingId);
    setActiveTab('invoices');
  };

  const handlePauseBooking = (bookingId) => {
    console.log('Pause booking:', bookingId);
    // Implementation would handle pausing booking
  };

  const handleDownloadInvoice = (invoiceId) => {
    console.log('Download invoice:', invoiceId);
    // Implementation would handle invoice download
  };

  const handleViewInvoiceDetails = (invoiceId) => {
    console.log('View invoice details:', invoiceId);
    // Implementation would show invoice details modal
  };

  const handleManagePayments = () => {
    console.log('Manage payment methods');
    // Implementation would handle payment method management
  };

  const handleDateSelect = (date) => {
    console.log('Selected date:', date);
    // Implementation would handle calendar date selection
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleNavigation userRole="parent" userName={parentData?.name} onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <RoleNavigation userRole="parent" userName={parentData?.name} onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="AlertCircle" size={32} className="text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Error loading dashboard: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <SEO title="Parent Dashboard - Empire Performance Coaching" canonical="/parent-dashboard" />
      <RoleNavigation userRole="parent" userName={parentData?.name} onLogout={handleLogout} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WelcomeHeader 
          parentName={parentData?.name} 
          quickStats={parentData?.quickStats} 
        />

        {/* Mobile Tab Navigation */}
        <div className="md:hidden mb-6">
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview', icon: 'Home' },
              { key: 'sessions', label: 'Sessions', icon: 'Calendar' },
              { key: 'bookings', label: 'Bookings', icon: 'Repeat' },
              { key: 'invoices', label: 'Invoices', icon: 'Receipt' }
            ]?.map((tab) => (
              <button
                key={tab?.key}
                onClick={() => setActiveTab(tab?.key)}
                className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md transition-smooth ${
                  activeTab === tab?.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} className="mr-1" />
                {tab?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-6">
          {/* Left Column - Sessions */}
          <div className="md:col-span-5">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Calendar" size={20} className="mr-2 text-primary" />
                Upcoming Sessions
              </h2>
              <div className="space-y-4">
                {formattedUpcomingSessions?.map((session) => (
                  <UpcomingSessionCard
                    key={session?.id}
                    session={session}
                    onReschedule={(id) => console.log('Reschedule:', id)}
                    onCancel={(id) => console.log('Cancel:', id)}
                    onViewNotes={(id) => console.log('View notes:', id)}
                  />
                ))}
                {formattedUpcomingSessions?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No upcoming sessions</p>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Bookings */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Repeat" size={20} className="mr-2 text-primary" />
                My Bookings
              </h2>
              <div className="space-y-4">
                {formattedBookingSeries?.map((booking) => (
                  <BookingSeriesCard
                    key={booking?.id}
                    booking={booking}
                    onModify={(id) => console.log('Modify:', id)}
                    onViewPayments={(id) => setActiveTab('invoices')}
                    onPause={(id) => console.log('Pause:', id)}
                  />
                ))}
                {formattedBookingSeries?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No active bookings</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Receipt" size={20} className="mr-2 text-primary" />
                Recent Invoices
              </h2>
              <div className="space-y-4">
                {formattedInvoices?.slice(0, 2)?.map((invoice) => (
                  <InvoiceCard
                    key={invoice?.id}
                    invoice={invoice}
                    onDownload={(id) => console.log('Download:', id)}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                ))}
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setActiveTab('invoices')}
                  iconName="Eye"
                  iconPosition="left"
                >
                  View All Invoices
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Calendar */}
          <div className="md:col-span-3">
            <div className="mb-6">
              <QuickActionsPanel 
                onManagePayments={() => console.log('Manage payments')}
                stats={monthlyStats}
              />
            </div>
            <CalendarWidget 
              sessions={calendarSessions}
              onDateSelect={(date) => console.log('Selected date:', date)}
            />
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <QuickActionsPanel 
                onManagePayments={() => console.log('Manage payments')}
                stats={monthlyStats}
              />
              <CalendarWidget 
                sessions={calendarSessions}
                onDateSelect={(date) => console.log('Selected date:', date)}
              />
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Calendar" size={20} className="mr-2 text-primary" />
                Upcoming Sessions
              </h2>
              <div className="space-y-4">
                {formattedUpcomingSessions?.map((session) => (
                  <UpcomingSessionCard
                    key={session?.id}
                    session={session}
                    onReschedule={(id) => console.log('Reschedule:', id)}
                    onCancel={(id) => console.log('Cancel:', id)}
                    onViewNotes={(id) => console.log('View notes:', id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Repeat" size={20} className="mr-2 text-primary" />
                My Bookings
              </h2>
              <div className="space-y-4">
                {formattedBookingSeries?.map((booking) => (
                  <BookingSeriesCard
                    key={booking?.id}
                    booking={booking}
                    onModify={(id) => console.log('Modify:', id)}
                    onViewPayments={(id) => setActiveTab('invoices')}
                    onPause={(id) => console.log('Pause:', id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Receipt" size={20} className="mr-2 text-primary" />
                Invoices
              </h2>
              <div className="space-y-4">
                {formattedInvoices?.map((invoice) => (
                  <InvoiceCard
                    key={invoice?.id}
                    invoice={invoice}
                    onDownload={(id) => console.log('Download:', id)}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default ParentDashboard;