import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastProvider, useToast } from './Toast';

const TestComponent = ({ message, type }: { message: string; type?: any }) => {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast(message, type)}>
      Trigger Toast
    </button>
  );
};

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders toast when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent message="Test message" type="info" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('hides icon for success toasts starting with a checkmark', () => {
    render(
      <ToastProvider>
        <TestComponent message="✓ Success message" type="success" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));
    const alert = screen.getByRole('alert');
    // The icon is rendered inside a span, if it's null, the span shouldn't be there or should be empty
    // My code: {getIcon() && <span className="shrink-0">{getIcon()}</span>}
    expect(alert.querySelector('svg:not(.lucide-x)')).toBeNull();
  });

  it('auto-dismisses after 3 seconds', () => {
    render(
      <ToastProvider>
        <TestComponent message="Test message" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('can be manually dismissed', () => {
    render(
      <ToastProvider>
        <TestComponent message="Test message" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close notification'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('supports different types', () => {
    const { rerender } = render(
      <ToastProvider>
        <TestComponent message="Success message" type="success" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByRole('alert')).toHaveClass('text-moss');

    rerender(
      <ToastProvider>
        <TestComponent message="Error message" type="error" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getAllByRole('alert')[1]).toHaveClass('text-rust');
  });
});
