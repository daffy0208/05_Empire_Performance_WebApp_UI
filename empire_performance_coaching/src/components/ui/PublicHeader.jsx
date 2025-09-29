import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const PublicHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isBookingFlow = location?.pathname === '/multi-step-booking-flow';

  // Handle scroll for solid background effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = () => {
    navigate('/multi-step-booking-flow');
  };

  const handleLogoClick = () => {
    navigate('/public-landing-page');
  };

  const handleLogin = () => {
    navigate('/login-register');
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element?.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0E0E10] border-b border-[#2A2A2E]' 
          : 'bg-transparent backdrop-blur-sm'
      }`}>
        <div className="w-full px-6 md:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo - Updated to use provided Empire Performance logo */}
            <div 
              className="flex items-center cursor-pointer transition-all duration-150 hover:opacity-80"
              onClick={handleLogoClick}
            >
              {/* Empire Performance Logo - h-8 sizing as required */}
              <img 
                src="/assets/images/Empire_Logo-1756660728269.png" 
                alt="Empire Performance Coaching" 
                className="h-8 w-auto object-contain"
                loading="lazy" decoding="async"
              />
              {/* Gold Text Wordmark */}
              <div className="ml-3 hidden sm:block">
                <div className="text-[#C9A43B] font-bold text-lg tracking-wide">
                  EMPIRE
                </div>
                <div className="text-[#C9A43B] font-medium text-xs tracking-widest -mt-1">
                  PERFORMANCE
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isBookingFlow && (
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onMouseEnter={() => import('../../pages/public-landing-page')}
                  onClick={() => scrollToSection('locations')}
                  className="text-[#CFCFCF] hover:text-[#C9A43B] text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-2 py-1"
                >
                  Locations
                </button>
                <button
                  onMouseEnter={() => import('../../pages/public-landing-page/components/CoachSpotlight')}
                  onClick={() => scrollToSection('coaches')}
                  className="text-[#CFCFCF] hover:text-[#C9A43B] text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-2 py-1"
                >
                  Coaches
                </button>
                <button
                  onMouseEnter={() => import('../../pages/public-landing-page/components/TestimonialsSection')}
                  onClick={() => scrollToSection('testimonials')}
                  className="text-[#CFCFCF] hover:text-[#C9A43B] text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-2 py-1"
                >
                  Reviews
                </button>
                <button
                  onMouseEnter={() => import('../../pages/login-register')}
                  onClick={handleLogin}
                  className="text-[#CFCFCF] hover:text-[#C9A43B] text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-2 py-1"
                >
                  Login
                </button>
                <Button 
                  onMouseEnter={() => import('../../pages/multi-step-booking-flow')}
                  onClick={handleBookNow}
                  variant="primary"
                  className="text-sm px-6 py-2 font-semibold"
                >
                  Book Now
                </Button>
              </nav>
            )}

            {/* Mobile Menu Button & Booking Flow Indicator */}
            <div className="flex items-center space-x-4">
              {isBookingFlow && (
                <div className="text-sm text-[#CFCFCF] font-medium">
                  Secure Booking
                </div>
              )}
              
              {!isBookingFlow && (
                <>
                  {/* Mobile Hamburger */}
                  <button
                    onClick={handleMobileMenuToggle}
                    className="md:hidden p-2 rounded-lg hover:bg-[#C9A43B]/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50"
                    aria-label="Toggle mobile menu"
                  >
                    <Icon 
                      name={isMobileMenuOpen ? "X" : "Menu"} 
                      size={24} 
                      className="text-[#CFCFCF]" 
                    />
                  </button>
                  
                  {/* Mobile Book Now Button */}
                  <Button 
                    onClick={handleBookNow}
                    variant="primary"
                    className="md:hidden text-sm px-4 py-2 font-semibold"
                  >
                    Book Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && !isBookingFlow && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleMobileMenuToggle}
          />
          
          {/* Drawer */}
          <div className="fixed top-20 right-0 w-64 h-full bg-[#0E0E10] border-l border-[#C9A43B]/20 shadow-2xl">
            <nav className="flex flex-col p-6 space-y-6">
              <button
                onClick={() => scrollToSection('locations')}
                className="text-left text-[#CFCFCF] hover:text-[#C9A43B] text-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-2 py-2"
              >
                Locations
              </button>
              <button
                onClick={() => scrollToSection('coaches')}
                className="text-left text-[#CFCFCF] hover:text-[#C9A43B] text-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-2 py-2"
              >
                Coaches
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-left text-[#CFCFCF] hover:text-[#C9A43B] text-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-2 py-2"
              >
                Reviews
              </button>
              <button
                onClick={handleLogin}
                className="text-left text-[#CFCFCF] hover:text-[#C9A43B] text-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-2 py-2"
              >
                Login
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicHeader;