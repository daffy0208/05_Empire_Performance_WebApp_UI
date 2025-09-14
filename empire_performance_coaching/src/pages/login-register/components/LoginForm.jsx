import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const LoginForm = ({ 
  formData, 
  errors, 
  isLoading, 
  onInputChange, 
  onSubmit, 
  onForgotPassword 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData?.email}
        onChange={onInputChange}
        error={errors?.email}
        placeholder="john@example.com"
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        value={formData?.password}
        onChange={onInputChange}
        error={errors?.password}
        placeholder="Enter your password"
        required
      />
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          checked={formData?.rememberMe}
          onChange={(e) => onInputChange({
            target: { name: 'rememberMe', value: e?.target?.checked }
          })}
        />
        
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium"
        >
          Forgot password?
        </button>
      </div>
      {errors?.submit && (
        <div className="text-error text-sm text-center bg-error/10 p-3 rounded-md border border-error/20">
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
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;