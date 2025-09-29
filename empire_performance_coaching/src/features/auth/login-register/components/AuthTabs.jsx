import React from 'react';

const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex bg-muted rounded-lg p-1 mb-8">
      <button
        type="button"
        onClick={() => onTabChange('login')}
        className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-smooth ${
          activeTab === 'login' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onTabChange('register')}
        className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-smooth ${
          activeTab === 'register' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
        }`}
      >
        Register
      </button>
    </div>
  );
};

export default AuthTabs;