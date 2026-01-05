import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    // Check for primary variant classes by default
    expect(button).toHaveClass('bg-clay');
    expect(button).toHaveClass('text-white');
    // Check for md size classes
    expect(button).toHaveClass('px-8');
    expect(button).toHaveClass('py-3');
    // Check for base styles (rounded-xl)
    expect(button).toHaveClass('rounded-xl');
  });

  it('renders primary variant correctly', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('bg-clay');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('hover:bg-clay/90');
  });

  it('renders secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-surface');
    expect(button).toHaveClass('text-ink-700');
  });

  it('renders success variant correctly', () => {
    render(<Button variant="success">Success</Button>);
    const button = screen.getByRole('button', { name: /success/i });
    expect(button).toHaveClass('bg-moss');
    expect(button).toHaveClass('text-white');
  });

  it('renders danger variant correctly', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button', { name: /danger/i });
    expect(button).toHaveClass('bg-rust');
    expect(button).toHaveClass('text-white');
  });

  it('applies loading state correctly', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('renders disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has accessible attributes', () => {
    render(<Button aria-label="custom label">Action</Button>);
    const button = screen.getByLabelText('custom label');
    expect(button).toBeInTheDocument();
  });
});