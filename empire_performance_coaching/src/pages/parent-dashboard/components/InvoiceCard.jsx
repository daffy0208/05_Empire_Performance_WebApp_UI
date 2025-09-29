import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InvoiceCard = ({ invoice, onDownload, onViewDetails }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'overdue': return 'text-destructive bg-destructive/10';
      case 'failed': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card': return 'CreditCard';
      case 'cash': return 'Banknote';
      case 'bank': return 'Building2';
      default: return 'DollarSign';
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-elevation-1 border border-border hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground mb-1">
            Invoice #{invoice?.number}
          </h3>
          <p className="text-sm text-muted-foreground">
            {invoice?.description}
          </p>
        </div>
        
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice?.status)}`}>
          <Icon name="Circle" size={8} className="mr-1" />
          {invoice?.status?.charAt(0)?.toUpperCase() + invoice?.status?.slice(1)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} className="mr-2" />
          <div>
            <div className="text-foreground">Issue Date</div>
            <div>{formatDate(invoice?.issueDate)}</div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Clock" size={16} className="mr-2" />
          <div>
            <div className="text-foreground">Due Date</div>
            <div>{formatDate(invoice?.dueDate)}</div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name={getPaymentMethodIcon(invoice?.paymentMethod)} size={16} className="mr-2" />
          <div>
            <div className="text-foreground">Payment Method</div>
            <div className="capitalize">{invoice?.paymentMethod}</div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="DollarSign" size={16} className="mr-2" />
          <div>
            <div className="text-foreground">Amount</div>
            <div className="font-semibold text-lg text-foreground">{formatCurrency(invoice?.amount)}</div>
          </div>
        </div>
      </div>
      {invoice?.sessions && invoice?.sessions?.length > 0 && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
            <Icon name="List" size={16} className="mr-2" />
            Sessions Included ({invoice?.sessions?.length})
          </h4>
          <div className="space-y-1">
            {invoice?.sessions?.slice(0, 3)?.map((session, index) => (
              <div key={index} className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDate(session?.date)} - {session?.athlete}</span>
                <span>{formatCurrency(session?.amount)}</span>
              </div>
            ))}
            {invoice?.sessions?.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{invoice?.sessions?.length - 3} more sessions
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(invoice?.id)}
            iconName="Download"
            iconPosition="left"
          >
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(invoice?.id)}
            iconName="Eye"
            iconPosition="left"
          >
            Details
          </Button>
        </div>
        
        {invoice?.status === 'overdue' && (
          <Button
            variant="destructive"
            size="sm"
            iconName="AlertTriangle"
            iconPosition="left"
          >
            Pay Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;