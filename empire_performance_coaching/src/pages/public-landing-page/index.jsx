import React from 'react';
import { Helmet } from 'react-helmet';
import PublicHeader from '../../components/ui/PublicHeader';
import HeroSection from './components/HeroSection';
import LocationsSection from './components/LocationsSection';
import ValuesSection from './components/ValuesSection';
import CoachSpotlight from './components/CoachSpotlight';
import TestimonialsSection from './components/TestimonialsSection';
import FooterSection from './components/FooterSection';

const PublicLandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Empire Performance Coaching - Build Confidence. Build Character.</title>
        <meta 
          name="description" 
          content="Professional football coaching for young players across Glasgow, Paisley, Kilmarnock & Greenock. Developing skills on the pitch and character off it with 30+ certified coaches." 
        />
        <meta name="keywords" content="football coaching, youth football, Glasgow football, Paisley football, Kilmarnock football, Greenock football, Empire Performance Coaching, football training Scotland, dark luxe empire" />
        <meta property="og:title" content="Empire Performance Coaching - Build Confidence. Build Character." />
        <meta property="og:description" content="Professional football coaching for young players across 4 Scottish locations with 30+ certified coaches. Premium dark luxe coaching experience." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/images/image-1756599429674.png" />
        <link rel="canonical" href="/public-landing-page" />
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: '#0E0E10' }}>
        {/* Header */}
        <PublicHeader />

        {/* Main Content - Reordered as per requirements: Hero → Locations → Coaches → Reviews → Values → Footer */}
        <main>
          {/* Hero Section - Full-bleed with visible watermark */}
          <HeroSection />

          {/* Locations Section - Moved up after Hero with Book CTA */}
          <LocationsSection />

          {/* Coaches Section - Updated with bios and specialties filtering */}
          <CoachSpotlight />

          {/* Reviews/Testimonials Section */}
          <TestimonialsSection />

          {/* Core Values Section - Moved after testimonials */}
          <ValuesSection />
        </main>

        {/* Footer */}
        <FooterSection />
      </div>
    </>
  );
};

export default PublicLandingPage;