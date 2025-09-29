import React from 'react';

const SkipLinks = () => (
  <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50">
    <a
      href="#main-content"
      className="bg-[#C9A43B] text-black px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-white"
    >
      Skip to main content
    </a>
    <a
      href="#navigation"
      className="bg-[#C9A43B] text-black px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-white ml-2"
    >
      Skip to navigation
    </a>
  </div>
);

export default SkipLinks;