import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/types';

interface VariantSelectorProps {
    variants: ProductVariant[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

/** Rounded segmented control for choosing a product variant. */
export function VariantSelector({
    variants,
    selectedIndex,
    onSelect,
}: VariantSelectorProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                Choose an option
            </span>

            <div
                role="group"
                aria-label="Choose an option"
                className="flex w-full gap-1 rounded-full border border-primary/20 bg-primary/5 p-1"
            >
                {variants.map((variant, index) => {
                    const selected = index === selectedIndex;

                    return (
                        <button
                            key={index}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onSelect(index)}
                            className={cn(
                                'min-w-0 flex-1 truncate rounded-full px-3 py-1.5 text-xs tracking-wide uppercase transition-colors',
                                selected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-primary/70 hover:bg-primary/10 hover:text-primary',
                            )}
                        >
                            {variant.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
