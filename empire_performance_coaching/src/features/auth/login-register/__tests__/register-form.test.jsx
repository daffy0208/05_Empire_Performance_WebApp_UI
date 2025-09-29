import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RegisterForm from '../components/RegisterForm';

describe('RegisterForm', () => {
  it('renders required fields and submit button', () => {
    render(
      <RegisterForm
        formData={{
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'parent',
          password: '',
          confirmPassword: '',
          agreeToTerms: false,
        }}
        errors={{}}
        isLoading={false}
        onInputChange={() => {}}
        onRoleChange={() => {}}
        onSubmit={(e) => e.preventDefault()}
      />
    );

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });
});

