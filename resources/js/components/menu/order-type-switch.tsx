import { Link, usePage } from '@inertiajs/react';
import { Bike, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderType } from '@/types';

const options = [
    {
        type: 'dine_in',
        label: 'Dine in',
        href: '/menu/dine-in',
        icon: UtensilsCrossed,
    },
    {
        type: 'delivery',
        label: 'Delivery',
        href: '/menu/delivery',
        icon: Bike,
    },
] as const;

interface OrderTypeSwitchProps {
    current: OrderType;
}

/**
 * Segmented toggle for moving between the dine-in and delivery menus. The two
 * options share an equal-width grid so a single sage pill can slide between
 * them instead of the labels flipping colour in place.
 */
export function OrderTypeSwitch({ current }: OrderTypeSwitchProps) {
    const onlineOrderingActive = usePage().props.onlineOrderingActive;
    const activeIndex = Math.max(
        options.findIndex((option) => option.type === current),
        0,
    );

    return (
        <div className="relative grid shrink-0 grid-cols-2 gap-1 rounded-full border border-primary/20 bg-primary/5 p-1 shadow-[inset_0_1px_2px_rgba(120,137,108,0.12)]">
            {/* The sage pill tracks the active option. Its width matches one
                grid column: half the box minus the padding and half the gap. */}
            <span
                aria-hidden
                style={{
                    transform:
                        activeIndex === 0
                            ? 'translateX(0)'
                            : 'translateX(calc(100% + 0.25rem))',
                }}
                className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-full bg-primary shadow-[0_8px_18px_-10px_rgba(120,137,108,1)] transition-transform duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
            />

            {options.map((option) => {
                const active = current === option.type;
                const Icon = option.icon;
                // Delivery is only reachable while the delivery menu is active.
                const disabled =
                    option.type === 'delivery' && !onlineOrderingActive;

                const className = cn(
                    'relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs tracking-[0.12em] uppercase transition-colors duration-300 sm:px-4',
                    active
                        ? 'text-primary-foreground'
                        : 'text-primary/60 hover:text-primary',
                    disabled &&
                        'cursor-not-allowed text-primary/25 hover:text-primary/25',
                );

                const content = (
                    <>
                        <Icon
                            className={cn(
                                'size-3.5 transition-transform duration-300',
                                active && 'scale-110',
                            )}
                        />
                        <span className="hidden sm:inline">{option.label}</span>
                    </>
                );

                if (disabled) {
                    return (
                        <span
                            key={option.type}
                            aria-disabled="true"
                            title="Delivery is currently unavailable"
                            className={className}
                        >
                            {content}
                        </span>
                    );
                }

                return (
                    <Link
                        key={option.type}
                        href={option.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            className,
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                        )}
                    >
                        {content}
                    </Link>
                );
            })}
        </div>
    );
}
