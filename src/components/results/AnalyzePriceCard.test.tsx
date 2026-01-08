import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyzePriceCard } from './AnalyzePriceCard';

describe('AnalyzePriceCard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<AnalyzePriceCard />);
    
    expect(screen.getByText(/Want a deeper look\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Get an automated analysis of your costs/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze My Pricing/i })).toBeInTheDocument();
    expect(screen.getByText(/5 analyses remaining today/i)).toBeInTheDocument();
  });

  it('calls onAnalyze when button is clicked and limit is not reached', () => {
    const onAnalyze = vi.fn();
    render(<AnalyzePriceCard onAnalyze={onAnalyze} />);
    
    const button = screen.getByRole('button', { name: /Analyze My Pricing/i });
    fireEvent.click(button);
    
    expect(onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('enforces rate limit after 5 analyses', () => {
    const today = new Date().toLocaleDateString('en-CA');
    localStorage.setItem('pricing_analysis_usage', JSON.stringify({ date: today, count: 5 }));
    
    const onAnalyze = vi.fn();
    render(<AnalyzePriceCard onAnalyze={onAnalyze} />);
    
    expect(screen.getByText(/reached your daily limit of 5 AI analyses/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Analyze My Pricing/i });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(onAnalyze).not.toHaveBeenCalled();
  });

  it('resets limit on a new day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
    
    localStorage.setItem('pricing_analysis_usage', JSON.stringify({ date: yesterdayStr, count: 5 }));
    
    render(<AnalyzePriceCard />);
    
    expect(screen.getByText(/5 analyses remaining today/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Analyze My Pricing/i });
    expect(button).not.toBeDisabled();
  });

  it('shows loading state on button', () => {
    render(<AnalyzePriceCard isLoading={true} />);
    
    const button = screen.getByRole('button', { name: /Analyze My Pricing/i });
    expect(button).toBeDisabled();
    // Check for loading spinner (represented by svg in Button component)
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AnalyzePriceCard className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('is hidden in print mode via class', () => {
    const { container } = render(<AnalyzePriceCard />);
    expect(container.firstChild).toHaveClass('print:hidden');
  });
});
