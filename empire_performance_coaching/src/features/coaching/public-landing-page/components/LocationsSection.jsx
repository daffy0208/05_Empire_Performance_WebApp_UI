import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/AppIcon';
import { supabase } from '../../../../shared/lib/supabase';

const LocationsSection = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch locations from Supabase database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase?.from('locations')?.select('id, name, address, facility_summary, is_active')?.eq('is_active', true)?.order('name');

        if (error) {
          console.error('Error fetching locations:', error);
          // Fallback to static data if fetch fails
          setLocations([
            {
              id: 1,
              name: "Lochwinnoch — Lochbarr Services Leisure Centre",
              address: "TBC",
              facility_summary: "3G surface; indoor space; parking"
            },
            {
              id: 2,
              name: "Airdrie — Venue TBC",
              address: "TBC", 
              facility_summary: "Floodlit pitches; changing rooms"
            },
            {
              id: 3,
              name: "East Kilbride — Venue TBC",
              address: "TBC",
              facility_summary: "Multiple pitches; parent viewing"
            },
            {
              id: 4,
              name: "Glasgow South / Castlemilk — Venue TBC", 
              address: "TBC",
              facility_summary: "All-weather surface; parking"
            }
          ]);
        } else {
          setLocations(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
        // Set fallback data
        setLocations([
          {
            id: 1,
            name: "Lochwinnoch — Lochbarr Services Leisure Centre",
            address: "TBC",
            facility_summary: "3G surface; indoor space; parking"
          },
          {
            id: 2,
            name: "Airdrie — Venue TBC",
            address: "TBC", 
            facility_summary: "Floodlit pitches; changing rooms"
          },
          {
            id: 3,
            name: "East Kilbride — Venue TBC",
            address: "TBC",
            facility_summary: "Multiple pitches; parent viewing"
          },
          {
            id: 4,
            name: "Glasgow South / Castlemilk — Venue TBC", 
            address: "TBC",
            facility_summary: "All-weather surface; parking"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleBookSession = () => {
    navigate('/multi-step-booking-flow');
  };

  if (loading) {
    return (
      <section id="locations" className="relative py-16 md:py-24" style={{ backgroundColor: '#0E0E10' }}>
        <div className="w-full px-6 md:px-8">
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={24} className="text-[#C9A43B] animate-spin" />
            <span className="ml-3 text-[#CFCFCF]">Loading locations...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="locations" className="relative py-16 md:py-24" style={{ backgroundColor: '#0E0E10' }}>
      <div className="w-full px-6 md:px-8">
        {/* Section Header with Book CTA - appears BEFORE Coaches */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#F5F5F5' }}>
            Choose Your Location
          </h2>
          <div className="w-24 h-1 bg-[#C9A43B] mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto font-medium mb-8" style={{ color: '#CFCFCF' }}>
            Premium facilities across Scotland's central belt, each equipped with 
            professional-grade pitches and experienced coaching staff.
          </p>
          
          {/* Book Your First Session CTA - Top-right stepper controls style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12 flex justify-center md:justify-end"
          >
            <button
              onClick={handleBookSession}
              className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/70 focus:ring-offset-2 focus:ring-offset-[#0E0E10] group"
            >
              <span>Book Your First Session</span>
              <Icon name="ArrowRight" size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {locations?.map((location, index) => (
            <motion.div
              key={location?.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={handleBookSession}
              className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 hover:border-[#C9A43B]/40 hover:bg-gradient-to-br hover:from-[#1A1A1D] hover:to-[#191919] transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50"
              tabIndex={0}
              onKeyDown={(e) => e?.key === 'Enter' && handleBookSession()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-[#C9A43B] rounded-full"></div>
                  <h3 className="font-semibold text-xl" style={{ color: '#F5F5F5' }}>
                    {location?.name?.split(' — ')?.[0] || 'Location'}
                  </h3>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs" style={{ color: '#CFCFCF' }}>Select</span>
                  <Icon 
                    name="ChevronRight" 
                    size={16} 
                    className="text-[#C9A43B] group-hover:translate-x-0.5 transition-transform" 
                  />
                </div>
              </div>

              {/* Venue */}
              <h4 className="font-medium mb-3" style={{ color: '#CFCFCF' }}>
                {location?.name?.split(' — ')?.[1] || location?.name || 'Venue TBC'}
              </h4>

              {/* Facility Summary */}
              <div className="flex items-start space-x-3 mb-4">
                <Icon name="MapPin" size={16} className="text-[#C9A43B] mt-0.5 flex-shrink-0" />
                <p className="text-sm" style={{ color: '#CFCFCF' }}>
                  {location?.facility_summary || 'Professional facilities with excellent amenities'}
                </p>
              </div>

              {/* Address */}
              {location?.address && location?.address !== 'TBC' && (
                <div className="flex items-start space-x-3 mb-4">
                  <Icon name="Navigation" size={16} className="text-[#C9A43B] mt-0.5 flex-shrink-0" />
                  <p className="text-sm" style={{ color: '#CFCFCF' }}>
                    {location?.address}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2E]">
                <span className="text-xs uppercase tracking-wide" style={{ color: '#CFCFCF' }}>
                  Available Coaches
                </span>
                <span className="text-[#C9A43B] font-semibold">
                  8+
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Help Text */}
        <div className="bg-[#1A1A1D] border border-[#2A2A2E] p-4 rounded-xl">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-[#C9A43B] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[#CFCFCF]">
              <p className="font-medium text-[#F5F5F5] mb-1">Need help choosing?</p>
              <p>All locations offer the same high-quality coaching experience. Choose based on convenience and travel time.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;