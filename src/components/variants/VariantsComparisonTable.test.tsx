import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VariantsComparisonTable } from './VariantsComparisonTable';
import type { VariantInput, VariantCalculation } from '../../types/variants';

describe('VariantsComparisonTable', () => {
  const mockVariants: VariantInput[] = [
    {
      id: 'v1',
      name: 'Small',
      amount: 10,
      unit: 'pcs',
      additionalIngredients: [],
      additionalLabor: 0,
      pricingStrategy: 'markup',
      pricingValue: 50,
      currentSellingPrice: null,
    },
    {
      id: 'v2',
      name: 'Large',
      amount: 5,
      unit: 'pcs',
      additionalIngredients: [],
      additionalLabor: 0,
      pricingStrategy: 'markup',
      pricingValue: 50,
      currentSellingPrice: null,
    },
  ];

  const mockCalculations: VariantCalculation[] = [
    {
      variantId: 'v1',
      baseCost: 10,
      additionalCost: 0,
      totalCost: 10,
      costPerUnit: 1, // 10 / 10
      breakEvenPrice: 1,
      recommendedPrice: 2,
      profitPerBatch: 10, // (2 - 1) * 10
      profitPerUnit: 1,
      profitMarginPercent: 50,
      breakdown: { ingredients: 10, labor: 0, overhead: 0 },
    },
    {
      variantId: 'v2',
      baseCost: 10,
      additionalCost: 5,
      totalCost: 15,
      costPerUnit: 3, // 15 / 5
      breakEvenPrice: 3,
      recommendedPrice: 6,
      profitPerBatch: 15, // (6 - 3) * 5
      profitPerUnit: 3,
      profitMarginPercent: 50,
      breakdown: { ingredients: 10, labor: 0, overhead: 5 },
    },
  ];

  it('renders table headers and variant data correctly', () => {
    render(<VariantsComparisonTable variants={mockVariants} calculations={mockCalculations} />);
    
    // Check headers (using getAllByText because it appears in mobile and desktop views)
    expect(screen.getAllByText('Variant').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Total Profit').length).toBeGreaterThan(0);

    // Check data rows
    expect(screen.getAllByText('Small').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Large').length).toBeGreaterThan(0);
  });

  it('calculates totals correctly', () => {
    render(<VariantsComparisonTable variants={mockVariants} calculations={mockCalculations} />);
    
    // Total Quantity: 10 + 5 = 15
    // 15 appears in the mobile card and desktop table
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
    
    // Total Batch Profit: 10 + 15 = 25
    // Note: The formatter adds currency symbol. "₱25.00" appears in mobile totals and desktop totals.
    const totalProfitElements = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() !== 'script' && content.includes('25.00');
    });
    expect(totalProfitElements.length).toBeGreaterThan(0);
  });

  it('sorts by Total Profit descending by default', () => {
    render(<VariantsComparisonTable variants={mockVariants} calculations={mockCalculations} />);
    
    // Get all rows from the table body (desktop view)
    // Note: role="row" is on <tr> elements.
    // The first row is the header. The last row is the totals.
    // So we look for data rows in between.
    const rows = screen.getAllByRole('row');
    
    // We expect at least header + 2 data + totals = 4 rows in desktop table
    // But mobile view renders Cards, not rows. RTL queries look at the whole document.
    // So we should focus on the table part for sorting tests.
    
    // Row 1 (index 1) should be "Large" (15 profit)
    expect(rows[1]).toHaveTextContent('Large');
    // Row 2 (index 2) should be "Small" (10 profit)
    expect(rows[2]).toHaveTextContent('Small');
  });

  it('sorts by Quantity when header is clicked', () => {
    render(<VariantsComparisonTable variants={mockVariants} calculations={mockCalculations} />);
    
    // Click the desktop table header
    // Note: "Qty" is only in desktop <th>.
    // Mobile view shows "10 pcs".
    // Let's be safe: find the <th> with "Qty"
    const headerCell = screen.getByRole('columnheader', { name: /Qty/i });
    
    fireEvent.click(headerCell); // First click: desc (default for new field)
    
    const rows = screen.getAllByRole('row');
    // Small (10) > Large (5). So Small first.
    expect(rows[1]).toHaveTextContent('Small');
    expect(rows[2]).toHaveTextContent('Large');
    
    fireEvent.click(headerCell); // Second click: asc
    const rowsAsc = screen.getAllByRole('row');
    expect(rowsAsc[1]).toHaveTextContent('Large');
    expect(rowsAsc[2]).toHaveTextContent('Small');
  });

  it('displays insights correctly highlighting the best performer', () => {
    render(<VariantsComparisonTable variants={mockVariants} calculations={mockCalculations} />);
    
    // "Large" is the best performer (15 profit vs 10).
    // The text is split by <strong> tags, so we check the paragraph's text content.
    // Find the paragraph that starts with "Your" (or contains it)
    const insightTexts = screen.getAllByText((content) => content.includes('Your'));
    // Depending on how it renders, we might get the text node "Your ". 
    // We want the parent paragraph.
    const paragraph = insightTexts[0].closest('p');
    
    expect(paragraph).toHaveTextContent('Your Large variant is the strongest contributor');
  });

  it('renders mobile card view', () => {
    // We can't easily test media queries in JSDOM, but we can check if the elements exist
    // The mobile view uses cards with "Batch Summary"
    render(<VariantsComparisonTable variants={mockVariants} calculations={mockCalculations} />);
    
    expect(screen.getByText('Batch Summary')).toBeInTheDocument();
  });
});
