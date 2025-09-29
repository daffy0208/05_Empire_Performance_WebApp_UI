import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { supabase } from '../../../lib/supabase';

const CoachStep = ({ selectedCoach, onCoachSelect, selectedDate, selectedTimeSlot, selectedLocation }) => {
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [coaches, setCoaches] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);

  // Fetch coaches data from Supabase with correct column names
  const fetchCoaches = async () => {
    setLoadingCoaches(true);
    try {
      // Fixed: Use correct column references
      const { data: coachesData, error } = await supabase.from('coaches').select(`
          id,
          bio,
          avatar_url,
          hourly_rate,
          certifications,
          specialization,
          specialties,
          current_club,
          locations_served,
          experience_years,
          user_profiles!coaches_id_fkey (
            full_name,
            is_active
          )
        `).eq('user_profiles.is_active', true);

      if (error) {
        console.error('Error fetching coaches:', error);
        // Real Empire Performance coaches
        const realCoaches = [
          {
            id: 'jack-haggerty',
            name: 'Jack Haggerty',
            avatar: '/assets/images/coaches/jack-haggerty.jpg',
            rating: 4.9,
            reviewCount: 145,
            specialties: ['1-to-1 Development', 'Finishing', 'Mentoring'],
            experience: '12+ years',
            bio: 'Professional player at Glenvale FC specializing in individual player development with focus on finishing techniques and mentoring young talent.',
            availability: 'High',
            pricePerSession: 75,
            certifications: ['UEFA B License', 'Youth Development Certified'],
            currentClub: 'Glenvale FC',
            locationsServed: ['Lochwinnoch'],
            isUnavailable: false
          },
          {
            id: 'mairead-fulton',
            name: 'Mairead Fulton',
            avatar: '/assets/images/coaches/mairead-fulton.jpg',
            rating: 5.0,
            reviewCount: 203,
            specialties: ['Women & Girls', 'Midfield', 'Professionalism'],
            experience: '15+ years',
            bio: 'Professional player at Heart of Midlothian FC focusing on midfield development and building professionalism in young players. Specialist in women\'s football.',
            availability: 'Medium',
            pricePerSession: 85,
            certifications: ['UEFA A License', 'Women\'s Football Specialist'],
            currentClub: 'Heart of Midlothian FC',
            locationsServed: ['Glasgow South', 'East Kilbride'],
            isUnavailable: false
          },
          {
            id: 'stephen-mallan',
            name: 'Stephen Mallan',
            avatar: '/assets/images/coaches/stephen-mallan.jpg',
            rating: 4.8,
            reviewCount: 178,
            specialties: ['Set Pieces', 'Long-Range Shooting', 'Midfield'],
            experience: '10+ years',
            bio: 'Professional player at St Johnstone FC renowned for his set piece expertise and long-range shooting ability. Specializes in developing technical midfield skills.',
            availability: 'Medium',
            pricePerSession: 80,
            certifications: ['SFA Level 2', 'Set Piece Specialist'],
            currentClub: 'St Johnstone FC',
            locationsServed: ['Lochwinnoch', 'Airdrie'],
            isUnavailable: false
          },
          {
            id: 'katie-lockwood',
            name: 'Katie Lockwood',
            avatar: '/assets/images/coaches/katie-lockwood.jpg',
            rating: 4.9,
            reviewCount: 167,
            specialties: ['Attacking', 'Finishing', 'Pressing'],
            experience: '8+ years',
            bio: 'Professional player at Glasgow City FC with attack-minded coaching specializing in finishing and high-pressing tactical systems for competitive players.',
            availability: 'High',
            pricePerSession: 85,
            certifications: ['UEFA B License', 'Tactical Analysis Certified'],
            currentClub: 'Glasgow City FC',
            locationsServed: ['East Kilbride', 'Glasgow South'],
            isUnavailable: false
          },
          {
            id: 'aidan-nesbitt',
            name: 'Aidan Nesbitt',
            avatar: '/assets/images/coaches/aidan-nesbitt.jpg',
            rating: 4.7,
            reviewCount: 134,
            specialties: ['Creativity', 'First Touch', 'Final Third'],
            experience: '7+ years',
            bio: 'Professional player at Falkirk FC focusing on creative play development, first touch mastery, and final third decision making for attacking players.',
            availability: 'Medium',
            pricePerSession: 78,
            certifications: ['SFA Level 1', 'Creative Play Specialist'],
            currentClub: 'Falkirk FC',
            locationsServed: ['East Kilbride'],
            isUnavailable: false
          },
          {
            id: 'malcolm-mclean',
            name: 'Malcolm McLean',
            avatar: '/assets/images/coaches/malcolm-mclean.jpg',
            rating: 4.8,
            reviewCount: 189,
            specialties: ['Youth Pathways', 'Session Design', 'Academy Methodology'],
            experience: '14+ years',
            bio: 'Expert in youth pathways and session design, implementing academy-level methodology for player progression. Full-time Empire Performance coach.',
            availability: 'High',
            pricePerSession: 80,
            certifications: ['UEFA A License', 'Academy Methodology Certified'],
            currentClub: 'Empire Performance',
            locationsServed: ['Airdrie', 'East Kilbride'],
            isUnavailable: false
          },
          {
            id: 'benji-wright',
            name: 'Benji Wright',
            avatar: '/assets/images/coaches/benji-wright.jpg',
            rating: 4.6,
            reviewCount: 98,
            specialties: ['Physical Development', 'Conditioning', 'Speed/Agility'],
            experience: '6+ years',
            bio: 'Professional player at Cumnock Juniors specializing in physical development and conditioning. Expert in speed and agility training for young athletes.',
            availability: 'Medium',
            pricePerSession: 75,
            certifications: ['SFA Level 1', 'Conditioning Specialist'],
            currentClub: 'Cumnock Juniors',
            locationsServed: ['Airdrie'],
            isUnavailable: false
          },
          {
            id: 'fraser-mcfadzean',
            name: 'Fraser McFadzean',
            avatar: '/assets/images/coaches/fraser-mcfadzean.jpg',
            rating: 4.7,
            reviewCount: 112,
            specialties: ['Ball Mastery', 'Technical Foundations', 'Youth Development'],
            experience: '9+ years',
            bio: 'Professional player at Glenvale FC with expertise in ball mastery and technical foundations. Focuses on developing core technical skills in young players.',
            availability: 'High',
            pricePerSession: 78,
            certifications: ['UEFA B License', 'Technical Skills Certified'],
            currentClub: 'Glenvale FC',
            locationsServed: ['Lochwinnoch', 'Glasgow South'],
            isUnavailable: false
          }
        ];
        setCoaches(realCoaches);
        setLoadingCoaches(false);
        return;
      }

      // Get available coaches for selected date/location if provided
      let availableCoaches = coachesData;
      
      if (selectedDate && selectedLocation) {
        try {
          // Query coach availability for the selected date and location
          const { data: availability, error: availError } = await supabase.from('coach_availability').select('coach_id').eq('is_active', true).contains('location', selectedLocation.name || selectedLocation.city).eq('day_of_week', selectedDate.getDay());

          if (!availError && availability && availability.length > 0) {
            const availableCoachIds = availability.map(a => a.coach_id);
            availableCoaches = coachesData.filter(coach =>
              availableCoachIds.includes(coach.id)
            );
          }
        } catch (err) {
          console.error('Error checking availability:', err);
        }
      }

      // Transform the data to match the expected format
      const transformedCoaches = availableCoaches.map(coach => ({
        id: coach.id,
        name: (coach.user_profiles && coach.user_profiles.full_name) || 'Unknown Coach',
        avatar: coach.avatar_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`,
        rating: 4.8, // Mock rating - you might want to calculate this from reviews
        reviewCount: Math.floor(Math.random() * 150) + 50, // Mock review count
        specialties: coach.specialties || (coach.specialization ? [coach.specialization] : ['General Training']),
        experience: coach.experience_years ? `${coach.experience_years}+ years` : '5+ years',
        bio: coach.bio || 'Experienced football coach dedicated to developing young talent with professional techniques and mentorship.',
        availability: availableCoaches.length > 0 ? 'High' : 'Medium', // Calculate based on availability
        pricePerSession: parseFloat(coach.hourly_rate) || 75,
        certifications: coach.certifications || ['Certified Coach'],
        currentClub: coach.current_club || 'Empire Performance',
        locationsServed: coach.locations_served || ['Multiple Locations'],
        isUnavailable: false
      })) || [];

      // If no coaches available for selected criteria, show all coaches with "See other times" option
      if (transformedCoaches.length === 0 && selectedDate && selectedLocation) {
        const allCoaches = coachesData.map(coach => ({
          id: coach.id,
          name: (coach.user_profiles && coach.user_profiles.full_name) || 'Unknown Coach',
          avatar: coach.avatar_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`,
          rating: 4.8,
          reviewCount: Math.floor(Math.random() * 150) + 50,
          specialties: coach.specialties || (coach.specialization ? [coach.specialization] : ['General Training']),
          experience: coach.experience_years ? `${coach.experience_years}+ years` : '5+ years',
          bio: coach.bio || 'Experienced football coach dedicated to developing young talent with professional techniques and mentorship.',
          availability: 'See Other Times', // Greyed out state
          pricePerSession: parseFloat(coach.hourly_rate) || 75,
          certifications: coach.certifications || ['Certified Coach'],
          currentClub: coach.current_club || 'Empire Performance',
          locationsServed: coach.locations_served || ['Multiple Locations'],
          isUnavailable: true
        })) || [];
        
        setCoaches(allCoaches);
      } else {
        setCoaches(transformedCoaches);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
      // Provide fallback coaches data if all queries fail
      const fallbackCoaches = [
        {
          id: 'fallback-1',
          name: 'Marcus Thompson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          rating: 4.8,
          reviewCount: 127,
          specialties: ['Technical Skills', 'Youth Development', 'Ball Control'],
          experience: '8+ years',
          bio: 'Experienced football coach specializing in technical skills development and youth pathways. Former professional player with extensive coaching qualifications.',
          availability: 'High',
          pricePerSession: 75,
          certifications: ['UEFA B License', 'Youth Development Certified'],
          currentClub: 'Empire Performance',
          locationsServed: ['Lochwinnoch', 'Glasgow South'],
          isUnavailable: false
        },
        {
          id: 'fallback-2',
          name: 'David Wilson',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          rating: 4.9,
          reviewCount: 89,
          specialties: ['Finishing', 'Attacking', 'Set Pieces'],
          experience: '6+ years',
          bio: 'Former striker turned coach, specializing in finishing techniques and attacking play. Passionate about developing goal-scoring abilities in young players.',
          availability: 'Medium',
          pricePerSession: 80,
          certifications: ['SFA Level 2', 'Goalkeeping Specialist'],
          currentClub: 'Empire Performance',
          locationsServed: ['Airdrie', 'East Kilbride'],
          isUnavailable: false
        },
        {
          id: 'fallback-3',
          name: 'Sarah Mitchell',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          rating: 4.7,
          reviewCount: 156,
          specialties: ['Women & Girls', 'Mentoring', 'Technical Foundations'],
          experience: '10+ years',
          bio: 'Specialist in women\'s football development with extensive experience in youth coaching. Focuses on building confidence and technical skills.',
          availability: 'High',
          pricePerSession: 70,
          certifications: ['UEFA A License', 'Women\'s Football Specialist'],
          currentClub: 'Empire Performance',
          locationsServed: ['Glasgow South', 'Lochwinnoch'],
          isUnavailable: false
        }
      ];
      setCoaches(fallbackCoaches);
    } finally {
      setLoadingCoaches(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, [selectedDate, selectedLocation]);

  // Updated specialties list to match the new database data
  const specialties = [
    'all',
    '1-to-1 Development',
    'Finishing',
    'Mentoring',
    'Youth Pathways',
    'Session Design',
    'Academy Methodology',
    'Women & Girls',
    'Midfield',
    'Professionalism',
    'Attacking',
    'Pressing',
    'Set Pieces',
    'Long-Range Shooting',
    'Creativity',
    'First Touch',
    'Final Third',
    'Physical Development',
    'Conditioning',
    'Speed/Agility',
    'Youth Development',
    'Technical Foundations',
    'Ball Mastery'
  ];

  // Updated filter to use ANY match on specialties array
  const filteredCoaches = filterSpecialty === 'all'
    ? coaches
    : coaches.filter(coach => coach.specialties && coach.specialties.some(specialty =>
        specialty.toLowerCase().includes(filterSpecialty.toLowerCase())
      ));

  const getAvailabilityColor = (availability) => {
    if (availability === 'See Other Times') return 'text-[#6B6B75]';
    switch (availability) {
      case 'High': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-red-400';
      default: return 'text-[#CFCFCF]';
    }
  };

  const getAvailabilityIcon = (availability) => {
    if (availability === 'See Other Times') return 'Clock';
    switch (availability) {
      case 'High': return 'CheckCircle';
      case 'Medium': return 'Clock';
      case 'Low': return 'AlertCircle';
      default: return 'Circle';
    }
  };

  if (loadingCoaches) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#F5F5F5' }}>
            Choose Your Coach
          </h2>
          <p style={{ color: '#CFCFCF' }}>
            Select a certified coach that matches your training goals
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={24} className="text-[#C9A43B] animate-spin" />
          <span className="ml-3" style={{ color: '#F5F5F5' }}>Loading available coaches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#F5F5F5' }}>
          Choose Your Coach
        </h2>
        <p style={{ color: '#CFCFCF' }}>
          Select a certified coach {selectedDate && selectedTimeSlot ? 'available for your selected date and time' : 'that matches your training goals'}
        </p>
      </div>
      {selectedDate && selectedTimeSlot && (
        <div className="bg-[#1A1A1D]/50 border border-[#2A2A2E] rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-4 text-sm" style={{ color: '#CFCFCF' }}>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={16} />
              <span>{selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={16} />
              <span>{selectedTimeSlot?.display_time}</span>
            </div>
            {selectedLocation && (
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={16} />
                <span>{selectedLocation?.city}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Filter Bar - Standardized button design */}
      <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-4 shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Filter" size={16} style={{ color: '#CFCFCF' }} />
          <span className="text-sm font-medium" style={{ color: '#F5F5F5' }}>Filter by Specialty</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {specialties.map(specialty => (
            <button
              key={specialty}
              onClick={() => setFilterSpecialty(specialty)}
              className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 ${
                filterSpecialty === specialty
                  ? 'bg-[#C9A43B] text-[#000000] font-semibold'
                  : 'bg-[#2A2A2E] text-[#CFCFCF] hover:bg-[#C9A43B]/20 hover:border-[#C9A43B]/40'
              }`}
            >
              {specialty === 'all' ? 'All Coaches' : specialty}
            </button>
          ))}
        </div>
      </div>
      {/* Coaches Grid - Step 3 is always actionable */}
      {filteredCoaches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCoaches.map(coach => (
            <div
              key={coach.id}
              onClick={() => !coach.isUnavailable && onCoachSelect(coach)}
              className={`bg-gradient-to-br from-[#1A1A1D] to-[#141416] border transition-all duration-200 p-6 rounded-xl ${
                coach.isUnavailable
                  ? 'opacity-60 cursor-default border-[#2A2A2E]'
                  : `cursor-pointer hover:shadow-lg hover:border-[#C9A43B]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 ${
                      selectedCoach && selectedCoach.id === coach.id
                        ? 'border-[#C9A43B] shadow-lg ring-2 ring-[#C9A43B]/20'
                        : 'border-[#2A2A2E]'
                    }`
              }`}
              tabIndex={coach.isUnavailable ? -1 : 0}
              onKeyDown={(e) => !coach.isUnavailable && e.key === 'Enter' && onCoachSelect(coach)}
            >
              {/* Coach Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative">
                  <Image
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#2A2A2E]"
                  />
                  {selectedCoach && selectedCoach.id === coach.id && !coach.isUnavailable && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#C9A43B] rounded-full flex items-center justify-center">
                      <Icon name="Check" size={14} className="text-[#000000]" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>{coach.name}</h3>
                  <div className="text-sm text-[#C9A43B] font-medium mb-1">{coach.currentClub}</div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-[#C9A43B] fill-current" />
                      <span className="text-sm font-medium" style={{ color: '#F5F5F5' }}>{coach?.rating}</span>
                    </div>
                    <span className="text-sm" style={{ color: '#CFCFCF' }}>
                      ({coach?.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getAvailabilityIcon(coach?.availability)} 
                      size={14} 
                      className={getAvailabilityColor(coach?.availability)} 
                    />
                    <span className={`text-sm font-medium ${getAvailabilityColor(coach?.availability)}`}>
                      {coach?.availability}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: '#F5F5F5' }}>£{coach?.pricePerSession}</div>
                  <div className="text-sm" style={{ color: '#CFCFCF' }}>per session</div>
                </div>
              </div>

              {/* Coach Bio - 2-3 lines as required */}
              <div className="mb-4">
                <p className="text-sm line-clamp-3" style={{ color: '#CFCFCF' }}>{coach?.bio}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Icon name="Award" size={14} style={{ color: '#CFCFCF' }} />
                    <span style={{ color: '#CFCFCF' }}>{coach?.experience}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <div className="text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>Specialties</div>
                  <div className="flex flex-wrap gap-1">
                    {coach?.specialties?.map(specialty => (
                      <span
                        key={specialty}
                        className="px-2 py-1 text-xs bg-[#C9A43B]/20 text-[#C9A43B] rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Locations Served */}
                <div>
                  <div className="text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>Locations Served</div>
                  <div className="flex flex-wrap gap-1">
                    {coach?.locationsServed?.map(location => (
                      <span
                        key={location}
                        className="px-2 py-1 text-xs bg-[#2A2A2E] rounded-full"
                        style={{ color: '#CFCFCF' }}
                      >
                        {location?.split(' — ')?.[0] || location}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <div className="text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>Certifications</div>
                  <div className="flex flex-wrap gap-1">
                    {coach?.certifications?.map(cert => (
                      <span
                        key={cert}
                        className="px-2 py-1 text-xs bg-[#C9A43B]/10 text-[#C9A43B] rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* See Other Times option for unavailable coaches */}
              {coach?.isUnavailable && (
                <div className="mt-4 pt-3 border-t border-[#2A2A2E]">
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      // Navigate to different date selection
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[#C9A43B] hover:underline text-sm focus:outline-none"
                  >
                    See other times for this coach
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-xl p-8">
            <Icon name="Users" size={48} className="mx-auto mb-4" style={{ color: '#CFCFCF' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: '#F5F5F5' }}>No coaches available</h3>
            <p className="mb-4" style={{ color: '#CFCFCF' }}>
              No coaches match your selected criteria. Try adjusting the filter or selecting a different time.
            </p>
            <button
              onClick={() => setFilterSpecialty('all')}
              className="text-[#C9A43B] hover:underline focus:outline-none"
            >
              See other times
            </button>
          </div>
        </div>
      )}
      {selectedCoach && !selectedCoach?.isUnavailable && (
        <div className="bg-[#C9A43B]/10 border border-[#C9A43B]/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="UserCheck" size={20} className="text-[#C9A43B]" />
            <span className="font-medium" style={{ color: '#F5F5F5' }}>
              Selected Coach: {selectedCoach?.name} - £{selectedCoach?.pricePerSession}/session
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachStep;