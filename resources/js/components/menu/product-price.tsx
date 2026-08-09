import { usePricing } from '@/hooks/use-pricing';
import { cn } from '@/lib/utils';

interface ProductPriceProps {
    basePrice: number;
    discountPrice: number | null;
    /** Larger type for the details dialog. */
    size?: 'sm' | 'lg';
    className?: string;
}

/**
 * A product price rendered for the active display mode (USD, LBP, or both).
 * In "both" mode the currencies stack, with the pre-discount price struck
 * through beside the leading row only.
 */
export function ProductPrice({
    basePrice,
    discountPrice,
    size = 'sm',
    className,
}: ProductPriceProps) {
    const pricing = usePricing();
    const hasDiscount = discountPrice !== null;
    const effectivePrice = hasDiscount ? discountPrice : basePrice;
    const both = pricing.showUsd && pricing.showLbp;

    if (both) {
        return (
            <span
                className={cn(
                    'inline-flex flex-col items-start leading-tight',
                    className,
                )}
            >
                <span className="flex items-baseline gap-2">
                    <span
                        className={cn(
                            'font-semibold text-primary',
                            size === 'lg' ? 'text-2xl' : 'text-lg',
                        )}
                    >
                        {pricing.usd(effectivePrice)}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                            {pricing.usd(basePrice)}
                        </span>
                    )}
                </span>
                <span
                    className={cn(
                        'tracking-wide text-primary/60',
                        size === 'lg' ? 'text-sm' : 'text-xs',
                    )}
                >
                    {pricing.lbp(effectivePrice)}
                </span>
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5',
                className,
            )}
        >
            <span
                className={cn(
                    'font-semibold text-primary',
                    size === 'lg' ? 'text-2xl' : 'text-lg',
                )}
            >
                {pricing.primary(effectivePrice)}
            </span>
            {hasDiscount && (
                <span
                    className={cn(
                        'text-muted-foreground line-through',
                        size === 'lg' ? 'text-sm' : 'text-xs',
                    )}
                >
                    {pricing.primary(basePrice)}
                </span>
            )}
        </span>
    );
}
