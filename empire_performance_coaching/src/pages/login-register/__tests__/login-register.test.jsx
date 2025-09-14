import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LoginForm from '../components/LoginForm';

describe('LoginForm', () => {
  it('renders email and password inputs and submit button', () => {
    render(
      <LoginForm
        formData={{ email: '', password: '', rememberMe: false }}
        errors={{}}
        isLoading={false}
        onInputChange={() => {}}
        onSubmit={(e) => e.preventDefault()}
        onForgotPassword={() => {}}
      />
    );

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});

