/**
 * Password complexity validation utilities
 * Based on security best practices for authentication systems
 */

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128 // Prevent DoS attacks
};

/**
 * Validates password complexity against defined requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid boolean and detailed errors
 */
export const validatePasswordComplexity = (password) => {
  const errors = [];

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  // Check maximum length (security measure)
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  // Check for common weak patterns
  if (isCommonWeakPassword(password)) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculates password strength score (0-4)
 * @param {string} password - Password to evaluate
 * @returns {Object} - Strength score and description
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, description: 'No password' };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    longLength: password.length >= 12,
    noCommonPatterns: !isCommonWeakPassword(password)
  };

  // Basic requirements
  if (checks.length) score++;
  if (checks.uppercase && checks.lowercase) score++;
  if (checks.numbers) score++;
  if (checks.specialChars) score++;

  // Bonus points
  if (checks.longLength && score >= 3) score = Math.min(4, score + 0.5);
  if (checks.noCommonPatterns && score >= 3) score = Math.min(4, score + 0.5);

  const descriptions = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong'
  };

  return {
    score: Math.floor(score),
    description: descriptions[Math.floor(score)],
    checks
  };
};

/**
 * Checks if password matches common weak patterns
 * @param {string} password - Password to check
 * @returns {boolean} - True if password is commonly weak
 */
const isCommonWeakPassword = (password) => {
  const commonWeakPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty',
    'abc123', 'password1', '12345678', '111111', '123123',
    'admin', 'welcome', 'login', 'guest', 'test', 'user',
    'root', 'master', '1234', '12345', 'pass', 'football'
  ];

  const lowerPassword = password.toLowerCase();

  // Check exact matches
  if (commonWeakPasswords.includes(lowerPassword)) {
    return true;
  }

  // Check for simple patterns
  if (/^(.)\1{3,}$/.test(password)) return true; // Repeated characters (aaaa, 1111)
  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde)/.test(lowerPassword)) return true; // Sequential patterns
  if (/^(qwe|asd|zxc)/.test(lowerPassword)) return true; // Keyboard patterns

  return false;
};

/**
 * Gets user-friendly password requirements text
 * @returns {Array} - Array of requirement strings
 */
export const getPasswordRequirementsText = () => {
  return [
    `At least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
    'Contains uppercase and lowercase letters',
    'Contains at least one number',
    'Contains at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
    'Not a commonly used password'
  ];
};