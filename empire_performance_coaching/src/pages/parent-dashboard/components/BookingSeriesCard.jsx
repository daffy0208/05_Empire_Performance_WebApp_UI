import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const BookingSeriesCard = ({ booking, onModify, onViewPayments, onPause }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getFrequencyText = (frequency) => {
    return frequency === 'weekly' ? 'Every week' : 'Every 2 weeks';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10';
      case 'paused': return 'text-warning bg-warning/10';
      case 'cancelled': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-1 border border-border overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Image
              src={booking?.coach?.avatar}
              alt={booking?.coach?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-foreground">{booking?.seriesName}</h3>
              <p className="text-sm text-muted-foreground">with {booking?.coach?.name}</p>
            </div>
          </div>
          
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking?.status)}`}>
            <Icon name="Circle" size={8} className="mr-1" />
            {booking?.status?.charAt(0)?.toUpperCase() + booking?.status?.slice(1)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Icon name="Repeat" size={16} className="mr-2" />
            {getFrequencyText(booking?.frequency)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Icon name="Clock" size={16} className="mr-2" />
            {booking?.duration} minutes
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Icon name="User" size={16} className="mr-2" />
            {booking?.athlete}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Icon name="DollarSign" size={16} className="mr-2" />
            {formatCurrency(booking?.pricePerSession)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewPayments(booking?.id)}
              iconName="CreditCard"
              iconPosition="left"
            >
              Payments
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onModify(booking?.id)}
              iconName="Settings"
              iconPosition="left"
            >
              Manage
            </Button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-border bg-muted/30">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Sessions */}
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <Icon name="Calendar" size={16} className="mr-2" />
                  Recent Sessions
                </h4>
                <div className="space-y-2">
                  {booking?.recentSessions?.map((session) => (
                    <div key={session?.id} className="flex items-center justify-between p-2 bg-card rounded-md">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {new Date(session.date)?.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">{session?.time}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        session?.status === 'completed' ? 'bg-success/10 text-success' :
                        session?.status === 'missed'? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                      }`}>
                        {session?.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <Icon name="DollarSign" size={16} className="mr-2" />
                  Payment Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Sessions:</span>
                    <span className="text-foreground font-medium">{booking?.totalSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessions Completed:</span>
                    <span className="text-foreground font-medium">{booking?.completedSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Paid:</span>
                    <span className="text-foreground font-medium">{formatCurrency(booking?.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Next Payment:</span>
                    <span className="text-foreground font-medium">
                      {booking?.nextPaymentDate ? new Date(booking.nextPaymentDate)?.toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {booking?.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPause(booking?.id)}
                    iconName="Pause"
                    iconPosition="left"
                  >
                    Pause Series
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewPayments(booking?.id)}
                  iconName="Receipt"
                  iconPosition="left"
                >
                  View All Invoices
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSeriesCard;