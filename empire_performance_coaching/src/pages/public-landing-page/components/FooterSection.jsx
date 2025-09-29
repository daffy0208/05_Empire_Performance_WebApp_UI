import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

const FooterSection = () => {
  const navigate = useNavigate();
  const currentYear = new Date()?.getFullYear();

  const locations = [
    {
      city: "Glasgow",
      venue: "Toryglen Regional Football Centre",
      address: "480 Prospecthill Road, G42 0BY"
    },
    {
      city: "Paisley", 
      venue: "Seedhill Playing Fields",
      address: "Seedhill Road, PA1 1JT"
    },
    {
      city: "Kilmarnock",
      venue: "Ayrshire Athletics Arena", 
      address: "Queens Drive, KA1 3XF"
    },
    {
      city: "Greenock",
      venue: "Battery Park Football Pitches",
      address: "Eldon Street, PA16 7QG"
    }
  ];

  const handleBookNow = () => {
    navigate('/multi-step-booking-flow');
  };

  return (
    <footer className="bg-[#0E0E10] border-t border-[#2A2A2E] py-16">
      <div className="w-full px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Logo & Company Info */}
          <div className="lg:col-span-1">
            {/* Empire Performance Logo - consistent h-8 sizing */}
            <div className="flex items-center mb-6">
              <img 
                src="/assets/images/Empire_Logo-1756660728269.png" 
                alt="Empire Performance Coaching" 
                className="h-8 w-auto object-contain"
                loading="lazy" decoding="async"
              />
              <div className="ml-3">
                <div className="text-[#C9A43B] font-bold text-lg tracking-wide">
                  EMPIRE
                </div>
                <div className="text-[#C9A43B] font-medium text-xs tracking-widest -mt-1">
                  PERFORMANCE
                </div>
              </div>
            </div>
            <p className="text-[#CFCFCF] text-sm leading-relaxed mb-6">
              Premium football coaching across Scotland's central belt. 
              Building confidence, character, and technical excellence in young athletes.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-[#CFCFCF] hover:text-[#C9A43B] transition-colors duration-150"
                aria-label="Facebook"
              >
                <Icon name="Facebook" size={20} />
              </a>
              <a
                href="#"
                className="text-[#CFCFCF] hover:text-[#C9A43B] transition-colors duration-150"
                aria-label="Instagram"
              >
                <Icon name="Instagram" size={20} />
              </a>
              <a
                href="#"
                className="text-[#CFCFCF] hover:text-[#C9A43B] transition-colors duration-150"
                aria-label="Twitter"
              >
                <Icon name="Twitter" size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-header font-bold text-empire-white mb-6 uppercase tracking-wide text-sm">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#locations" className="text-empire-offwhite/70 hover:text-empire-gold text-sm transition-all">
                  Training Locations
                </a>
              </li>
              <li>
                <a href="#coaches" className="text-empire-offwhite/70 hover:text-empire-gold text-sm transition-all">
                  Meet Our Coaches
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-empire-offwhite/70 hover:text-empire-gold text-sm transition-all">
                  Parent Reviews
                </a>
              </li>
              <li>
                <button 
                  onClick={handleBookNow}
                  className="text-empire-offwhite/70 hover:text-empire-gold text-sm transition-all"
                >
                  Book a Session
                </button>
              </li>
            </ul>
          </div>

          {/* Training Locations */}
          <div>
            <h3 className="font-header font-bold text-empire-white mb-6 uppercase tracking-wide text-sm">
              Locations
            </h3>
            <ul className="space-y-4">
              {locations?.slice(0, 2)?.map((location, index) => (
                <li key={index}>
                  <div className="text-empire-gold text-sm font-medium">{location?.city}</div>
                  <div className="text-empire-offwhite/60 text-xs">{location?.venue}</div>
                </li>
              ))}
              <li>
                <button 
                  onClick={handleBookNow}
                  className="text-empire-offwhite/70 hover:text-empire-gold text-xs transition-all flex items-center gap-1"
                >
                  View all locations
                  <Icon name="ChevronRight" size={12} />
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & CTA */}
          <div>
            <h3 className="font-header font-bold text-empire-white mb-6 uppercase tracking-wide text-sm">
              Get Started
            </h3>
            <div className="space-y-4 mb-6">
              <p className="text-empire-offwhite/70 text-sm">
                Ready to help your young athlete reach their potential?
              </p>
              <button
                onClick={handleBookNow}
                className="empire-btn-primary w-full justify-center"
              >
                Book Now
              </button>
            </div>
            
            {/* Stats */}
            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-empire-gold font-bold text-lg">30+</div>
                  <div className="text-empire-offwhite/60 text-xs">Coaches</div>
                </div>
                <div>
                  <div className="text-empire-gold font-bold text-lg">200+</div>
                  <div className="text-empire-offwhite/60 text-xs">Players</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-empire-offwhite/50 text-sm">
              © {currentYear} Empire Performance Coaching. Building champions across Scotland.
            </div>
            
            <div className="flex items-center space-x-6 text-empire-offwhite/50 text-sm">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-empire-gold rounded-full"></div>
                <span>Secure Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;