import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App Integration', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
    // Reset scroll position
    window.scrollTo = vi.fn();
    // Mock scrollIntoView which is not available in JSDOM
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: MemoryRouter });
  };

  it('navigates from form to results after calculation', async () => {
    renderWithRouter(<App />);

    // Fill in minimum required fields
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Batch Size/i), { target: { value: '10' } });

    const nameInputs = screen.getAllByLabelText(/Ingredient Name/i);
    const costInputs = screen.getAllByLabelText(/Cost/i);

    fireEvent.change(nameInputs[0], { target: { value: 'Ingredient 1' } });
    fireEvent.change(costInputs[0], { target: { value: '100' } });

    const calculateBtns = screen.getAllByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateBtns[0]);

    // Should show results
    expect(await screen.findByText(/^Results$/)).toBeInTheDocument();
    expect(screen.getByText(/Analysis for/i)).toHaveTextContent('Test Product');

    // Check if results are displayed
    expect(screen.getByText(/Recommended Price/i)).toBeInTheDocument();
  });

  it('can edit results to go back to form', async () => {
    renderWithRouter(<App />);

    // Load sample to speed up
    const loadSampleBtn = screen.getByText(/Explore Case Study/i);
    fireEvent.click(loadSampleBtn);

    const calculateBtns = screen.getAllByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateBtns[0]);

    expect(await screen.findByText(/^Results$/)).toBeInTheDocument();

    // Form is visible below results, so we can access inputs directly
    expect(screen.getByText(/Product Details/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Product Name/i);
    expect(nameInput).toHaveValue('Chocolate Chip Cookies');

    fireEvent.change(nameInput, { target: { value: 'Updated Cookie' } });
    expect(nameInput).toHaveValue('Updated Cookie');
  });

  it('loads sample data correctly', () => {
    renderWithRouter(<App />);

    const loadSampleBtn = screen.getByText(/Explore Case Study/i);
    fireEvent.click(loadSampleBtn);

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Chocolate Chip Cookies');
    expect(screen.getByLabelText(/Batch Size/i)).toHaveValue(50);
  });
});
