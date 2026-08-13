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

/** The name, hung under the marker so a long one can't shift its anchor. */
function PinLabel({ name }: { name: string }) {
    return (
        <span className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-full bg-background/85 px-1.5 py-0.5 text-[0.625rem] leading-none font-medium whitespace-nowrap text-foreground shadow-sm">
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
 */
export function SpotPin({
    reserved,
    landmark = false,
    color,
    name,
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

                {name && <PinLabel name={name} />}
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
                    'block h-9 w-auto drop-shadow-[0_4px_6px_rgba(15,23,42,0.45)]',
                    // The chosen colour is carried by the inline style, so the
                    // state tone is only asked for when there isn't one.
                    !color && (reserved ? 'text-brick' : 'text-primary'),
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

            {name && <PinLabel name={name} />}
        </span>
    );
}
