import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SampleDemo } from './SampleDemo';

describe('SampleDemo', () => {
  it('renders correctly', () => {
    render(<SampleDemo onLoadSample={() => {}} />);
    
    expect(screen.getByText(/Chocolate Chip Cookies Example/i)).toBeDefined();
    expect(screen.getByText(/Try It Yourself/i)).toBeDefined();
    expect(screen.getByText(/Total Cost/i)).toBeDefined();
    expect(screen.getByText(/Cost\/Unit/i)).toBeDefined();
    expect(screen.getByText(/Target Price/i)).toBeDefined();
    expect(screen.getByText(/Profit\/Batch/i)).toBeDefined();
  });

  it('calls onLoadSample when button is clicked', () => {
    const onLoadSample = vi.fn();
    render(<SampleDemo onLoadSample={onLoadSample} />);
    
    fireEvent.click(screen.getByText(/Try It Yourself/i));
    expect(onLoadSample).toHaveBeenCalledTimes(1);
  });
});
