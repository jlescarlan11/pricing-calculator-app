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
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('pricing_analysis_usage', JSON.stringify({ lastReset: today, count: 5 }));

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
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    localStorage.setItem(
      'pricing_analysis_usage',
      JSON.stringify({ lastReset: yesterdayStr, count: 5 })
    );

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

  describe('Intelligence Feedback', () => {
    const mockRecommendations = ['Recommendation 1'];

    it('shows Partial Analysis badge when market data is stale', () => {
      render(
        <AnalyzePriceCard
          isAnalyzed={true}
          recommendations={mockRecommendations}
          marketData={{ status: 'stale', competitorCount: 2 }}
        />
      );
      expect(screen.getByText('Partial Analysis')).toBeInTheDocument();
    });

    it('shows Partial Analysis badge when market data is insufficient', () => {
      render(
        <AnalyzePriceCard
          isAnalyzed={true}
          recommendations={mockRecommendations}
          marketData={{ status: 'insufficient', competitorCount: 1 }}
        />
      );
      expect(screen.getByText('Partial Analysis')).toBeInTheDocument();
    });

    it('does NOT show badge when market data is fresh', () => {
      render(
        <AnalyzePriceCard
          isAnalyzed={true}
          recommendations={mockRecommendations}
          marketData={{ status: 'fresh', competitorCount: 3 }}
        />
      );
      expect(screen.queryByText('Partial Analysis')).not.toBeInTheDocument();
    });

    it('displays correct market data age context for fresh data', () => {
      render(
        <AnalyzePriceCard
          isAnalyzed={true}
          recommendations={mockRecommendations}
          marketData={{ 
            status: 'fresh', 
            competitorCount: 3,
            oldestCompetitorDate: '2025-01-01T00:00:00Z'
          }}
        />
      );
      expect(screen.getByText(/Based on market data from Jan 01, 2025/i)).toBeInTheDocument();
    });

    it('displays context for insufficient data', () => {
      render(
        <AnalyzePriceCard
          isAnalyzed={true}
          recommendations={mockRecommendations}
          marketData={{ status: 'insufficient', competitorCount: 1 }}
        />
      );
      expect(screen.getByText(/Based on limited market data/i)).toBeInTheDocument();
    });

    it('displays context for missing data', () => {
      render(
        <AnalyzePriceCard
          isAnalyzed={true}
          recommendations={mockRecommendations}
          marketData={{ status: 'missing', competitorCount: 0 }}
        />
      );
      expect(screen.getByText(/Based on internal cost efficiency/i)).toBeInTheDocument();
    });
  });
});
