import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import SEO from '../../components/SEO';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AuthGuard from '../../components/ui/AuthGuard';
import CoachHeader from './components/CoachHeader';
import QuickStats from './components/QuickStats';
import TodaysSchedule from './components/TodaysSchedule';
import UpcomingSchedule from './components/UpcomingSchedule';
import WeeklyOverview from './components/WeeklyOverview';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';


const CoachDashboard = () => {
  const { user } = useAuth();
  const [coachData, setCoachData] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    is_active: true
  });

  // Fetch coach data and availability
  useEffect(() => {
    const fetchCoachData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Fixed: Correct foreign key reference and proper join syntax
        const { data: coachProfile, error: coachError } = await supabase?.from('coaches')?.select(`
            *,
            user_profiles (
              full_name,
              email,
              phone,
              role
            )
          `)?.eq('id', user?.id)?.single();

        if (coachError) {
          console.error('Error fetching coach profile:', coachError);
        } else {
          setCoachData(coachProfile);
        }

        // Fetch coach availability (coaches can only manage their own)
        const { data: availabilityData, error: availabilityError } = await supabase?.from('coach_availability')?.select('*')?.eq('coach_id', user?.id)?.order('day_of_week', { ascending: true });

        if (availabilityError) {
          console.error('Error fetching availability:', availabilityError);
        } else {
          setAvailability(availabilityData || []);
        }

      } catch (error) {
        console.error('Error in fetchCoachData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachData();
  }, [user?.id]);

  // Handle availability creation
  const handleCreateAvailability = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase?.from('coach_availability')?.insert([{
          coach_id: user?.id,
          ...newAvailability
        }])?.select()?.single();

      if (error) {
        console.error('Error creating availability:', error);
        return;
      }

      setAvailability(prev => [...prev, data]);
      setShowAvailabilityModal(false);
      setNewAvailability({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        location: '',
        is_active: true
      });

    } catch (error) {
      console.error('Error creating availability:', error);
    }
  };

  // Handle availability update
  const handleUpdateAvailability = async (id, updates) => {
    try {
      const { data, error } = await supabase?.from('coach_availability')?.update(updates)?.eq('id', id)?.eq('coach_id', user?.id)?.select()?.single();

      if (error) {
        console.error('Error updating availability:', error);
        return;
      }

      setAvailability(prev => 
        prev?.map(item => item?.id === id ? data : item)
      );

    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  // Handle availability deletion
  const handleDeleteAvailability = async (id) => {
    try {
      const { error } = await supabase?.from('coach_availability')?.delete()?.eq('id', id)?.eq('coach_id', user?.id); // Ensure coach can only delete their own

      if (error) {
        console.error('Error deleting availability:', error);
        return;
      }

      setAvailability(prev => prev?.filter(item => item?.id !== id));

    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Add default props for components
  const mockStats = {
    totalSessions: 0,
    todaySessions: 0,
    totalClients: 0,
    revenue: 0
  };

  const mockSessions = [];
  const mockUpcomingSessions = [];
  const mockWeekData = {
    sessions: [],
    totalHours: 0,
    completedSessions: 0
  };

  const handleAttendanceToggle = (sessionId) => {
    // Mock function for attendance toggle
    console.log('Toggle attendance for session:', sessionId);
  };

  const handleNotesUpdate = (sessionId, notes) => {
    // Mock function for notes update
    console.log('Update notes for session:', sessionId, notes);
  };

  const handleCashToggle = (sessionId) => {
    // Mock function for cash toggle
    console.log('Toggle cash for session:', sessionId);
  };

  const handleViewAll = () => {
    // Mock function for view all
    console.log('View all upcoming sessions');
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="coach">
        <div className="min-h-screen bg-[#0E0E10] flex items-center justify-center">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="text-[#C9A43B] animate-spin mx-auto mb-4" />
            <p style={{ color: '#CFCFCF' }}>Loading coach dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <>
      <SEO title="Coach Dashboard - Empire Performance Coaching" canonical="/coach-dashboard" />
      <AuthGuard allowedRoles={["coach"]}>
        <DashboardLayout>
          <CoachHeader 
            coachData={coachData}
            coachName={coachData?.user_profiles?.full_name || 'Coach'}
            currentDate={new Date()?.toISOString()?.split('T')?.[0]}
            todaySessionCount={mockStats?.todaySessions}
          />

          <div className="w-full px-6 md:px-8 py-8">
            {/* Coach Availability Management Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#F5F5F5' }}>
                  My Availability
                </h2>
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70"
                >
                  <Icon name="Plus" size={16} className="inline mr-2" />
                  Set Availability
                </button>
              </div>

              {availability?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {availability?.map(slot => (
                    <div
                      key={slot?.id}
                      className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold" style={{ color: '#F5F5F5' }}>
                          {dayNames?.[slot?.day_of_week]}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateAvailability(slot?.id, { is_active: !slot?.is_active })}
                            className={`w-4 h-4 rounded-full ${slot?.is_active ? 'bg-green-400' : 'bg-gray-400'}`}
                          />
                          <button
                            onClick={() => handleDeleteAvailability(slot?.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm" style={{ color: '#CFCFCF' }}>
                        <div className="flex items-center space-x-2">
                          <Icon name="Clock" size={14} />
                          <span>{slot?.start_time} - {slot?.end_time}</span>
                        </div>
                        {slot?.location && (
                          <div className="flex items-center space-x-2">
                            <Icon name="MapPin" size={14} />
                            <span>{slot?.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Icon name="Circle" size={14} className={slot?.is_active ? 'text-green-400' : 'text-gray-400'} />
                          <span>{slot?.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-lg">
                  <Icon name="Calendar" size={48} className="mx-auto mb-4" style={{ color: '#CFCFCF' }} />
                  <h3 className="text-lg font-medium mb-2" style={{ color: '#F5F5F5' }}>No availability set</h3>
                  <p className="mb-6" style={{ color: '#CFCFCF' }}>Set your available hours to start receiving bookings</p>
                  <button
                    onClick={() => setShowAvailabilityModal(true)}
                    className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70"
                  >
                    Set Availability
                  </button>
                </div>
              )}
            </div>

            {/* Existing dashboard components */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <QuickStats stats={mockStats} />
                <TodaysSchedule 
                  sessions={mockSessions}
                  onAttendanceToggle={handleAttendanceToggle}
                  onNotesUpdate={handleNotesUpdate}
                  onCashToggle={handleCashToggle}
                />
                <UpcomingSchedule 
                  upcomingSessions={mockUpcomingSessions}
                  onViewAll={handleViewAll}
                />
              </div>
              <div>
                <WeeklyOverview 
                  weekData={mockWeekData}
                  currentDate={new Date()?.toISOString()?.split('T')?.[0]}
                />
              </div>
            </div>
          </div>

          {/* Availability Modal */}
          {showAvailabilityModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowAvailabilityModal(false)}
              />
              <div className="relative bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
                    Set Availability
                  </h3>
                  <button
                    onClick={() => setShowAvailabilityModal(false)}
                    className="text-[#CFCFCF] hover:text-[#F5F5F5] transition-colors"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                      Day of Week
                    </label>
                    <select
                      value={newAvailability?.day_of_week}
                      onChange={(e) => setNewAvailability(prev => ({ ...prev, day_of_week: parseInt(e?.target?.value) }))}
                      className="w-full px-3 py-2 bg-[#2A2A2E] border border-[#3A3A3E] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50"
                    >
                      {dayNames?.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newAvailability?.start_time}
                        onChange={(e) => setNewAvailability(prev => ({ ...prev, start_time: e?.target?.value }))}
                        className="w-full px-3 py-2 bg-[#2A2A2E] border border-[#3A3A3E] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newAvailability?.end_time}
                        onChange={(e) => setNewAvailability(prev => ({ ...prev, end_time: e?.target?.value }))}
                        className="w-full px-3 py-2 bg-[#2A2A2E] border border-[#3A3A3E] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                      Location
                    </label>
                    <select
                      value={newAvailability?.location}
                      onChange={(e) => setNewAvailability(prev => ({ ...prev, location: e?.target?.value }))}
                      className="w-full px-3 py-2 bg-[#2A2A2E] border border-[#3A3A3E] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50"
                    >
                      <option value="">Select Location</option>
                      <option value="Lochwinnoch — Lochbarr Services Leisure Centre">Lochwinnoch</option>
                      <option value="Airdrie — Venue TBC">Airdrie</option>
                      <option value="East Kilbride — Venue TBC">East Kilbride</option>
                      <option value="Glasgow South / Castlemilk — Venue TBC">Glasgow South</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAvailabilityModal(false)}
                    className="px-4 py-2 text-[#CFCFCF] hover:text-[#F5F5F5] transition-colors focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAvailability}
                    className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </DashboardLayout>
      </AuthGuard>
    </>
  );
};

export default CoachDashboard;