export type PriceDisplay = 'usd' | 'lbp' | 'both';

export type Pricing = {
    display: PriceDisplay;
    /** LBP per 1 USD, or null when LBP pricing is unavailable. */
    lbpRate: number | null;
    /** Delivery charge in USD added to an order, or null when none applies. */
    deliveryFeeUsd: number | null;
};
