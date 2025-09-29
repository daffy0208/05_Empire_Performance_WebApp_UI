import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/AppIcon';
import Button from '../../../../shared/components/ui/Button';

const BookingConfirmation = ({ bookingData }) => {
  const navigate = useNavigate();

  const handleViewDashboard = () => {
    navigate('/parent-dashboard');
  };

  const handleBookAnother = () => {
    window.location?.reload(); // Reset the booking flow
  };

  const generateBookingId = () => {
    return 'EPC-' + Math.random()?.toString(36)?.substr(2, 9)?.toUpperCase();
  };

  const bookingId = generateBookingId();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icon name="Check" size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your training session has been successfully scheduled
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-elevation-2 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Booking Details</h2>
            <div className="text-sm font-mono text-muted-foreground bg-muted px-3 py-1 rounded">
              {bookingId}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Icon name="Calendar" size={20} className="text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Training Date</div>
                  <div className="text-sm text-muted-foreground">
                    {bookingData?.selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time: 4:00 PM - 5:00 PM
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Icon name="User" size={20} className="text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Coach</div>
                  <div className="text-sm text-muted-foreground">
                    {bookingData?.selectedCoach?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {bookingData?.selectedCoach?.specialties?.slice(0, 2)?.join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Icon name="MapPin" size={20} className="text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Location</div>
                  <div className="text-sm text-muted-foreground">
                    Empire Performance Training Center
                  </div>
                  <div className="text-sm text-muted-foreground">
                    123 Sports Complex Dr, Athletic City, AC 12345
                  </div>
                </div>
              </div>
            </div>

            {/* Player & Schedule Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Icon name="UserCheck" size={20} className="text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Player</div>
                  <div className="text-sm text-muted-foreground">
                    {bookingData?.playerData?.firstName} {bookingData?.playerData?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Age: {bookingData?.playerData?.ageGroup} • Level: {bookingData?.playerData?.skillLevel}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Icon name="Repeat" size={20} className="text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Schedule</div>
                  <div className="text-sm text-muted-foreground">
                    {bookingData?.cadence === 'weekly' ? 'Weekly' : 'Bi-weekly'} recurring sessions
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Next 8 sessions automatically scheduled
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Icon name="CreditCard" size={20} className="text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Payment</div>
                  <div className="text-sm text-muted-foreground">
                    Card ending in ****{bookingData?.paymentData?.cardNumber?.slice(-4)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Auto-billing enabled for future sessions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-2">Important Information</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You'll receive email and SMS reminders 24 hours before each session</li>
                <li>• Cancellations must be made at least 24 hours in advance</li>
                <li>• Bring water, cleats, and comfortable athletic wear</li>
                <li>• Arrive 10 minutes early for equipment check and warm-up</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-elevation-1 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Icon name="Mail" size={24} className="text-primary mx-auto mb-2" />
              <div className="font-medium text-foreground text-sm">Check Your Email</div>
              <div className="text-xs text-muted-foreground mt-1">
                Confirmation details sent
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Icon name="Calendar" size={24} className="text-primary mx-auto mb-2" />
              <div className="font-medium text-foreground text-sm">Add to Calendar</div>
              <div className="text-xs text-muted-foreground mt-1">
                Never miss a session
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Icon name="MessageCircle" size={24} className="text-primary mx-auto mb-2" />
              <div className="font-medium text-foreground text-sm">Contact Coach</div>
              <div className="text-xs text-muted-foreground mt-1">
                Questions? Reach out anytime
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="default"
            size="lg"
            fullWidth
            onClick={handleViewDashboard}
            iconName="Home"
            iconPosition="left"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleBookAnother}
            iconName="Plus"
            iconPosition="left"
          >
            Book Another Session
          </Button>
        </div>

        {/* Support Contact */}
        <div className="text-center mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Need help or have questions?
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <a 
              href="tel:+1-555-123-4567" 
              className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-smooth"
            >
              <Icon name="Phone" size={14} />
              <span>(555) 123-4567</span>
            </a>
            <a 
              href="mailto:support@empireperformance.com" 
              className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-smooth"
            >
              <Icon name="Mail" size={14} />
              <span>support@empireperformance.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;