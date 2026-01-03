import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FAQ } from './FAQ';

describe('FAQ', () => {
  it('renders correctly with initial questions', () => {
    render(<FAQ />);
    
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/What’s a good profit margin for food products\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How often should I recalculate prices\?/i)).toBeInTheDocument();
  });

  it('expands and collapses an item when clicked', () => {
    render(<FAQ />);
    
    const question = screen.getByText(/What’s a good profit margin for food products\?/i);
    const button = question.closest('button');
    
    // Initially closed (or at least the answer should not be visible in a way that suggests it's expanded)
    // We check aria-expanded
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(button!);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/A healthy profit margin for most food businesses is typically between 25% and 35%/i)).toBeInTheDocument();
    
    fireEvent.click(button!);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters questions based on search input', () => {
    render(<FAQ />);
    
    const searchInput = screen.getByPlaceholderText(/Search for questions or keywords\.\.\./i);
    
    fireEvent.change(searchInput, { target: { value: 'profit margin' } });
    
    expect(screen.getByText(/What’s a good profit margin for food products\?/i)).toBeInTheDocument();
    expect(screen.queryByText(/How often should I recalculate prices\?/i)).not.toBeInTheDocument();
  });

  it('shows "no results" message when no match is found', () => {
    render(<FAQ />);
    
    const searchInput = screen.getByPlaceholderText(/Search for questions or keywords\.\.\./i);
    
    fireEvent.change(searchInput, { target: { value: 'nonexistent keyword' } });
    
    expect(screen.getByText(/No results found for "nonexistent keyword"/i)).toBeInTheDocument();
  });

  it('only one item is expanded at a time', () => {
    render(<FAQ />);
    
    const questions = [
      screen.getByText(/What’s a good profit margin for food products\?/i),
      screen.getByText(/How often should I recalculate prices\?/i)
    ];
    
    const buttons = questions.map(q => q.closest('button')!);
    
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });
});
