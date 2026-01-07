import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SampleDemo } from './SampleDemo';

describe('SampleDemo', () => {
  const onLoadSample = vi.fn();

  it('renders correctly', () => {
    render(<SampleDemo onLoadSample={onLoadSample} />);

    expect(screen.getByText(/Artisan Cookie Case Study/i)).toBeInTheDocument();
    expect(screen.getByText(/Load Sample Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost\/Unit/i)).toBeInTheDocument();
  });

  it('calls onLoadSample when button is clicked', () => {
    render(<SampleDemo onLoadSample={onLoadSample} />);

    fireEvent.click(screen.getByText(/Load Sample Data/i));
    expect(onLoadSample).toHaveBeenCalledTimes(1);
  });
});
