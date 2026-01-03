export const DEFAULT_MARKUP_PERCENT = 50;
export const DEFAULT_MARGIN_PERCENT = 30;

export const MIN_MARKUP_PERCENT = 10;
export const MAX_MARKUP_PERCENT = 500;

export const MIN_MARGIN_PERCENT = 5;
export const MAX_MARGIN_PERCENT = 80;

export const MAX_BATCH_SIZE = 10000;

export const PROFIT_MARGIN_THRESHOLDS = {
  LOW: 15,
  GOOD: 25,
} as const;

export const MESSAGES = {
  WARNINGS: {
    LOW_MARGIN: 'Warning: Your profit margin is below the recommended threshold.',
    NEGATIVE_VALUE: 'Please enter a positive value.',
    REQUIRED_FIELD: 'This field is required.',
    BATCH_SIZE_ZERO: 'Batch size must be at least 1.',
  },
  HELP_TEXT: {
    MARKUP_STRATEGY: 'Markup is the percentage added to the cost price to determine the selling price.',
    MARGIN_STRATEGY: 'Profit Margin is the percentage of the selling price that is profit.',
    BATCH_SIZE: 'The number of units produced in a single production run.',
    OVERHEAD_COSTS: 'Fixed costs like rent, utilities, and packaging that are not tied to a single ingredient.',
  },
} as const;
