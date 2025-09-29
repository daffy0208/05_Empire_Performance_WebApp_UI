import React from 'react';

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const calculateStrength = (pwd) => {
    let strength = 0;

    // Length check
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;

    // Character checks
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;

    return Math.min(strength, 5); // Max 5 levels
  };

  const strength = calculateStrength(password);

  const getStrengthLabel = () => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[a-z]/.test(password) && /[A-Z]/.test(password), text: 'Upper & lowercase letters' },
    { met: /\d/.test(password), text: 'At least one number' },
    { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), text: 'At least one special character' },
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Password Strength</span>
          <span className={`font-medium ${
            strength <= 2 ? 'text-red-600' : strength <= 3 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-sm ${
                level <= strength ? getStrengthColor() : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 text-xs ${
              req.met ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
              req.met ? 'bg-green-500 text-white' : 'bg-gray-300'
            }`}>
              {req.met ? '✓' : ''}
            </span>
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;