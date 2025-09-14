import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useSupabaseData = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parent Dashboard Data
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [bookingSeries, setBookingSeries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [athletes, setAthletes] = useState([]);

  // Coach Dashboard Data
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [coachStats, setCoachStats] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Fetch parent dashboard data
  const fetchParentData = async () => {
    if (!user || userProfile?.role !== 'parent') return;

    try {
      setLoading(true);

      // Fetch athletes
      const { data: athletesData, error: athletesError } = await supabase?.from('athletes')?.select('*')?.eq('parent_id', user?.id);

      if (athletesError) throw athletesError;
      setAthletes(athletesData || []);

      const athleteIds = athletesData?.map(a => a?.id) || [];

      // Fetch upcoming sessions
      const { data: sessionsData, error: sessionsError } = await supabase?.from('sessions')?.select(`
          *,
          coach:user_profiles!sessions_coach_id_fkey(full_name),
          session_participants!inner(
            athlete_id,
            attended,
            athlete:athletes(name)
          )
        `)?.in('session_participants.athlete_id', athleteIds)?.gte('start_time', new Date()?.toISOString())?.order('start_time', { ascending: true });

      if (sessionsError) throw sessionsError;
      setUpcomingSessions(sessionsData || []);

      // Fetch booking series
      const { data: bookingsData, error: bookingsError } = await supabase?.from('booking_series')?.select(`
          *,
          coach:user_profiles!booking_series_coach_id_fkey(full_name),
          athlete:athletes(name)
        `)?.eq('parent_id', user?.id);

      if (bookingsError) throw bookingsError;
      setBookingSeries(bookingsData || []);

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase?.from('invoices')?.select(`
          *,
          invoice_items(*)
        `)?.eq('parent_id', user?.id)?.order('issue_date', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);

    } catch (err) {
      console.error('Error fetching parent data:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch coach dashboard data
  const fetchCoachData = async () => {
    if (!user || userProfile?.role !== 'coach') return;

    try {
      setLoading(true);

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))?.toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999))?.toISOString();

      // Fetch today's sessions
      const { data: sessionsData, error: sessionsError } = await supabase?.from('sessions')?.select(`
          *,
          session_participants(
            *,
            athlete:athletes(name)
          )
        `)?.eq('coach_id', user?.id)?.gte('start_time', startOfDay)?.lte('start_time', endOfDay)?.order('start_time', { ascending: true });

      if (sessionsError) throw sessionsError;
      setTodaysSessions(sessionsData || []);

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase?.from('notifications')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(10);

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

      // Calculate basic stats
      const totalSessions = sessionsData?.length || 0;
      const completedSessions = sessionsData?.filter(s => s?.status === 'completed')?.length || 0;
      const totalParticipants = sessionsData?.reduce((sum, s) => sum + (s?.session_participants?.length || 0), 0) || 0;
      const attendedParticipants = sessionsData?.reduce((sum, s) => 
        sum + (s?.session_participants?.filter(p => p?.attended)?.length || 0), 0) || 0;

      setCoachStats({
        totalSessions,
        completedSessions,
        attendanceRate: totalParticipants > 0 ? (attendedParticipants / totalParticipants * 100)?.toFixed(1) : 0
      });

    } catch (err) {
      console.error('Error fetching coach data:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Update session attendance
  const updateAttendance = async (sessionId, athleteId, attended) => {
    try {
      const { error } = await supabase?.from('session_participants')?.update({ attended })?.eq('session_id', sessionId)?.eq('athlete_id', athleteId);

      if (error) throw error;

      // Refresh data
      if (userProfile?.role === 'coach') {
        fetchCoachData();
      }
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(err?.message);
    }
  };

  // Update session notes
  const updateSessionNotes = async (sessionId, notes) => {
    try {
      const { error } = await supabase?.from('sessions')?.update({ notes })?.eq('id', sessionId);

      if (error) throw error;

      // Refresh data
      if (userProfile?.role === 'coach') {
        fetchCoachData();
      }
    } catch (err) {
      console.error('Error updating session notes:', err);
      setError(err?.message);
    }
  };

  // Fetch data based on user role
  useEffect(() => {
    if (user && userProfile) {
      if (userProfile?.role === 'parent') {
        fetchParentData();
      } else if (userProfile?.role === 'coach') {
        fetchCoachData();
      }
    }
  }, [user, userProfile]);

  return {
    loading,
    error,
    // Parent data
    upcomingSessions,
    bookingSeries,
    invoices,
    athletes,
    // Coach data
    todaysSessions,
    coachStats,
    notifications,
    // Actions
    updateAttendance,
    updateSessionNotes,
    refetchData: userProfile?.role === 'parent' ? fetchParentData : fetchCoachData
  };
};