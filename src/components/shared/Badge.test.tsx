import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default info variant classes', () => {
    render(<Badge>Info Badge</Badge>);
    const badge = screen.getByText('Info Badge');
    expect(badge).toHaveClass('bg-clay/10');
    expect(badge).toHaveClass('text-clay');
  });

  it('applies success variant classes', () => {
    render(<Badge variant="success">Success Badge</Badge>);
    const badge = screen.getByText('Success Badge');
    expect(badge).toHaveClass('bg-moss/10');
    expect(badge).toHaveClass('text-moss');
  });

  it('applies warning variant classes', () => {
    render(<Badge variant="warning">Warning Badge</Badge>);
    const badge = screen.getByText('Warning Badge');
    expect(badge).toHaveClass('bg-sakura/20');
    expect(badge).toHaveClass('text-ink-700');
  });

  it('applies error variant classes', () => {
    render(<Badge variant="error">Error Badge</Badge>);
    const badge = screen.getByText('Error Badge');
    expect(badge).toHaveClass('bg-rust/10');
    expect(badge).toHaveClass('text-rust');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    expect(screen.getByText('Custom Badge')).toHaveClass('custom-class');
  });
});
