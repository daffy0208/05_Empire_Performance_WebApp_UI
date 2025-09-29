import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const AuthenticationForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'parent',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'parent', label: 'Parent/Guardian' },
    { value: 'coach', label: 'Coach' },
    { value: 'director', label: 'Director' }
  ];

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (activeTab === 'register') {
      if (!formData?.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData?.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData?.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData?.password !== formData?.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Route based on role
      const roleRoutes = {
        parent: '/parent-dashboard',
        coach: '/coach-dashboard',
        director: '/director-dashboard'
      };
      
      navigate(roleRoutes?.[formData?.role]);
    } catch (error) {
      setErrors({ submit: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">EPC</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Empire Performance</h2>
          <p className="text-muted-foreground mt-2">Coaching Platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-smooth ${
              activeTab === 'login' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-smooth ${
              activeTab === 'register' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData?.firstName}
                  onChange={handleInputChange}
                  error={errors?.firstName}
                  placeholder="John"
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData?.lastName}
                  onChange={handleInputChange}
                  error={errors?.lastName}
                  placeholder="Smith"
                  required
                />
              </div>

              <Select
                label="I am a..."
                options={roleOptions}
                value={formData?.role}
                onChange={handleRoleChange}
                placeholder="Select your role"
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData?.email}
            onChange={handleInputChange}
            error={errors?.email}
            placeholder="john@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData?.password}
            onChange={handleInputChange}
            error={errors?.password}
            placeholder="Enter your password"
            required
          />

          {activeTab === 'register' && (
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData?.confirmPassword}
              onChange={handleInputChange}
              error={errors?.confirmPassword}
              placeholder="Confirm your password"
              required
            />
          )}

          {errors?.submit && (
            <div className="text-error text-sm text-center bg-error/10 p-3 rounded-md">
              {errors?.submit}
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={isLoading}
          >
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          {activeTab === 'login' && (
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-smooth"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
              className="text-primary hover:text-primary/80 transition-smooth font-medium"
            >
              {activeTab === 'login' ? 'Register here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationForm;