import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useParentDashboard = (userId) => {
  const [parentData, setParentData] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [bookingSeries, setBookingSeries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchParentDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch parent profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Set parent data with fallback
        setParentData({
          name: profileData?.full_name || profileData?.name || 'Parent User',
          email: profileData?.email || '',
          quickStats: {
            upcomingSessions: 0,
            activeBookings: 0,
            totalHours: 0
          }
        });

        // Try to fetch sessions with fallback to mock data
        try {
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('sessions')
            .select(`
              *,
              coach:coaches(*),
              session_participants(
                athlete:athletes(*)
              )
            `)
            .eq('parent_id', userId)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(10);

          if (sessionsError) {
            console.warn('Sessions query failed, using fallback:', sessionsError);
          }

          setUpcomingSessions(sessionsData || []);
        } catch (sessionError) {
          console.warn('Failed to fetch sessions:', sessionError);
          setUpcomingSessions([]);
        }

        // Set empty data for other sections with fallbacks
        setBookingSeries([]);
        setInvoices([]);
        setMonthlyStats({
          monthlyCompleted: 0,
          monthlySpent: 0,
          progressScore: 0,
          notifications: []
        });

      } catch (error) {
        console.error('Error fetching parent dashboard data:', error);
        setError(error.message);

        // Set fallback data
        setParentData({
          name: 'Parent User',
          email: '',
          quickStats: {
            upcomingSessions: 0,
            activeBookings: 0,
            totalHours: 0
          }
        });
        setUpcomingSessions([]);
        setBookingSeries([]);
        setInvoices([]);
        setMonthlyStats({
          monthlyCompleted: 0,
          monthlySpent: 0,
          progressScore: 0,
          notifications: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParentDashboardData();
  }, [userId]);

  return {
    parentData,
    upcomingSessions,
    bookingSeries,
    invoices,
    monthlyStats,
    loading,
    error
  };
};