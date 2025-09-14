import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialAuth from './components/SocialAuth';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import SecurityBadges from './components/SecurityBadges';
import { z } from 'zod';

const LoginRegister = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'parent',
    rememberMe: false,
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Redirect based on role when available
      navigate('/parent-dashboard'); // Default redirect
    }
  }, [user, navigate]);

  // Mock credentials for testing
  const mockCredentials = {
    parent: { email: 'parent@test.com', password: 'parent123' },
    coach: { email: 'coach@test.com', password: 'coach123' },
    director: { email: 'director@test.com', password: 'director123' }
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required')
  });

  const validateLoginForm = () => {
    const result = loginSchema.safeParse({ email: formData?.email, password: formData?.password });
    if (!result.success) {
      const newErrors = Object.fromEntries(result.error.issues.map(i => [i.path[0], i.message]));
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    phone: z.string().min(1, 'Phone number is required'),
    role: z.enum(['parent', 'coach']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeToTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms and conditions' }) }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

  const validateRegisterForm = () => {
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = Object.fromEntries(result.error.issues.map(i => [i.path[0], i.message]));
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    
    if (!validateLoginForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);
      
      if (error) {
        setErrors({ 
          submit: error?.message || 'Invalid credentials. Please try again.' 
        });
        return;
      }

      // Navigation will be handled by useEffect when user state updates
    } catch (error) {
      setErrors({ submit: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    
    if (!validateRegisterForm()) return;

    setIsLoading(true);

    try {
      const userData = {
        full_name: `${formData?.firstName} ${formData?.lastName}`,
        role: formData?.role,
        phone: formData?.phone
      };

      const { data, error } = await signUp(formData?.email, formData?.password, userData);
      
      if (error) {
        setErrors({ 
          submit: error?.message || 'Registration failed. Please try again.' 
        });
        return;
      }

      // Navigation will be handled by useEffect when user state updates
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setIsLoading(true);
    try {
      // Simulate social auth
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/parent-dashboard');
    } catch (error) {
      setErrors({ submit: `${provider} authentication failed. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  // If user is authenticated, show loading while redirect happens
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-foreground mb-4">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Sports Imagery */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1920')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-secondary/80"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Logo & Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-primary rounded-xl mx-auto mb-6 shadow-elevation-2">
            <span className="text-primary-foreground font-bold text-3xl">EPC</span>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-2">Empire Performance</h1>
          <p className="text-primary-foreground/80 text-lg">Coaching Platform</p>
          <p className="text-primary-foreground/60 text-sm mt-2">
            Secure access for parents, coaches, and directors
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-card rounded-xl shadow-elevation-3 p-8">
          {/* Tab Navigation */}
          <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Forms */}
          {activeTab === 'login' ? (
            <LoginForm
              formData={formData}
              errors={errors}
              isLoading={isLoading || authLoading}
              onInputChange={handleInputChange}
              onSubmit={handleLogin}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          ) : (
            <RegisterForm
              formData={formData}
              errors={errors}
              isLoading={isLoading || authLoading}
              onInputChange={handleInputChange}
              onRoleChange={handleRoleChange}
              onSubmit={handleRegister}
            />
          )}

          {/* Social Authentication */}
          <div className="mt-6">
            <SocialAuth
              onGoogleAuth={() => handleSocialAuth('Google')}
              onFacebookAuth={() => handleSocialAuth('Facebook')}
              isLoading={isLoading || authLoading}
            />
          </div>

          {/* Security Badges */}
          <SecurityBadges />
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-primary-foreground/60 text-sm">
            {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
              className="text-primary hover:text-primary/80 transition-smooth font-medium underline"
            >
              {activeTab === 'login' ? 'Register here' : 'Sign in here'}
            </button>
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-primary-foreground/50">
            <button className="hover:text-primary-foreground/70 transition-smooth">
              Privacy Policy
            </button>
            <span>•</span>
            <button className="hover:text-primary-foreground/70 transition-smooth">
              Terms of Service
            </button>
            <span>•</span>
            <button className="hover:text-primary-foreground/70 transition-smooth">
              Support
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default LoginRegister;