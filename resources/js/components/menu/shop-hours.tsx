import { formatTime, useShop, useShopOpen, weeklyHours } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * The weekly opening hours for the footer, shown only while the shop runs on
 * the automatic schedule. Consecutive days with the same hours are merged into
 * ranges and today's row is highlighted, next to a live open/closed marker.
 */
export function ShopHours() {
    const shop = useShop();
    const open = useShopOpen();

    if (shop.statusMode !== 'automatic') {
        return null;
    }

    const rows = weeklyHours(shop);

    if (rows.length === 0) {
        return null;
    }

    return (
        <section aria-labelledby="hours-heading">
            <h2
                id="hours-heading"
                className="mb-3 flex items-center gap-2 text-[10px] tracking-[0.22em] text-primary/50 uppercase"
            >
                Hours
                <span className="flex items-center gap-1.5 text-foreground/70">
                    <span
                        aria-hidden
                        className={cn(
                            'size-1.5 rounded-full',
                            open ? 'bg-primary' : 'bg-destructive',
                        )}
                    />
                    {open ? 'Open now' : 'Closed'}
                </span>
            </h2>

            <ul className="flex flex-col gap-1.5">
                {rows.map((row) => (
                    <li
                        key={row.label}
                        className={cn(
                            'flex items-baseline justify-between gap-8 text-sm tracking-wide uppercase',
                            row.isToday ? 'text-primary' : 'text-foreground/70',
                        )}
                    >
                        <span>{row.label}</span>
                        {row.isClosed ? (
                            <span className="text-foreground/45">Closed</span>
                        ) : (
                            <span className="tabular-nums">
                                {formatTime(row.opensAt)} –{' '}
                                {formatTime(row.closesAt)}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
