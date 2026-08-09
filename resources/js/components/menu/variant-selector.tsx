import { Check } from 'lucide-react';
import { useId, useRef } from 'react';
import { usePricing } from '@/hooks/use-pricing';
import { cn, isArabic } from '@/lib/utils';
import type { ProductVariant } from '@/types';

interface VariantSelectorProps {
    variants: ProductVariant[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

/** Arrow keys that move the selection forward through the option list. */
const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
/** Arrow keys that move the selection backward through the option list. */
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];

/**
 * Variant picker rendered as a wrapping list of option cards. Unlike a
 * segmented control the options never share one row's width, so a long variant
 * name is shown in full instead of being truncated, and each option can carry
 * its own price — the difference between sizes is visible before choosing.
 *
 * The group behaves as a radio group: one tab stop, arrow keys move between
 * options, Home/End jump to the ends.
 */
export function VariantSelector({
    variants,
    selectedIndex,
    onSelect,
}: VariantSelectorProps) {
    const pricing = usePricing();
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    // Every product card renders its own selector, so the label id must be
    // unique per instance.
    const labelId = useId();

    /** Selects an option and keeps the roving focus on it. */
    const move = (index: number): void => {
        const wrapped = (index + variants.length) % variants.length;

        onSelect(wrapped);
        optionRefs.current[wrapped]?.focus();
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
    ): void => {
        if (NEXT_KEYS.includes(event.key)) {
            event.preventDefault();
            move(selectedIndex + 1);

            return;
        }

        if (PREVIOUS_KEYS.includes(event.key)) {
            event.preventDefault();
            move(selectedIndex - 1);

            return;
        }

        if (event.key === 'Home') {
            event.preventDefault();
            move(0);

            return;
        }

        if (event.key === 'End') {
            event.preventDefault();
            move(variants.length - 1);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <span
                id={labelId}
                className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase"
            >
                Choose an option
            </span>

            <div
                role="radiogroup"
                aria-labelledby={labelId}
                onKeyDown={handleKeyDown}
                className="flex flex-wrap gap-2"
            >
                {variants.map((variant, index) => {
                    const selected = index === selectedIndex;
                    const rtl = isArabic(variant.name);
                    const discountPrice = variant.discount_price;
                    const effectivePrice = discountPrice ?? variant.price;

                    return (
                        <button
                            key={index}
                            ref={(element) => {
                                optionRefs.current[index] = element;
                            }}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            // Only the selected option stays in the tab order;
                            // arrow keys reach the rest.
                            tabIndex={selected ? 0 : -1}
                            onClick={() => onSelect(index)}
                            className={cn(
                                'flex min-w-[8rem] flex-1 basis-[calc(50%-0.25rem)] cursor-pointer items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                selected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-primary/15 bg-primary/[0.03] hover:border-primary/35 hover:bg-primary/[0.08]',
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    'grid size-4 shrink-0 place-items-center rounded-full border transition-colors',
                                    selected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-primary/30',
                                )}
                            >
                                {selected && (
                                    <Check
                                        className="size-2.5"
                                        strokeWidth={3}
                                    />
                                )}
                            </span>

                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span
                                    dir={rtl ? 'rtl' : undefined}
                                    className={cn(
                                        'text-xs leading-snug tracking-wide text-balance break-words uppercase',
                                        selected
                                            ? 'font-semibold text-primary'
                                            : 'text-primary/70',
                                        rtl && 'text-right',
                                    )}
                                >
                                    {variant.name}
                                </span>

                                <span className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-none">
                                    <span
                                        className={cn(
                                            'font-semibold',
                                            selected
                                                ? 'text-primary'
                                                : 'text-primary/60',
                                        )}
                                    >
                                        {pricing.primary(effectivePrice)}
                                    </span>
                                    {discountPrice !== null && (
                                        <span className="text-[10px] text-muted-foreground line-through">
                                            {pricing.primary(variant.price)}
                                        </span>
                                    )}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
