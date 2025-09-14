import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const RegisterForm = ({ 
  formData, 
  errors, 
  isLoading, 
  onInputChange, 
  onRoleChange, 
  onSubmit 
}) => {
  const roleOptions = [
    { value: 'parent', label: 'Parent/Guardian' },
    { value: 'coach', label: 'Coach' }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          name="firstName"
          value={formData?.firstName}
          onChange={onInputChange}
          error={errors?.firstName}
          placeholder="John"
          required
        />
        <Input
          label="Last Name"
          type="text"
          name="lastName"
          value={formData?.lastName}
          onChange={onInputChange}
          error={errors?.lastName}
          placeholder="Smith"
          required
        />
      </div>
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
        label="Phone Number"
        type="tel"
        name="phone"
        value={formData?.phone}
        onChange={onInputChange}
        error={errors?.phone}
        placeholder="(555) 123-4567"
        required
      />
      <Select
        label="I am a..."
        options={roleOptions}
        value={formData?.role}
        onChange={onRoleChange}
        placeholder="Select your role"
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        value={formData?.password}
        onChange={onInputChange}
        error={errors?.password}
        placeholder="Create a strong password"
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData?.confirmPassword}
        onChange={onInputChange}
        error={errors?.confirmPassword}
        placeholder="Confirm your password"
        required
      />
      <Checkbox
        label="I agree to the Terms of Service and Privacy Policy"
        checked={formData?.agreeToTerms}
        onChange={(e) => onInputChange({
          target: { name: 'agreeToTerms', value: e?.target?.checked }
        })}
        error={errors?.agreeToTerms}
        required
      />
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
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;