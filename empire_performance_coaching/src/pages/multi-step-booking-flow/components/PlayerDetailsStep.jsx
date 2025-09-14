import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

import { supabase } from '../../../lib/supabase';

const PlayerDetailsStep = ({ playerDetails, onPlayerDetailsChange, user }) => {
  const [athletes, setAthletes] = useState([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAthleteForm, setNewAthleteForm] = useState({
    name: '',
    birth_date: '',
    notes: ''
  });

  // Fetch parent's athletes from database
  useEffect(() => {
    const fetchAthletes = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase?.from('athletes')?.select('*')?.eq('parent_id', user?.id)?.order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching athletes:', error);
          setAthletes([]);
        } else {
          setAthletes(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setAthletes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, [user?.id]);

  // Handle athlete selection
  const handleAthleteSelect = (athlete) => {
    onPlayerDetailsChange({
      athlete_id: athlete?.id,
      playerName: athlete?.name,
      dateOfBirth: athlete?.birth_date,
      notes: athlete?.notes || '',
      isNewAthlete: false
    });
  };

  // Handle new athlete creation
  const handleCreateNewAthlete = async () => {
    if (!newAthleteForm?.name?.trim() || !user?.id) return;

    try {
      const { data, error } = await supabase?.from('athletes')?.insert([{
          parent_id: user?.id,
          name: newAthleteForm?.name?.trim(),
          birth_date: newAthleteForm?.birth_date || null,
          notes: newAthleteForm?.notes?.trim() || null
        }])?.select()?.single();

      if (error) {
        console.error('Error creating athlete:', error);
        return;
      }

      // Add to local state
      setAthletes([data, ...athletes]);
      
      // Select the new athlete
      handleAthleteSelect(data);
      
      // Reset form
      setNewAthleteForm({ name: '', birth_date: '', notes: '' });
      setShowAddNew(false);
    } catch (err) {
      console.error('Error creating athlete:', err);
    }
  };

  // Handle manual form input (fallback)
  const handleManualDetailsChange = (field, value) => {
    onPlayerDetailsChange({
      ...playerDetails,
      [field]: value,
      athlete_id: null, // Clear athlete_id when manually entering
      isNewAthlete: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#F5F5F5' }}>
            Player Details
          </h2>
          <p style={{ color: '#CFCFCF' }}>
            Loading your athletes...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={24} className="text-[#C9A43B] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#F5F5F5' }}>
          Player Details
        </h2>
        <p style={{ color: '#CFCFCF' }}>
          {athletes?.length > 0 ? 'Select an athlete or add a new one' : 'Add player information for the booking'}
        </p>
      </div>
      {/* Athletes Selector - Step 4 requirement */}
      {athletes?.length > 0 && (
        <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Users" size={20} className="text-[#C9A43B]" />
            <h3 className="text-lg font-medium" style={{ color: '#F5F5F5' }}>Your Athletes</h3>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            {athletes?.map(athlete => (
              <button
                key={athlete?.id}
                onClick={() => handleAthleteSelect(athlete)}
                className={`text-left p-4 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 ${
                  playerDetails?.athlete_id === athlete?.id
                    ? 'border-[#C9A43B] bg-[#C9A43B]/10'
                    : 'border-[#2A2A2E] hover:border-[#C9A43B]/50 bg-[#2A2A2E]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium" style={{ color: '#F5F5F5' }}>{athlete?.name}</h4>
                  {playerDetails?.athlete_id === athlete?.id && (
                    <Icon name="CheckCircle" size={16} className="text-[#C9A43B]" />
                  )}
                </div>
                {athlete?.birth_date && (
                  <p className="text-sm" style={{ color: '#CFCFCF' }}>
                    Born: {new Date(athlete?.birth_date)?.toLocaleDateString()}
                  </p>
                )}
                {athlete?.notes && (
                  <p className="text-xs mt-1" style={{ color: '#CFCFCF' }}>
                    {athlete?.notes}
                  </p>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#2A2A2E]">
            <button
              onClick={() => setShowAddNew(true)}
              className="flex items-center space-x-2 text-[#C9A43B] hover:text-[#C9A43B]/80 transition-colors focus:outline-none"
            >
              <Icon name="Plus" size={16} />
              <span className="text-sm font-medium">Add New Athlete</span>
            </button>
          </div>
        </div>
      )}
      {/* Add New Athlete Form */}
      {(showAddNew || athletes?.length === 0) && (
        <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Icon name="UserPlus" size={20} className="text-[#C9A43B]" />
              <h3 className="text-lg font-medium" style={{ color: '#F5F5F5' }}>
                {athletes?.length === 0 ? 'Player Information' : 'Add New Athlete'}
              </h3>
            </div>
            {athletes?.length > 0 && (
              <button
                onClick={() => setShowAddNew(false)}
                className="text-[#CFCFCF] hover:text-[#F5F5F5] transition-colors focus:outline-none"
              >
                <Icon name="X" size={20} />
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                Player Name *
              </label>
              <Input
                type="text"
                value={newAthleteForm?.name}
                onChange={(e) => setNewAthleteForm(prev => ({ ...prev, name: e?.target?.value }))}
                placeholder="Enter player's full name"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                Date of Birth
              </label>
              <Input
                type="date"
                value={newAthleteForm?.birth_date}
                onChange={(e) => setNewAthleteForm(prev => ({ ...prev, birth_date: e?.target?.value }))}
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                Notes (Optional)
              </label>
              <textarea
                value={newAthleteForm?.notes}
                onChange={(e) => setNewAthleteForm(prev => ({ ...prev, notes: e?.target?.value }))}
                placeholder="Any additional information about the player..."
                className="w-full px-3 py-2 bg-[#2A2A2E] border border-[#3A3A3E] rounded-lg text-[#F5F5F5] placeholder-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 focus:border-[#C9A43B] resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleCreateNewAthlete}
              disabled={!newAthleteForm?.name?.trim()}
              className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 font-medium focus:ring-2 focus:ring-[#C9A43B]/70"
            >
              {athletes?.length === 0 ? 'Continue with Player' : 'Add Athlete'}
            </Button>
          </div>
        </div>
      )}
      {/* Manual Entry Form (fallback when no athlete selected) */}
      {!playerDetails?.athlete_id && !showAddNew && athletes?.length > 0 && (
        <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-medium mb-4" style={{ color: '#F5F5F5' }}>
            Or enter details manually
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                Player Name *
              </label>
              <Input
                type="text"
                value={playerDetails?.playerName || ''}
                onChange={(e) => handleManualDetailsChange('playerName', e?.target?.value)}
                placeholder="Enter player's full name"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                Date of Birth
              </label>
              <Input
                type="date"
                value={playerDetails?.dateOfBirth || ''}
                onChange={(e) => handleManualDetailsChange('dateOfBirth', e?.target?.value)}
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
                Notes (Optional)
              </label>
              <textarea
                value={playerDetails?.notes || ''}
                onChange={(e) => handleManualDetailsChange('notes', e?.target?.value)}
                placeholder="Any additional information..."
                className="w-full px-3 py-2 bg-[#2A2A2E] border border-[#3A3A3E] rounded-lg text-[#F5F5F5] placeholder-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 focus:border-[#C9A43B] resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}
      {/* Selected Athlete Summary */}
      {playerDetails?.athlete_id && (
        <div className="bg-[#C9A43B]/10 border border-[#C9A43B]/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="UserCheck" size={20} className="text-[#C9A43B]" />
            <div>
              <span className="font-medium" style={{ color: '#F5F5F5' }}>
                Selected Athlete: {playerDetails?.playerName}
              </span>
              {playerDetails?.dateOfBirth && (
                <span className="text-sm ml-2" style={{ color: '#CFCFCF' }}>
                  (Born: {new Date(playerDetails?.dateOfBirth)?.toLocaleDateString()})
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetailsStep;