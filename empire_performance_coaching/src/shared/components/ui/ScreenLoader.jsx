import React from 'react';
import Icon from '../AppIcon';

const ScreenLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0E0E10' }}>
      <div className="text-center">
        <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4" style={{ color: '#C9A43B' }} />
        <p style={{ color: '#CFCFCF' }}>{message}</p>
      </div>
    </div>
  );
};

export default ScreenLoader;

