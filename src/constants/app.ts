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
    LOW_MARGIN: 'Your margin is a bit low. Consider adjusting costs or price.',
    NEGATIVE_VALUE: 'Oops, values should be more than zero.',
    REQUIRED_FIELD: 'Please fill this in to continue.',
    BATCH_SIZE_ZERO: 'Oops, batch size must be at least 1.',
  },
  HELP_TEXT: {
    MARKUP_STRATEGY: 'Markup is what you add to your cost to reach a selling price.',
    MARGIN_STRATEGY: 'Margin is the share of your selling price that remains as profit.',
    BATCH_SIZE: 'How many units do you make in one go?',
    OVERHEAD_COSTS: 'Daily costs like rent or packaging that support your business.',
  },
} as const;
