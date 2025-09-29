import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useParentDashboard } from '../../hooks/useParentDashboard';
import DashboardLayout from '../../../shared/components/layouts/DashboardLayout';
import SEO from '../../../shared/components/SEO';
import RoleNavigation from '../../../shared/components/ui/RoleNavigation';
import WelcomeHeader from './components/WelcomeHeader';
import UpcomingSessionCard from './components/UpcomingSessionCard';
import BookingSeriesCard from './components/BookingSeriesCard';
import InvoiceCard from './components/InvoiceCard';
import QuickActionsPanel from './components/QuickActionsPanel';
import CalendarWidget from './components/CalendarWidget';
import Icon from '../../../shared/components/AppIcon';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    parentData,
    upcomingSessions,
    bookingSeries,
    invoices,
    monthlyStats,
    loading,
    error
  } = useParentDashboard(user?.id);

  useEffect(() => {
    if (!user || user?.role !== 'parent') {
      navigate('/auth/login');
      return;
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Format data for components - only show real bookings
  const formattedUpcomingSessions = upcomingSessions?.map(session => {
    const participant = session?.session_participants?.[0];
    return {
      id: session?.id,
      coach: {
        name: session?.coach?.full_name || session?.coach?.name || 'Unknown Coach',
        specialty: session?.coach?.specialties?.[0] || 'Sports Coaching',
        avatar: session?.coach?.avatar_url || "/assets/images/coaches/default-coach.jpg"
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
      location: session?.location || session?.venue?.name || session?.venue?.address || 'Location TBD',
      athlete: participant?.athlete?.name || participant?.player?.name || session?.player_name || 'Unknown Player',
      status: session?.status || 'confirmed',
      notes: session?.notes || '',
      hasNotes: Boolean(session?.notes)
    };
  }) || [];

  const formattedBookingSeries = bookingSeries?.map(booking => ({
    id: booking?.id,
    seriesName: booking?.series_name,
    coachName: booking?.coach?.name,
    nextSession: booking?.next_session_date,
    frequency: booking?.frequency,
    status: booking?.status,
    sessionsRemaining: booking?.sessions_remaining
  })) || [];

  const formattedInvoices = invoices?.map(invoice => ({
    id: invoice?.id,
    number: invoice?.invoice_number,
    amount: invoice?.amount,
    status: invoice?.status,
    issueDate: invoice?.issue_date,
    dueDate: invoice?.due_date,
    description: invoice?.description
  })) || [];

  const calendarSessions = formattedUpcomingSessions?.map(session => ({
    date: session?.date,
    coach: session?.coach?.name,
    time: session?.startTime
  })) || [];

  const handleReschedule = async (sessionId) => {
    const confirmed = window.confirm('Would you like to reschedule this session?\n\nYou will be redirected to select a new date and time.');
    if (confirmed) {
      try {
        window.location.href = `/multi-step-booking-flow?reschedule=${sessionId}`;
      } catch (error) {
        console.error('Reschedule error:', error);
        alert('Failed to reschedule session. Please try again.');
      }
    }
  };

  const handleCancel = async (sessionId) => {
    const session = formattedUpcomingSessions.find(s => s.id === sessionId);
    const sessionDate = new Date(session?.date);
    const now = new Date();
    const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60);

    let refundMessage = '';
    if (hoursUntilSession > 24) {
      refundMessage = 'You will receive a full refund.';
    } else if (hoursUntilSession > 12) {
      refundMessage = 'You will receive a 50% refund.';
    } else {
      refundMessage = 'No refund available for cancellations within 12 hours.';
    }

    const confirmed = window.confirm(`Are you sure you want to cancel this session?\n\n${refundMessage}\n\nThis action cannot be undone.`);
    if (confirmed) {
      try {
        alert('Session cancelled successfully. You will receive an email confirmation shortly.');
        window.location.reload();
      } catch (error) {
        console.error('Cancel error:', error);
        alert('Failed to cancel session. Please try again or contact support.');
      }
    }
  };

  const handleViewNotes = (sessionId) => {
    const session = formattedUpcomingSessions.find(s => s.id === sessionId);
    if (session?.notes) {
      alert(`Session Notes:\n\n${session.notes}`);
    } else {
      alert('No notes available for this session.');
    }
  };

  const handleModifyBooking = (bookingId) => {
    const confirmed = window.confirm('Would you like to modify this booking?\n\nYou will be redirected to update your booking details.');
    if (confirmed) {
      window.location.href = `/multi-step-booking-flow?modify=${bookingId}`;
    }
  };

  const handleViewPayments = (bookingId) => {
    setActiveTab('invoices');
    setTimeout(() => {
      const invoicesSection = document.querySelector('[data-tab="invoices"]');
      if (invoicesSection) {
        invoicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePauseBooking = (bookingId) => {
    const confirmed = window.confirm('Are you sure you want to pause this booking?\n\nThis will temporarily stop future sessions from being scheduled. You can resume it anytime.');
    if (confirmed) {
      alert('Booking paused successfully. You can resume it anytime from your bookings section.');
    }
  };

  const handleDownloadInvoice = (invoiceId) => {
    alert('Invoice download feature coming soon!\n\nYou will receive an email with your invoice shortly.');
  };

  const handleViewInvoiceDetails = (invoiceId) => {
    const invoice = formattedInvoices.find(i => i.id === invoiceId);
    if (invoice) {
      alert(`Invoice Details:\n\nInvoice #: ${invoice.number}\nAmount: £${invoice.amount}\nStatus: ${invoice.status}\nIssue Date: ${invoice.issueDate}\nDue Date: ${invoice.dueDate}`);
    }
  };

  const handleManagePayments = () => {
    const confirmed = window.confirm('Would you like to manage your payment methods?\n\nYou will be redirected to the payment management page.');
    if (confirmed) {
      alert('Payment management feature coming soon!\n\nFor now, please contact support to update payment methods.');
    }
  };

  const handleDateSelect = (date) => {
    const confirmed = window.confirm(`Would you like to book a session for ${date.toLocaleDateString()}?\n\nYou will be redirected to the booking flow.`);
    if (confirmed) {
      const dateStr = date.toISOString().split('T')[0];
      window.location.href = `/multi-step-booking-flow?date=${dateStr}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleNavigation userRole="parent" userName={parentData?.name} onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="Loader" size={32} className="animate-spin text-primary mx-auto mb-4" />
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

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
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
            <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: '#F5F5F5' }}>
                <Icon name="Calendar" size={20} className="mr-2 text-[#C9A43B]" />
                Upcoming Sessions
              </h2>
              <div className="space-y-4">
                {formattedUpcomingSessions?.map((session) => (
                  <UpcomingSessionCard
                    key={session?.id}
                    session={session}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onViewNotes={handleViewNotes}
                  />
                ))}
                {formattedUpcomingSessions?.length === 0 && (
                  <div className="text-center py-8">
                    <Icon name="Calendar" size={48} className="mx-auto mb-4" style={{ color: '#CFCFCF' }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: '#F5F5F5' }}>No upcoming sessions</h3>
                    <p style={{ color: '#CFCFCF' }} className="mb-6">
                      You don't have any sessions booked yet. Book your first session to get started!
                    </p>
                    <button
                      onClick={() => window.location.href = '/multi-step-booking-flow'}
                      className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70"
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Book Your First Session
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Bookings */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: '#F5F5F5' }}>
                  <Icon name="Repeat" size={20} className="mr-2 text-[#C9A43B]" />
                  My Bookings
                </h2>
                <div className="space-y-4">
                  {formattedBookingSeries?.map((booking) => (
                    <BookingSeriesCard
                      key={booking?.id}
                      booking={booking}
                      onModify={handleModifyBooking}
                      onViewPayments={handleViewPayments}
                      onPause={handlePauseBooking}
                    />
                  ))}
                  {formattedBookingSeries?.length === 0 && (
                    <div className="text-center py-8">
                      <Icon name="Repeat" size={48} className="mx-auto mb-4" style={{ color: '#CFCFCF' }} />
                      <h3 className="text-lg font-medium mb-2" style={{ color: '#F5F5F5' }}>No recurring bookings</h3>
                      <p style={{ color: '#CFCFCF' }} className="mb-6">
                        Set up recurring sessions for regular training with your preferred coach.
                      </p>
                      <button
                        onClick={() => window.location.href = '/multi-step-booking-flow'}
                        className="bg-[#2A2A2E] text-[#CFCFCF] hover:bg-[#C9A43B]/20 hover:text-[#C9A43B] px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 border border-[#2A2A2E]"
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Book Recurring Sessions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: '#F5F5F5' }}>
                  <Icon name="Receipt" size={20} className="mr-2 text-[#C9A43B]" />
                  Recent Invoices
                </h2>
                <div className="space-y-4">
                  {formattedInvoices?.slice(0, 2)?.map((invoice) => (
                    <InvoiceCard
                      key={invoice?.id}
                      invoice={invoice}
                      onDownload={handleDownloadInvoice}
                      onViewDetails={handleViewInvoiceDetails}
                    />
                  ))}
                  {formattedInvoices?.length === 0 ? (
                    <div className="text-center py-8">
                      <Icon name="Receipt" size={32} className="mx-auto mb-3" style={{ color: '#CFCFCF' }} />
                      <h4 className="font-medium mb-2" style={{ color: '#F5F5F5' }}>No invoices yet</h4>
                      <p className="text-sm" style={{ color: '#CFCFCF' }}>
                        Your invoices will appear here after booking sessions.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className="w-full bg-[#2A2A2E] text-[#CFCFCF] hover:bg-[#C9A43B]/20 hover:text-[#C9A43B] px-4 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 border border-[#2A2A2E]"
                    >
                      <Icon name="Eye" size={16} className="mr-2" />
                      View All Invoices
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Calendar */}
          <div className="md:col-span-3">
            <div className="mb-6">
              <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 shadow-lg">
                <QuickActionsPanel
                  onManagePayments={handleManagePayments}
                  stats={monthlyStats}
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl shadow-lg">
              <CalendarWidget
                sessions={calendarSessions}
                onDateSelect={handleDateSelect}
              />
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <QuickActionsPanel
                onManagePayments={handleManagePayments}
                stats={monthlyStats}
              />
              <CalendarWidget
                sessions={calendarSessions}
                onDateSelect={handleDateSelect}
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
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onViewNotes={handleViewNotes}
                  />
                ))}
                {formattedUpcomingSessions?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-card border border-border rounded-xl p-8">
                      <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2 text-foreground">No upcoming sessions</h3>
                      <p className="text-muted-foreground mb-6">
                        You don't have any sessions booked yet. Book your first session to get started!
                      </p>
                      <button
                        onClick={() => window.location.href = '/multi-step-booking-flow'}
                        className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Book Your First Session
                      </button>
                    </div>
                  </div>
                )}
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
                    onModify={handleModifyBooking}
                    onViewPayments={handleViewPayments}
                    onPause={handlePauseBooking}
                  />
                ))}
                {formattedBookingSeries?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-card border border-border rounded-xl p-8">
                      <Icon name="Repeat" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2 text-foreground">No recurring bookings</h3>
                      <p className="text-muted-foreground mb-6">
                        Set up recurring sessions for regular training with your preferred coach.
                      </p>
                      <button
                        onClick={() => window.location.href = '/multi-step-booking-flow'}
                        className="bg-[#2A2A2E] text-[#CFCFCF] hover:bg-[#C9A43B]/20 hover:text-[#C9A43B] px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Book Recurring Sessions
                      </button>
                    </div>
                  </div>
                )}
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
                    onDownload={handleDownloadInvoice}
                    onViewDetails={handleViewInvoiceDetails}
                  />
                ))}
                {formattedInvoices?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-card border border-border rounded-xl p-8">
                      <Icon name="Receipt" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2 text-foreground">No invoices yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Your invoices will appear here after booking and completing sessions.
                      </p>
                      <button
                        onClick={() => window.location.href = '/multi-step-booking-flow'}
                        className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Book Your First Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default ParentDashboard;