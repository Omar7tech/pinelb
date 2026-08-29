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
 *
 * On a phone the control takes the full row and its two segments split it
 * evenly, so the labels can't run off the side of the screen; from `sm` up it
 * shrinks back to its own width.
 */
export function SpotFilter({ value, onChange, counts }: SpotFilterProps) {
    return (
        <div
            role="group"
            aria-label="Filter spots by availability"
            className="flex w-full items-center gap-1 rounded-full border border-primary/20 bg-primary/5 p-1 sm:inline-flex sm:w-auto"
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
                            'inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs tracking-wide whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
                            active
                                ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(120,137,108,0.9)]'
                                : 'text-primary/70 hover:bg-primary/10 hover:text-primary',
                        )}
                    >
                        <Icon
                            aria-hidden
                            className="size-3.5 shrink-0 sm:size-4"
                        />
                        <span className="truncate">{option.label}</span>
                        <span
                            className={cn(
                                'inline-flex min-w-5 shrink-0 justify-center rounded-full px-1 py-0.5 text-[0.625rem] tabular-nums sm:min-w-6 sm:px-1.5 sm:text-xs',
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
