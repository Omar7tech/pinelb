import { LayoutGrid, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

/** How the reservation page is laying the spots out. */
export type SpotViewMode = 'cards' | 'map';

interface SpotViewSwitchProps {
    value: SpotViewMode;
    onChange: (value: SpotViewMode) => void;
}

// The map leads, since it's the view the page opens on.
const OPTIONS = [
    { value: 'map', label: 'Map', icon: Map },
    { value: 'cards', label: 'Cards', icon: LayoutGrid },
] as const satisfies readonly {
    value: SpotViewMode;
    label: string;
    icon: typeof Map;
}[];

/**
 * Switches the reservation page between the spot cards and the floor map. Only
 * rendered when a map has been uploaded and switched on, so the page falls back
 * to cards alone without leaving a dead control behind.
 */
export function SpotViewSwitch({ value, onChange }: SpotViewSwitchProps) {
    return (
        <div
            role="group"
            aria-label="Switch between the map and the cards"
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 p-1"
        >
            {OPTIONS.map((option) => {
                const active = option.value === value;
                const Icon = option.icon;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        aria-pressed={active}
                        className={cn(
                            // Sized to match `SpotFilter`, which sits beside it
                            // on a wide screen and above it on a phone.
                            'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs tracking-wide whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
                            active
                                ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(120,137,108,0.9)]'
                                : 'text-primary/70 hover:bg-primary/10 hover:text-primary',
                        )}
                    >
                        <Icon
                            aria-hidden
                            className="size-3.5 shrink-0 sm:size-4"
                        />
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
