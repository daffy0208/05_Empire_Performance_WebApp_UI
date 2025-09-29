import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../../shared/components/AppIcon';
import { supabase } from '../../../../shared/lib/supabase';

const LocationStep = ({ selectedLocation, onLocationSelect }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch locations from Supabase database - consistent with Home locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase?.from('locations')?.select('id, name, address, facility_summary, is_active')?.eq('is_active', true)?.order('name');

        if (error) {
          console.error('Error fetching locations:', error);
          // Fallback to expected locations if fetch fails
          setLocations([
            {
              id: 'lochwinnoch',
              name: 'Lochwinnoch — Lochbarr Services Leisure Centre',
              city: "Lochwinnoch",
              venue: "Lochbarr Services Leisure Centre",
              address: "TBC",
              features: ["3G surface", "Indoor space", "Parking"],
              coaches: "8+",
              distance: "West Scotland"
            },
            {
              id: 'airdrie',
              name: 'Airdrie — Venue TBC',
              city: "Airdrie",
              venue: "Venue TBC", 
              address: "TBC",
              features: ["Floodlit pitches", "Changing rooms", "Easy access"],
              coaches: "8+",
              distance: "20 mins from Glasgow"
            },
            {
              id: 'east-kilbride',
              name: 'East Kilbride — Venue TBC',
              city: "East Kilbride",
              venue: "Venue TBC",
              address: "TBC", 
              features: ["Multiple pitches", "Parent viewing", "Modern facilities"],
              coaches: "8+",
              distance: "15 mins from Glasgow"
            },
            {
              id: 'glasgow-south',
              name: 'Glasgow South / Castlemilk — Venue TBC',
              city: "Glasgow South / Castlemilk", 
              venue: "Venue TBC",
              address: "TBC",
              features: ["All-weather surface", "Parking", "Community feel"],
              coaches: "8+",
              distance: "10 mins from city centre"
            }
          ]);
        } else {
          // Transform database format to UI format
          const transformedLocations = data?.map((location, index) => {
            const locationParts = location?.name?.split(' — ') || [];
            const features = location?.facility_summary?.split(';')?.map(f => f?.trim()) || ['Professional facilities'];
            
            return {
              id: location?.id,
              name: location?.name,
              city: locationParts?.[0] || `Location ${index + 1}`,
              venue: locationParts?.[1] || location?.name || 'Venue TBC',
              address: location?.address !== 'TBC' ? location?.address : 'TBC',
              features: features,
              coaches: "8+",
              distance: index === 0 ? "West Scotland" : 
                       index === 1 ? "20 mins from Glasgow" : 
                       index === 2 ? "15 mins from Glasgow" : "10 mins from city centre"
            };
          }) || [];
          
          setLocations(transformedLocations);
        }
      } catch (err) {
        console.error('Error:', err);
        // Set fallback data
        setLocations([
          {
            id: 'lochwinnoch',
            name: 'Lochwinnoch — Lochbarr Services Leisure Centre',
            city: "Lochwinnoch",
            venue: "Lochbarr Services Leisure Centre",
            address: "TBC",
            features: ["3G surface", "Indoor space", "Parking"],
            coaches: "8+",
            distance: "West Scotland"
          },
          {
            id: 'airdrie',
            name: 'Airdrie — Venue TBC',
            city: "Airdrie",
            venue: "Venue TBC", 
            address: "TBC",
            features: ["Floodlit pitches", "Changing rooms", "Easy access"],
            coaches: "8+",
            distance: "20 mins from Glasgow"
          },
          {
            id: 'east-kilbride',
            name: 'East Kilbride — Venue TBC',
            city: "East Kilbride",
            venue: "Venue TBC",
            address: "TBC", 
            features: ["Multiple pitches", "Parent viewing", "Modern facilities"],
            coaches: "8+",
            distance: "15 mins from Glasgow"
          },
          {
            id: 'glasgow-south',
            name: 'Glasgow South / Castlemilk — Venue TBC',
            city: "Glasgow South / Castlemilk", 
            venue: "Venue TBC",
            address: "TBC",
            features: ["All-weather surface", "Parking", "Community feel"],
            coaches: "8+",
            distance: "10 mins from city centre"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#F5F5F5] mb-4">
            Choose Your Location
          </h2>
          <p className="text-[#CFCFCF]">
            Select the Empire Performance Coaching location nearest to you
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={24} className="text-[#C9A43B] animate-spin" />
          <span className="ml-3 text-[#CFCFCF]">Loading locations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#F5F5F5] mb-4">
          Choose Your Location
        </h2>
        <p className="text-[#CFCFCF]">
          Select the Empire Performance Coaching location nearest to you
        </p>
      </div>
      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations?.map((location) => (
          <motion.div
            key={location?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: locations?.indexOf(location) * 0.1 }}
            onClick={() => onLocationSelect(location)}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedLocation?.id === location?.id
                ? 'border-[#C9A43B] bg-[#C9A43B]/5 shadow-lg'
                : 'border-[#2A2A2E] hover:border-[#C9A43B]/50 hover:shadow-md bg-[#1A1A1D]'
            }`}
            tabIndex={0}
            onKeyDown={(e) => e?.key === 'Enter' && onLocationSelect(location)}
          >
            {/* Selection Indicator */}
            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              selectedLocation?.id === location?.id
                ? 'border-[#C9A43B] bg-[#C9A43B]' 
                : 'border-[#CFCFCF]/30'
            }`}>
              {selectedLocation?.id === location?.id && (
                <Icon name="Check" size={14} className="text-[#000000]" />
              )}
            </div>

            {/* Location Header */}
            <div className="flex items-start justify-between mb-4 pr-8">
              <div>
                <h3 className="font-bold text-xl text-[#F5F5F5] mb-1">
                  {location?.city}
                </h3>
                <p className="text-sm text-[#CFCFCF]">
                  {location?.distance}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#CFCFCF]">Coaches</div>
                <div className="text-lg font-bold text-[#C9A43B]">{location?.coaches}</div>
              </div>
            </div>

            {/* Venue */}
            <h4 className="font-medium text-[#F5F5F5] mb-2">
              {location?.venue}
            </h4>

            {/* Address */}
            {location?.address && location?.address !== 'TBC' && (
              <div className="flex items-start space-x-2 mb-4">
                <Icon name="MapPin" size={16} className="text-[#C9A43B] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#CFCFCF]">
                  {location?.address}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="space-y-2">
              {location?.features?.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Icon name="Check" size={14} className="text-[#C9A43B] flex-shrink-0" />
                  <span className="text-xs text-[#CFCFCF]">{feature}</span>
                </div>
              ))}
            </div>

            {/* Selection Animation */}
            {selectedLocation?.id === location?.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 border-2 border-[#C9A43B] rounded-xl pointer-events-none"
                style={{
                  boxShadow: '0 0 0 4px rgba(201, 164, 59, 0.1)'
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
      {/* Help Text */}
      <div className="bg-[#1A1A1D] border border-[#2A2A2E] p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-[#C9A43B] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#CFCFCF]">
            <p className="font-medium text-[#F5F5F5] mb-1">Need help choosing?</p>
            <p>All locations offer the same high-quality coaching experience. Choose based on convenience and travel time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;