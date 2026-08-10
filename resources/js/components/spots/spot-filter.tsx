import { CalendarCheck, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Which slice of the list the page is showing. */
export type SpotFilterValue = 'available' | 'reserved';

interface SpotFilterProps {
    value: SpotFilterValue;
    onChange: (value: SpotFilterValue) => void;
    /** How many spots fall under each slice, shown on its segment. */
    counts: Record<SpotFilterValue, number>;
}

const OPTIONS = [
    { value: 'available', label: 'Available', icon: CalendarCheck },
    { value: 'reserved', label: 'Reserved', icon: Lock },
] as const satisfies readonly {
    value: SpotFilterValue;
    label: string;
    icon: typeof Lock;
}[];

/**
 * The availability switch above the spot grid: a two-segment control, each side
 * carrying its own count so the number of free spots reads at a glance. An
 * empty side is disabled rather than hidden, keeping the control the same size
 * whatever the night looks like.
 */
export function SpotFilter({ value, onChange, counts }: SpotFilterProps) {
    return (
        <div
            role="group"
            aria-label="Filter spots by availability"
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 p-1"
        >
            {OPTIONS.map((option) => {
                const active = option.value === value;
                const count = counts[option.value];
                const Icon = option.icon;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        disabled={count === 0 && !active}
                        aria-pressed={active}
                        className={cn(
                            'inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm tracking-wide whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40',
                            active
                                ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(120,137,108,0.9)]'
                                : 'text-primary/70 hover:bg-primary/10 hover:text-primary',
                        )}
                    >
                        <Icon aria-hidden className="size-4" />
                        {option.label}
                        <span
                            className={cn(
                                'inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                                active
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'bg-primary/10 text-primary/80',
                            )}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
