import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const CoachSpotlight = () => {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  
  // Static fallback data based on requirements
  const fallbackCoaches = [
    {
      id: 1,
      name: "Jack Haggerty",
      bio: "Specializing in individual player development with focus on finishing techniques and mentoring young talent.",
      image: "/assets/images/no_image.png",
      specialties: ["1-to-1 Development", "Finishing", "Mentoring"],
      experience: "8+ years",
      currentClub: "Glenvale FC",
      locationsServed: ["Lochwinnoch"],
      rate: 75
    },
    {
      id: 2,
      name: "Malcolm McLean",
      bio: "Expert in youth pathways and session design, implementing academy-level methodology for player progression.",
      image: "/assets/images/no_image.png",
      specialties: ["Youth Pathways", "Session Design", "Academy Methodology"],
      experience: "10+ years",
      currentClub: "Empire Performance",
      locationsServed: ["Airdrie", "East Kilbride"],
      rate: 80
    },
    {
      id: 3,
      name: "Mairead Fulton",
      bio: "Professional women\'s coach focusing on midfield development and building professionalism in young players.",
      image: "/assets/images/no_image.png",
      specialties: ["Women & Girls", "Midfield", "Professionalism"],
      experience: "6+ years",
      currentClub: "Glasgow City FC",
      locationsServed: ["Glasgow South"],
      rate: 85
    },
    {
      id: 4,
      name: "Katie Lockwood",
      bio: "Attack-minded coach specializing in finishing and high-pressing tactical systems for competitive players.",
      image: "/assets/images/no_image.png",
      specialties: ["Attacking", "Finishing", "Pressing"],
      experience: "7+ years",
      currentClub: "Glasgow City FC",
      locationsServed: ["East Kilbride", "Glasgow South"],
      rate: 85
    }
  ];
  
  // Fetch coaches from Supabase - FIXED query using correct column names
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        // Fixed: Use 'name' from user_profiles, not 'display_name'
        const { data, error } = await supabase?.from('coaches')?.select(`
            id,
            bio,
            avatar_url,
            current_club,
            specialties,
            locations_served,
            experience_years,
            hourly_rate,
            user_profiles!coaches_id_fkey (
              full_name,
              is_active
            )
          `)?.eq('user_profiles.is_active', true);

        if (error) {
          console.error('Error fetching coaches:', error);
          setCoaches([]);
          setFilteredCoaches([]);
        } else {
          const transformedCoaches = data?.map(coach => ({
            id: coach?.id,
            name: coach?.user_profiles?.full_name || 'Coach',
            bio: coach?.bio || 'Experienced football coach dedicated to player development.',
            image: coach?.avatar_url || '/assets/images/no_image.png',
            specialties: coach?.specialties || ['General Training'],
            experience: coach?.experience_years ? `${coach?.experience_years}+ years` : '5+ years',
            currentClub: coach?.current_club || 'Empire Performance',
            locationsServed: coach?.locations_served || ['Multiple Locations'],
            rate: coach?.hourly_rate || 75
          })) || [];
          
          setCoaches(transformedCoaches);
          setFilteredCoaches(transformedCoaches);
        }
      } catch (err) {
        console.error('Error:', err);
        setCoaches([]);
        setFilteredCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  // Get unique specialties for filtering
  const allSpecialties = ['all', ...new Set(coaches?.flatMap(coach => coach?.specialties || []))];

  // Filter coaches based on selected specialty
  useEffect(() => {
    if (selectedSpecialty === 'all') {
      setFilteredCoaches(coaches);
    } else {
      setFilteredCoaches(coaches?.filter(coach => 
        coach?.specialties?.includes(selectedSpecialty)
      ));
    }
  }, [selectedSpecialty, coaches]);

  const handleBookWithCoach = () => {
    navigate('/multi-step-booking-flow');
  };

  const steps = [
    {
      id: 1,
      number: "1",
      title: "Choose Location",
      description: "Select your preferred training venue"
    },
    {
      id: 2,
      number: "2",
      title: "Select Coach & Time",
      description: "Pick your coach and available slot"
    },
    {
      id: 3,
      number: "3",
      title: "Secure Booking",
      description: "Complete payment and confirmation"
    },
    {
      id: 4,
      number: "4",
      title: "Show Up & Grow",
      description: "Arrive ready to develop your skills"
    }
  ];

  if (loading) {
    return (
      <section id="coaches" className="relative py-16 md:py-24" style={{ backgroundColor: '#141416' }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={24} className="text-[#C9A43B] animate-spin" />
            <span className="ml-3" style={{ color: '#CFCFCF' }}>Loading coaches...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="coaches" className="relative py-16 md:py-24" style={{ backgroundColor: '#141416' }}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        {/* Coach Team Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#F5F5F5' }}>
            Meet Our Coaches
          </h2>
          <div className="w-24 h-1 bg-[#C9A43B] mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto font-medium mb-12" style={{ color: '#CFCFCF' }}>
            Experienced professionals dedicated to developing young talent across all skill levels.
          </p>
        </motion.div>

        {/* Specialties Filter - Consistent chip design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {allSpecialties?.map(specialty => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 ${
                  selectedSpecialty === specialty
                    ? 'bg-[#C9A43B] text-[#000000] font-semibold'
                    : 'bg-[#1A1A1D] text-[#CFCFCF] border border-[#2A2A2E] hover:border-[#C9A43B]/40 hover:bg-[#1A1A1D]/80'
                }`}
              >
                {specialty === 'all' ? 'All Coaches' : specialty}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Coach Cards - Equal height with consistent design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {filteredCoaches?.length > 0 ? (
            filteredCoaches?.map((coach, index) => (
              <motion.div
                key={coach?.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={handleBookWithCoach}
                className="group flex flex-col min-h-[360px] bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-5 hover:border-[#C9A43B]/40 hover:bg-gradient-to-br hover:from-[#1A1A1D] hover:to-[#191919] focus:ring-2 focus:ring-[#C9A43B]/70 transition-all duration-200 cursor-pointer"
                tabIndex={0}
                onKeyDown={(e) => e?.key === 'Enter' && handleBookWithCoach()}
              >
                {/* Avatar - h-16 w-16 as required */}
                <div className="relative mb-4">
                  <img 
                    className="h-16 w-16 mx-auto rounded-full object-cover ring-1 ring-[#2A2A2E] group-hover:ring-[#C9A43B]/60 transition-all" 
                    src={coach?.image} 
                    alt={coach?.name}
                  />
                  <div className="absolute -bottom-1 -right-4 w-6 h-6 bg-[#C9A43B] rounded-full border-2 border-[#141416] flex items-center justify-center">
                    <Icon name="CheckCircle" size={14} className="text-[#000000]" />
                  </div>
                </div>
                
                {/* Info */}
                <div className="text-center mb-4">
                  <div className="font-semibold text-lg mb-1" style={{ color: '#F5F5F5' }}>
                    {coach?.name}
                  </div>
                  <div className="text-[#C9A43B] text-sm font-medium mb-1">
                    {coach?.currentClub}
                  </div>
                  <div className="text-xs mb-2" style={{ color: '#CFCFCF' }}>
                    {coach?.experience}
                  </div>
                </div>

                {/* Bio - 2-3 lines as required with clamping */}
                <div className="text-xs mb-4 text-center line-clamp-3 flex-grow" style={{ color: '#CFCFCF' }}>
                  {coach?.bio}
                </div>

                {/* Specialties Chips */}
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  {coach?.specialties?.slice(0, 3)?.map(specialty => (
                    <span
                      key={specialty}
                      className="px-2 py-1 text-xs bg-[#C9A43B]/20 text-[#C9A43B] rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Locations Served */}
                <div className="text-xs text-center mb-4" style={{ color: '#CFCFCF' }}>
                  Serves: {coach?.locationsServed?.slice(0, 2)?.join(', ')}
                </div>

                {/* Primary CTA - Standardized button */}
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleBookWithCoach();
                  }}
                  className="w-full bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 focus:ring-offset-2 focus:ring-offset-[#141416]"
                >
                  Book Session - £{coach?.rate}
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-xl p-8">
                <Icon name="Users" size={48} className="mx-auto mb-4" style={{ color: '#CFCFCF' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: '#F5F5F5' }}>No coaches available</h3>
                <p style={{ color: '#CFCFCF' }}>
                  No coaches match the selected specialty. Try selecting "All Coaches" or a different specialty.
                </p>
                <button
                  onClick={() => setSelectedSpecialty('all')}
                  className="mt-4 text-[#C9A43B] hover:underline focus:outline-none"
                >
                  See other times
                </button>
              </div>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#F5F5F5' }}>
            How It Works
          </h2>
          <div className="w-24 h-1 bg-[#C9A43B] mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto font-medium mb-12" style={{ color: '#CFCFCF' }}>
            Getting started is simple. Follow these four easy steps to book your training session.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps?.map((step, index) => (
            <motion.div
              key={step?.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              {/* Number */}
              <div className="w-12 h-12 bg-[#C9A43B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#000000] font-bold text-lg">
                  {step?.number}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg mb-2" style={{ color: '#F5F5F5' }}>
                {step?.title}
              </h3>
              <p className="text-sm" style={{ color: '#CFCFCF' }}>
                {step?.description}
              </p>

              {/* Connector Line */}
              {index < steps?.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-[#C9A43B]/50 to-transparent -translate-x-6"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoachSpotlight;