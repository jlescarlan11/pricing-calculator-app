import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    // Check for primary variant classes by default
    expect(button).toHaveClass('border-[#A67B5B]');
    expect(button).toHaveClass('text-[#A67B5B]');
    // Check for md size classes
    expect(button).toHaveClass('px-8');
    expect(button).toHaveClass('py-3');
    // Check for base styles (rounded-lg)
    expect(button).toHaveClass('rounded-lg');
  });

  it('renders primary variant correctly', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('border-[#A67B5B]');
    expect(button).toHaveClass('text-[#A67B5B]');
    expect(button).toHaveClass('hover:bg-[rgba(166,123,91,0.05)]');
  });

  it('renders secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('border-[#D4D2CF]');
    expect(button).toHaveClass('text-[#6B6761]');
  });

  it('renders success variant correctly', () => {
    render(<Button variant="success">Success</Button>);
    const button = screen.getByRole('button', { name: /success/i });
    expect(button).toHaveClass('border-[#7A8B73]');
    expect(button).toHaveClass('text-[#7A8B73]');
  });

  it('renders danger variant correctly', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button', { name: /danger/i });
    expect(button).toHaveClass('border-[#B85C38]');
    expect(button).toHaveClass('text-[#B85C38]');
  });

  it('applies loading state correctly', () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    // Check for the SVG spinner by class
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner?.tagName).toBe('svg');
  });

  it('renders disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('has accessible attributes', () => {
    render(<Button>Accessible</Button>);
    const button = screen.getByRole('button', { name: /accessible/i });
    expect(button).toHaveAttribute('type', 'button');
  });
});
