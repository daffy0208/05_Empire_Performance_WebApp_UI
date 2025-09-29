import React from 'react';
import { calculatePasswordStrength, getPasswordRequirementsText } from '../../utils/passwordValidation';

const PasswordStrengthIndicator = ({ password, showRequirements = true }) => {
  const { score, description, checks } = calculatePasswordStrength(password);

  if (!password) return null;

  const getStrengthColor = (score) => {
    const colors = {
      0: 'bg-red-500',
      1: 'bg-red-400',
      2: 'bg-yellow-500',
      3: 'bg-blue-500',
      4: 'bg-green-500'
    };
    return colors[score] || colors[0];
  };

  const getStrengthTextColor = (score) => {
    const colors = {
      0: 'text-red-600',
      1: 'text-red-500',
      2: 'text-yellow-600',
      3: 'text-blue-600',
      4: 'text-green-600'
    };
    return colors[score] || colors[0];
  };

  const requirements = getPasswordRequirementsText();

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Password Strength</span>
          <span className={`font-medium ${getStrengthTextColor(score)}`}>
            {description}
          </span>
        </div>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-sm ${
                level <= score
                  ? getStrengthColor(score)
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600 font-medium">Requirements:</div>
          <div className="space-y-1">
            <div className={`flex items-center space-x-2 text-xs ${
              checks.length ? 'text-green-600' : 'text-gray-500'
            }`}>
              <span className={`w-3 h-3 rounded-full flex items-center justify-center ${
                checks.length ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                {checks.length ? '✓' : '○'}
              </span>
              <span>At least 8 characters long</span>
            </div>

            <div className={`flex items-center space-x-2 text-xs ${
              checks.uppercase && checks.lowercase ? 'text-green-600' : 'text-gray-500'
            }`}>
              <span className={`w-3 h-3 rounded-full flex items-center justify-center ${
                checks.uppercase && checks.lowercase ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                {checks.uppercase && checks.lowercase ? '✓' : '○'}
              </span>
              <span>Upper & lowercase letters</span>
            </div>

            <div className={`flex items-center space-x-2 text-xs ${
              checks.numbers ? 'text-green-600' : 'text-gray-500'
            }`}>
              <span className={`w-3 h-3 rounded-full flex items-center justify-center ${
                checks.numbers ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                {checks.numbers ? '✓' : '○'}
              </span>
              <span>At least one number</span>
            </div>

            <div className={`flex items-center space-x-2 text-xs ${
              checks.specialChars ? 'text-green-600' : 'text-gray-500'
            }`}>
              <span className={`w-3 h-3 rounded-full flex items-center justify-center ${
                checks.specialChars ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                {checks.specialChars ? '✓' : '○'}
              </span>
              <span>Special character (!@#$%^&*)</span>
            </div>

            <div className={`flex items-center space-x-2 text-xs ${
              checks.noCommonPatterns ? 'text-green-600' : 'text-gray-500'
            }`}>
              <span className={`w-3 h-3 rounded-full flex items-center justify-center ${
                checks.noCommonPatterns ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                {checks.noCommonPatterns ? '✓' : '○'}
              </span>
              <span>Not a common password</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;