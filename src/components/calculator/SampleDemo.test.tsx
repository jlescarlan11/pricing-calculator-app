import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SampleDemo } from './SampleDemo';

describe('SampleDemo', () => {
  it('renders correctly', () => {
    render(<SampleDemo onLoadSample={() => {}} />);
    
    expect(screen.getByText(/Artisan Cookie Case Study/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore Sample/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost\/Unit/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Price/i)).toBeInTheDocument();
    expect(screen.getByText(/Profit\/Batch/i)).toBeInTheDocument();
  });

  it('calls onLoadSample when button is clicked', () => {
    const onLoadSample = vi.fn();
    render(<SampleDemo onLoadSample={onLoadSample} />);
    
    fireEvent.click(screen.getByText(/Explore Sample/i));
    expect(onLoadSample).toHaveBeenCalledTimes(1);
  });
});