import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UpcomingSessionCard = ({ session, onReschedule, onCancel, onViewNotes }) => {
  const [showActions, setShowActions] = useState(false);
  
  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`)?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'cancelled': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const canModify = () => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60);
    return hoursUntilSession > 24 && session?.status === 'confirmed';
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-elevation-1 border border-border hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={session?.coach?.avatar}
              alt={session?.coach?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card"></div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{session?.coach?.name}</h3>
            <p className="text-sm text-muted-foreground">{session?.coach?.specialty}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session?.status)}`}>
            <Icon name="Circle" size={8} className="mr-1" />
            {session?.status?.charAt(0)?.toUpperCase() + session?.status?.slice(1)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} className="mr-2" />
          {formatDate(session?.date)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Clock" size={16} className="mr-2" />
          {formatTime(session?.startTime)} - {formatTime(session?.endTime)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="MapPin" size={16} className="mr-2" />
          {session?.location}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="User" size={16} className="mr-2" />
          {session?.athlete}
        </div>
      </div>
      {session?.notes && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center mb-2">
            <Icon name="FileText" size={16} className="text-muted-foreground mr-2" />
            <span className="text-sm font-medium text-foreground">Session Notes</span>
          </div>
          <p className="text-sm text-muted-foreground">{session?.notes}</p>
        </div>
      )}
      {/* Primary Actions - Always Visible */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {canModify() && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReschedule(session?.id)}
                iconName="Calendar"
                iconPosition="left"
              >
                Reschedule
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(session?.id)}
                iconName="X"
                iconPosition="left"
              >
                Cancel
              </Button>
            </>
          )}
          {!canModify() && (
            <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">
              Changes not allowed within 24 hours of session
            </div>
          )}
        </div>

        {session?.hasNotes && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewNotes(session?.id)}
            iconName="Eye"
            iconPosition="left"
          >
            View Notes
          </Button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            iconName={showActions ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            className="text-muted-foreground"
          >
            More Options
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              alert('Cancellation Policy:\n\n• 24+ hours notice: Full refund\n• 12-24 hours notice: 50% refund\n• Less than 12 hours: No refund\n• Emergency cancellations will be reviewed case by case\n\nRescheduling is free with 24+ hours notice.');
            }}
            iconName="Info"
            iconPosition="left"
            className="text-muted-foreground"
          >
            Cancellation Policy
          </Button>
        </div>

        {showActions && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Need help? Contact support for assistance with your booking.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingSessionCard;