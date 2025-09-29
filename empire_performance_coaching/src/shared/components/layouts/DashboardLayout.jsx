import React, { useEffect, useRef } from 'react';

const DashboardLayout = ({ children }) => {
  const mainRef = useRef(null);

  useEffect(() => {
    // Move focus to main on mount to aid keyboard/screen reader users
    mainRef?.current?.focus?.();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main
        ref={mainRef}
        tabIndex={-1}
        role="main"
        className="outline-none focus:outline-none"
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

