export type PriceDisplay = 'usd' | 'lbp' | 'both';

export type Pricing = {
    display: PriceDisplay;
    /** LBP per 1 USD, or null when LBP pricing is unavailable. */
    lbpRate: number | null;
};
