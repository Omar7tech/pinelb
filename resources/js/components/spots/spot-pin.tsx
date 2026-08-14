import { cn } from '@/lib/utils';

/**
 * Which way the name grows from the marker. A pin against the left or right
 * edge of the plan hangs its name inwards, so a long one isn't cut off.
 */
export type PinAlign = 'start' | 'center' | 'end';

interface SpotPinProps {
    /** Taken spots are drawn in the brick tone, free ones in sage. */
    reserved: boolean;
    /** A landmark — parking, WC, playground — sits outside those two tones. */
    landmark?: boolean;
    /** A colour chosen for this pin, which overrides the tones above. */
    color?: string | null;
    /** Written under the marker, so a spot is read without opening it. */
    name?: string;
    /** Defaults to a name centred under the marker. */
    align?: PinAlign;
    /** A teardrop that stands on its point, for a spot near the top edge. */
    flipped?: boolean;
    /** The name goes over the marker, for a spot near the bottom edge. */
    labelAbove?: boolean;
    className?: string;
}

const LABEL_ANCHOR: Record<PinAlign, string> = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
};

/** The name, hung off the marker so a long one can't shift its anchor. */
function PinLabel({
    name,
    align,
    above,
}: {
    name: string;
    align: PinAlign;
    above: boolean;
}) {
    return (
        <span
            className={cn(
                'pointer-events-none absolute rounded-full bg-background/85 px-1.5 py-0.5 text-[0.625rem] leading-none font-medium whitespace-nowrap text-foreground shadow-sm',
                above ? 'bottom-full mb-1' : 'top-full mt-1',
                LABEL_ANCHOR[align],
            )}
        >
            {name}
        </span>
    );
}

/**
 * The map marker, with the spot's name under it.
 *
 * A bookable spot is a teardrop hanging by its tip from the point — anchor it
 * with `translate(-50%, -100%)`. A landmark is a small diamond centred on the
 * point instead — `translate(-50%, -50%)` — so the two are told apart by shape
 * rather than colour alone, since the colour is the admin's to choose.
 *
 * A `flipped` teardrop stands on its point rather than hanging from it, for a
 * spot so near the top of the plan that the frame would cut its body off;
 * anchor that one with `translate(-50%, 0)`.
 */
export function SpotPin({
    reserved,
    landmark = false,
    color,
    name,
    align = 'center',
    flipped = false,
    labelAbove = false,
    className,
}: SpotPinProps) {
    if (landmark) {
        return (
            <span className={cn('relative block size-3', className)}>
                <span
                    style={color ? { backgroundColor: color } : undefined}
                    className={cn(
                        'absolute inset-0 rotate-45 rounded-[2px] shadow-[0_2px_5px_rgba(15,23,42,0.45)] ring-2 ring-background',
                        !color && 'bg-slate-500',
                    )}
                />

                {name && (
                    <PinLabel name={name} align={align} above={labelAbove} />
                )}
            </span>
        );
    }

    return (
        <span className={cn('relative block', className)}>
            <svg
                viewBox="0 0 24 34"
                aria-hidden
                style={color ? { color } : undefined}
                className={cn(
                    // Smaller on a phone, where the plan itself is small and a
                    // full-size teardrop crowds its neighbours. `SpotMapView`
                    // matches these sizes when it keeps a pin off an edge.
                    'block h-7 w-auto drop-shadow-[0_4px_6px_rgba(15,23,42,0.45)] sm:h-9',
                    // The chosen colour is carried by the inline style, so the
                    // state tone is only asked for when there isn't one.
                    !color && (reserved ? 'text-brick' : 'text-primary'),
                    flipped && 'rotate-180',
                )}
            >
                <path
                    d="M12 0.75C6.063 0.75 1.25 5.563 1.25 11.5c0 7.5 10.75 21.75 10.75 21.75S22.75 19 22.75 11.5C22.75 5.563 17.937 0.75 12 0.75Z"
                    fill="currentColor"
                    stroke="var(--color-background)"
                    strokeWidth="1.5"
                />
                <circle
                    cx="12"
                    cy="11.5"
                    r="4"
                    fill="var(--color-background)"
                />
            </svg>

            {name && <PinLabel name={name} align={align} above={labelAbove} />}
        </span>
    );
}
