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
                // Smaller on a phone, where the plan is small and the names sit
                // close enough to crowd each other.
                'pointer-events-none absolute rounded-full bg-background/85 px-1 py-0.5 text-[0.5rem] leading-none font-medium whitespace-nowrap text-foreground shadow-sm sm:px-1.5 sm:text-[0.625rem]',
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
 * A bookable spot is a small ring with a dot in its middle, and a landmark a
 * small diamond, so the two are told apart by shape rather than colour alone,
 * since the colour is the admin's to choose. Both sit centred on their point —
 * anchor either with `translate(-50%, -50%)`.
 */
export function SpotPin({
    reserved,
    landmark = false,
    color,
    name,
    align = 'center',
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
        // Smaller on a phone, where the plan itself is small and the markers
        // crowd each other. `SpotMapView` matches these sizes when it keeps a
        // pin off an edge.
        <span className={cn('relative block size-3 sm:size-3.5', className)}>
            {/* The ring is filled with the page tone rather than left open, so
                the dot inside it reads over a busy plan. The chosen colour is
                carried by the inline style, which is why the state tone is only
                asked for when there isn't one. */}
            <span
                style={color ? { borderColor: color } : undefined}
                className={cn(
                    'absolute inset-0 rounded-full border-2 bg-background shadow-[0_1px_4px_rgba(15,23,42,0.45)]',
                    !color && (reserved ? 'border-brick' : 'border-primary'),
                )}
            />

            <span
                style={color ? { backgroundColor: color } : undefined}
                className={cn(
                    'absolute inset-[4px] rounded-full',
                    !color && (reserved ? 'bg-brick' : 'bg-primary'),
                )}
            />

            {name && <PinLabel name={name} align={align} above={labelAbove} />}
        </span>
    );
}
