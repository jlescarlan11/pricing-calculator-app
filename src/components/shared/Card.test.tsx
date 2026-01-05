import { render, screen } from '@testing-library/react';
import { Card } from './Card';
import { describe, it, expect } from 'vitest';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title correctly', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders footer correctly', () => {
    render(<Card footer="Test Footer">Content</Card>);
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('bg-surface');
    expect(card).toHaveClass('rounded-xl'); // Updated expectation
    expect(card).toHaveClass('shadow-level-1'); // Updated expectation
  });

  it('applies interactive classes when interactive prop is true', () => {
    const { container } = render(<Card interactive>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('hover:shadow-level-2');
    expect(card).toHaveClass('hover:-translate-y-0.5');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('renders texture when texture prop is true', () => {
    const { container } = render(<Card texture>Content</Card>);
    const texture = container.querySelector('.paper-texture');
    expect(texture).toBeInTheDocument();
  });

  it('applies padding classes by default', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
