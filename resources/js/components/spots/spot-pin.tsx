import { cn } from '@/lib/utils';

interface SpotPinProps {
    /** Taken spots are drawn in the brick tone, free ones in sage. */
    reserved: boolean;
    /** A colour chosen for this pin, which overrides the two tones above. */
    color?: string | null;
    className?: string;
}

/**
 * The map marker: a teardrop whose tip is the spot's exact position, so the
 * same coordinates land in the same place in the admin editor and here. Drawn
 * on a 24×34 canvas with the tip at (12, 34) — anchor it with `translate(-50%,
 * -100%)` and the tip sits on the point.
 */
export function SpotPin({ reserved, color, className }: SpotPinProps) {
    return (
        <svg
            viewBox="0 0 24 34"
            aria-hidden
            style={color ? { color } : undefined}
            className={cn(
                'h-9 w-auto drop-shadow-[0_4px_6px_rgba(15,23,42,0.45)]',
                // The chosen colour is carried by the inline style, so the
                // state tone is only asked for when there isn't one.
                !color && (reserved ? 'text-brick' : 'text-primary'),
                className,
            )}
        >
            <path
                d="M12 0.75C6.063 0.75 1.25 5.563 1.25 11.5c0 7.5 10.75 21.75 10.75 21.75S22.75 19 22.75 11.5C22.75 5.563 17.937 0.75 12 0.75Z"
                fill="currentColor"
                stroke="var(--color-background)"
                strokeWidth="1.5"
            />
            <circle cx="12" cy="11.5" r="4" fill="var(--color-background)" />
        </svg>
    );
}
