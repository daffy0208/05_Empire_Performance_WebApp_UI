import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

// Mock the AppIcon component
vi.mock('../../AppIcon', () => ({
  default: ({ name, size, className }: any) => (
    <span data-testid="mock-icon" data-icon={name} data-size={size} className={className}>
      {name}
    </span>
  )
}));

describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>);

    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
  });

  it('should be disabled when loading prop is true', () => {
    render(<Button loading>Loading button</Button>);

    const button = screen.getByRole('button', { name: /loading button/i });
    expect(button).toBeDisabled();
  });

  it('should show loading spinner when loading', () => {
    render(<Button loading>Loading button</Button>);

    const spinner = screen.getByRole('button').querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should prevent click when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>Disabled button</Button>);

    const button = screen.getByRole('button', { name: /disabled button/i });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should prevent click when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button loading onClick={handleClick}>Loading button</Button>);

    const button = screen.getByRole('button', { name: /loading button/i });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  describe('Variants', () => {
    it('should apply primary variant styles', () => {
      render(<Button variant="primary">Primary button</Button>);

      const button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toHaveClass('bg-[#C9A43B]', 'text-black');
    });

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary button</Button>);

      const button = screen.getByRole('button', { name: /secondary button/i });
      expect(button).toHaveClass('bg-[#1A1A1D]', 'text-[#F5F5F5]', 'border');
    });

    it('should apply destructive variant styles', () => {
      render(<Button variant="destructive">Destructive button</Button>);

      const button = screen.getByRole('button', { name: /destructive button/i });
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });
  });

  describe('Sizes', () => {
    it('should apply small size styles', () => {
      render(<Button size="sm">Small button</Button>);

      const button = screen.getByRole('button', { name: /small button/i });
      expect(button).toHaveClass('rounded-lg', 'px-3', 'py-2');
    });

    it('should apply large size styles', () => {
      render(<Button size="lg">Large button</Button>);

      const button = screen.getByRole('button', { name: /large button/i });
      expect(button).toHaveClass('rounded-xl', 'px-8', 'py-4');
    });

    it('should apply icon size styles', () => {
      render(<Button size="icon">Icon button</Button>);

      const button = screen.getByRole('button', { name: /icon button/i });
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('Full Width', () => {
    it('should apply full width when fullWidth prop is true', () => {
      render(<Button fullWidth>Full width button</Button>);

      const button = screen.getByRole('button', { name: /full width button/i });
      expect(button).toHaveClass('w-full');
    });

    it('should not apply full width by default', () => {
      render(<Button>Normal button</Button>);

      const button = screen.getByRole('button', { name: /normal button/i });
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Icons', () => {
    it('should render icon on the left by default', () => {
      render(<Button iconName="plus">Button with icon</Button>);

      const icon = screen.getByTestId('mock-icon');
      const button = screen.getByRole('button');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'plus');
      expect(icon).toHaveClass('mr-2');
    });

    it('should render icon on the right when iconPosition is right', () => {
      render(<Button iconName="arrow-right" iconPosition="right">Button with right icon</Button>);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'arrow-right');
      expect(icon).toHaveClass('ml-2');
    });

    it('should render icon with custom size', () => {
      render(<Button iconName="star" iconSize={24}>Button with custom icon size</Button>);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-size', '24');
    });

    it('should calculate icon size based on button size', () => {
      render(<Button iconName="heart" size="lg">Large button with icon</Button>);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-size', '18');
    });
  });

  describe('AsChild functionality', () => {
    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link button</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should fallback to button when asChild is true but invalid child', () => {
      render(
        <Button asChild>
          <span>Invalid child</span>
          <span>Multiple children</span>
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class">Custom button</Button>);

      const button = screen.getByRole('button', { name: /custom button/i });
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex'); // Should still have default classes
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<Button>Focusable button</Button>);

      const button = screen.getByRole('button', { name: /focusable button/i });
      button.focus();

      expect(button).toHaveFocus();
    });

    it('should have proper focus styles', () => {
      render(<Button>Focus button</Button>);

      const button = screen.getByRole('button', { name: /focus button/i });
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('should support aria attributes', () => {
      render(
        <Button aria-label="Custom aria label" aria-describedby="description">
          Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /custom aria label/i });
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Form integration', () => {
    it('should support type attribute', () => {
      render(<Button type="submit">Submit button</Button>);

      const button = screen.getByRole('button', { name: /submit button/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support form attribute', () => {
      render(<Button form="test-form">Form button</Button>);

      const button = screen.getByRole('button', { name: /form button/i });
      expect(button).toHaveAttribute('form', 'test-form');
    });
  });
});