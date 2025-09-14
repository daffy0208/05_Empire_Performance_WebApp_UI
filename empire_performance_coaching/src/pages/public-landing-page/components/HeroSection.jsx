import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleBookSession = () => {
    navigate('/multi-step-booking-flow');
  };

  return (
    <section className="hero relative bg-[#0E0E10]">
      {/* Stats Pill - Top right inside hero on desktop */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute top-32 right-8 hidden lg:block z-20"
      >
        <div className="bg-[#0E0E10]/80 backdrop-blur-sm border border-[#C9A43B]/20 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#C9A43B]">30+</div>
            <div className="text-xs text-[#CFCFCF]/80">Certified Coaches</div>
          </div>
        </div>
      </motion.div>
      {/* Main Content - bounded and centered */}
      <div className="hero-content max-w-[1440px] mx-auto px-6 md:px-8 py-16 md:py-24 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: '#F5F5F5' }}>
            Build Confidence.<br />
            <span className="text-[#C9A43B]">Build Character.</span>
          </h1>
          
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8" style={{ color: '#CFCFCF' }}>
            Premium football coaching across Scotland's central belt. 
            Developing young talent with professional techniques and values-driven mentorship.
          </p>

          {/* Primary CTA - Standardized button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <button
              onClick={handleBookSession}
              className="inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold bg-[#C9A43B] text-black hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/40 transition-all duration-200"
            >
              <span>Book Your First Session</span>
              <Icon name="ArrowRight" size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center space-x-2 text-[#CFCFCF]/80">
              <Icon name="Users" size={18} />
              <span className="text-sm">Join 500+ young athletes</span>
            </div>
          </motion.div>

          {/* Stats for mobile - shown below hero content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:hidden flex justify-center"
          >
            <div className="bg-[#0E0E10]/80 backdrop-blur-sm border border-[#C9A43B]/20 rounded-lg p-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#C9A43B]">30+</div>
                  <div className="text-xs text-[#CFCFCF]/80">Coaches</div>
                </div>
                <div className="w-px h-8 bg-[#C9A43B]/30"></div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#C9A43B]">4</div>
                  <div className="text-xs text-[#CFCFCF]/80">Locations</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center text-[#CFCFCF]/60">
          <span className="text-sm mb-2">Explore</span>
          <Icon name="ChevronDown" size={20} className="animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;