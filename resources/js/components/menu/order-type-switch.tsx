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

/** Segmented toggle for moving between the dine-in and delivery menus. */
export function OrderTypeSwitch({ current }: OrderTypeSwitchProps) {
    const onlineOrderingActive = usePage().props.onlineOrderingActive;

    return (
        <div className="inline-flex shrink-0 gap-1 rounded-full border border-primary/20 bg-primary/5 p-1">
            {options.map((option) => {
                const active = current === option.type;
                const Icon = option.icon;
                // Delivery is only reachable while the delivery menu is active.
                const disabled =
                    option.type === 'delivery' && !onlineOrderingActive;

                const className = cn(
                    'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs tracking-wide uppercase transition-colors sm:px-4',
                    active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-primary/70 hover:bg-primary/10 hover:text-primary',
                    disabled &&
                        'cursor-not-allowed text-primary/30 hover:bg-transparent hover:text-primary/30',
                );

                if (disabled) {
                    return (
                        <span
                            key={option.type}
                            aria-disabled="true"
                            title="Delivery is currently unavailable"
                            className={className}
                        >
                            <Icon className="size-3.5" />
                            <span className="hidden sm:inline">
                                {option.label}
                            </span>
                        </span>
                    );
                }

                return (
                    <Link
                        key={option.type}
                        href={option.href}
                        aria-current={active ? 'page' : undefined}
                        className={className}
                    >
                        <Icon className="size-3.5" />
                        <span className="hidden sm:inline">{option.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
