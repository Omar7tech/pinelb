import { cn } from '@/lib/utils';

interface SpotPinProps {
    /** Taken spots are drawn in the brick tone, free ones in sage. */
    reserved: boolean;
    /** A colour chosen for this pin, which overrides the two tones above. */
    color?: string | null;
    /** Written under the dot, so a spot is read without opening it. */
    name?: string;
    className?: string;
}

/**
 * The map marker: a small dot sitting on the spot's exact position, with the
 * spot's name under it. The dot is the anchor — centre it on the point with
 * `translate(-50%, -50%)` and it lands where the admin editor placed it.
 *
 * The name hangs off the dot rather than sitting in its flow, so a long one
 * can't drag the dot off the point.
 */
export function SpotPin({ reserved, color, name, className }: SpotPinProps) {
    return (
        <span
            style={color ? { backgroundColor: color } : undefined}
            className={cn(
                'relative block size-3 rounded-full ring-2 shadow-[0_2px_5px_rgba(15,23,42,0.45)] ring-background',
                // The chosen colour is carried by the inline style, so the
                // state tone is only asked for when there isn't one.
                !color && (reserved ? 'bg-brick' : 'bg-primary'),
                className,
            )}
        >
            {name && (
                <span className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-full bg-background/85 px-1.5 py-0.5 text-[0.625rem] leading-none font-medium whitespace-nowrap text-foreground shadow-sm">
                    {name}
                </span>
            )}
        </span>
    );
}
