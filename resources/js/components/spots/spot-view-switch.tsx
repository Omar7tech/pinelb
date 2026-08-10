import { LayoutGrid, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

/** How the reservation page is laying the spots out. */
export type SpotViewMode = 'cards' | 'map';

interface SpotViewSwitchProps {
    value: SpotViewMode;
    onChange: (value: SpotViewMode) => void;
}

const OPTIONS = [
    { value: 'cards', label: 'Cards', icon: LayoutGrid },
    { value: 'map', label: 'Map', icon: Map },
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
            aria-label="Switch between cards and the map"
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
                            'inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm tracking-wide whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            active
                                ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(120,137,108,0.9)]'
                                : 'text-primary/70 hover:bg-primary/10 hover:text-primary',
                        )}
                    >
                        <Icon aria-hidden className="size-4" />
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
