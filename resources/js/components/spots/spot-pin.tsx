import { cn } from '@/lib/utils';

interface SpotPinProps {
    /** Taken spots are drawn in the brick tone, free ones in sage. */
    reserved: boolean;
    /** A landmark — parking, WC, playground — sits outside those two tones. */
    landmark?: boolean;
    /** A colour chosen for this pin, which overrides the tones above. */
    color?: string | null;
    /** Written under the marker, so a spot is read without opening it. */
    name?: string;
    className?: string;
}

/**
 * The map marker: a small shape sitting on the spot's exact position, with the
 * spot's name under it. The shape is the anchor — centre it on the point with
 * `translate(-50%, -50%)` and it lands where the admin editor placed it.
 *
 * A bookable spot is a round dot; a landmark is a diamond, so the two are told
 * apart by shape rather than colour alone — the colour is the admin's to
 * choose, the shape isn't.
 *
 * The name hangs off the shape rather than sitting in its flow, so a long one
 * can't drag the marker off the point.
 */
export function SpotPin({
    reserved,
    landmark = false,
    color,
    name,
    className,
}: SpotPinProps) {
    return (
        <span className={cn('relative block size-3', className)}>
            <span
                style={color ? { backgroundColor: color } : undefined}
                className={cn(
                    'absolute inset-0 shadow-[0_2px_5px_rgba(15,23,42,0.45)] ring-2 ring-background',
                    landmark ? 'rotate-45 rounded-[2px]' : 'rounded-full',
                    // The chosen colour is carried by the inline style, so the
                    // state tone is only asked for when there isn't one.
                    !color &&
                        (landmark
                            ? 'bg-slate-500'
                            : reserved
                              ? 'bg-brick'
                              : 'bg-primary'),
                )}
            />

            {name && (
                <span className="pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 rounded-full bg-background/85 px-1.5 py-0.5 text-[0.625rem] leading-none font-medium whitespace-nowrap text-foreground shadow-sm">
                    {name}
                </span>
            )}
        </span>
    );
}
