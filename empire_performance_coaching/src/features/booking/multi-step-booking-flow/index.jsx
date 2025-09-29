import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

// Components
import ProgressIndicator from './components/ProgressIndicator';
import LocationStep from './components/LocationStep';
import CalendarStep from './components/CalendarStep';
import CoachStep from './components/CoachStep';
import PlayerDetailsStep from './components/PlayerDetailsStep';
import PaymentStep from './components/PaymentStep';
import BookingConfirmation from './components/BookingConfirmation';
import NavigationButtons from './components/NavigationButtons';

const MultiStepBookingFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Booking state
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [playerDetails, setPlayerDetails] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const totalSteps = 6;

  // Add form persistence
  useEffect(() => {
    const saved = localStorage.getItem('booking-flow-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSelectedLocation(data.location || null);
        setSelectedDate(data.date ? new Date(data.date) : new Date());
        setSelectedTimeSlot(data.timeSlot || null);
        setSelectedCoach(data.coach || null);
        setPlayerDetails(data.player || null);
      } catch (error) {
        console.error('Error loading saved booking data:', error);
      }
    }
  }, []);

  // Save form data on changes
  useEffect(() => {
    const data = {
      location: selectedLocation,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      coach: selectedCoach,
      player: playerDetails
    };
    localStorage.setItem('booking-flow-data', JSON.stringify(data));
  }, [selectedLocation, selectedDate, selectedTimeSlot, selectedCoach, playerDetails]);

  const steps = [
    { number: 1, title: 'Location', component: 'location' },
    { number: 2, title: 'Date & Time', component: 'calendar' },
    { number: 3, title: 'Coach', component: 'coach' },
    { number: 4, title: 'Player Details', component: 'player' },
    { number: 5, title: 'Payment', component: 'payment' },
    { number: 6, title: 'Confirmation', component: 'confirmation' }
  ];

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedLocation !== null;
      case 2:
        return selectedDate !== null && selectedTimeSlot !== null;
      case 3:
        return selectedCoach !== null;
      case 4:
        return playerDetails !== null && (playerDetails.playerName?.trim() || playerDetails.athlete_id);
      case 5:
        return paymentDetails !== null;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!canProceedToNext()) return;

    setIsLoading(true);
    
    try {
      if (currentStep === totalSteps) {
        // Final confirmation
        setBookingConfirmed(true);
        // Could redirect to success page or dashboard
        setTimeout(() => {
          navigate('/parent-dashboard');
        }, 3000);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      }
    } catch (error) {
      console.error('Error proceeding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCancel = () => {
    navigate('/public-landing-page');
  };

  const getNextButtonText = () => {
    if (currentStep === totalSteps) return 'Complete Booking';
    if (currentStep === totalSteps - 1) return 'Proceed to Payment';
    return 'Next';
  };

  const renderCurrentStep = () => {
    const stepProps = {
      onNext: handleNext,
      onPrevious: handlePrevious
    };

    switch (currentStep) {
      case 1:
        return (
          <LocationStep
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
            {...stepProps}
          />
        );
      case 2:
        return (
          <CalendarStep
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotSelect={setSelectedTimeSlot}
            selectedLocation={selectedLocation}
            {...stepProps}
          />
        );
      case 3:
        return (
          <CoachStep
            selectedCoach={selectedCoach}
            onCoachSelect={setSelectedCoach}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            selectedLocation={selectedLocation}
            {...stepProps}
          />
        );
      case 4:
        return (
          <PlayerDetailsStep
            playerDetails={playerDetails}
            onPlayerDetailsChange={setPlayerDetails}
            user={user}
            {...stepProps}
          />
        );
      case 5:
        return (
          <PaymentStep
            paymentDetails={paymentDetails}
            onPaymentDetailsChange={setPaymentDetails}
            bookingDetails={{
              location: selectedLocation,
              date: selectedDate,
              timeSlot: selectedTimeSlot,
              coach: selectedCoach,
              player: playerDetails
            }}
            {...stepProps}
          />
        );
      case 6:
        return (
          <BookingConfirmation
            bookingDetails={{
              location: selectedLocation,
              date: selectedDate,
              timeSlot: selectedTimeSlot,
              coach: selectedCoach,
              player: playerDetails,
              payment: paymentDetails
            }}
            isConfirmed={bookingConfirmed}
            {...stepProps}
          />
        );
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] pt-24 pb-8">
      <div className="w-full px-6 md:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator 
            steps={steps}
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitle={steps[currentStep - 1]?.title || ''}
          />
        </div>

        {/* Main Content Area */}
        <div className="relative">
          {/* Navigation Controls - Top-right on desktop, sticky bottom on mobile */}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isNextDisabled={!canProceedToNext()}
            isLoading={isLoading}
            nextButtonText={getNextButtonText()}
            showCancel={currentStep === 1}
            onCancel={handleCancel}
          />

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] border border-[#2A2A2E] rounded-xl p-6 md:p-8 shadow-lg mb-20 md:mb-8"
          >
            {renderCurrentStep()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepBookingFlow;