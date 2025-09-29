import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  return (
    <div className="flex items-center justify-center space-x-6 mt-8 pt-6 border-t border-border">
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Icon name="Shield" size={16} />
        <span className="text-xs font-medium">SSL Secured</span>
      </div>
      
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Icon name="Lock" size={16} />
        <span className="text-xs font-medium">256-bit Encryption</span>
      </div>
      
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Icon name="CheckCircle" size={16} />
        <span className="text-xs font-medium">GDPR Compliant</span>
      </div>
    </div>
  );
};

export default SecurityBadges;