import { Flame, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface DietIconsProps {
    product: Pick<Product, 'is_spicy' | 'is_vegan'>;
    /** Tailwind size utility for each icon, e.g. "size-3.5". */
    iconClassName?: string;
    className?: string;
}

/**
 * Compact spicy / vegan markers for a product. Renders nothing when the product
 * is neither, so it can sit inline next to a title without reserving space.
 */
export function DietIcons({
    product,
    iconClassName = 'size-3.5',
    className,
}: DietIconsProps) {
    if (!product.is_spicy && !product.is_vegan) {
        return null;
    }

    return (
        <span
            className={cn('inline-flex shrink-0 items-center gap-1', className)}
        >
            {product.is_spicy && (
                <Flame
                    aria-label="Spicy"
                    className={cn('text-orange-600', iconClassName)}
                />
            )}
            {product.is_vegan && (
                <Leaf
                    aria-label="Vegan"
                    className={cn('text-primary', iconClassName)}
                />
            )}
        </span>
    );
}
