import type { PriceParts } from '@/hooks/use-pricing';
import { cn } from '@/lib/utils';

interface CartTotalsProps {
    pricing: PriceParts;
    subtotalUsd: number;
    /** Delivery charge in USD, or null when none applies. */
    deliveryFeeUsd: number | null;
    totalUsd: number;
}

/**
 * The money summary above the checkout button. The subtotal/delivery breakdown
 * only appears when a delivery charge is being added.
 */
export function CartTotals({
    pricing,
    subtotalUsd,
    deliveryFeeUsd,
    totalUsd,
}: CartTotalsProps) {
    return (
        <div className="flex flex-col gap-2">
            {deliveryFeeUsd !== null && (
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span className="tabular-nums">
                            {pricing.primary(subtotalUsd)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Delivery</span>
                        <span className="tabular-nums">
                            {pricing.primary(deliveryFeeUsd)}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <span className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    {deliveryFeeUsd !== null ? 'Total' : 'Subtotal'}
                </span>
                <span className="flex flex-col items-end leading-tight">
                    {pricing.showUsd && (
                        <span className="text-xl font-semibold text-primary">
                            {pricing.usd(totalUsd)}
                        </span>
                    )}
                    {pricing.showLbp && (
                        <span
                            className={cn(
                                pricing.showUsd
                                    ? 'text-xs text-muted-foreground'
                                    : 'text-xl font-semibold text-primary',
                            )}
                        >
                            {pricing.lbp(totalUsd)}
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
