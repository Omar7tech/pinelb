import { cn } from '@/lib/utils';

/**
 * Decorative pine treeline for the foot of the page. Two rows of tiered pines,
 * drawn in the same flat silhouette language as the logo's mark.
 *
 * The rows are SVG patterns rather than one long drawing, so the band fills any
 * viewport width without stretching the trees. Their tile widths are coprime, so
 * the two rows only line up again after ~130k pixels — the repeat never reads.
 */

const BAND_HEIGHT = 160;

/**
 * One pine: a trunk under three overlapping tiers, widest at the bottom.
 * `x` is the centre line, `height` the full reach above the baseline, and
 * `halfWidth` half the span of the lowest tier.
 */
function pine(x: number, height: number, halfWidth: number): string {
    const base = BAND_HEIGHT;
    const trunk = Math.max(1.5, halfWidth * 0.13);

    const tier = (bottom: number, apex: number, spread: number): string =>
        `M${x - halfWidth * spread},${base - height * bottom}` +
        `L${x},${base - height * apex}` +
        `L${x + halfWidth * spread},${base - height * bottom}Z`;

    return (
        `M${x - trunk},${base}L${x - trunk},${base - height * 0.24}` +
        `L${x + trunk},${base - height * 0.24}L${x + trunk},${base}Z` +
        tier(0.15, 0.52, 1) +
        tier(0.42, 0.78, 0.76) +
        tier(0.66, 1, 0.5)
    );
}

/** Tile of the row nearest the viewer: taller, fully opaque. */
const FRONT_TILE_WIDTH = 421;
const FRONT_TREES: ReadonlyArray<readonly [x: number, h: number, w: number]> = [
    [34, 118, 26],
    [92, 82, 19],
    [148, 140, 31],
    [214, 96, 22],
    [268, 126, 28],
    [330, 74, 17],
    [386, 108, 24],
];

/** Tile of the row behind: shorter and paler, to suggest depth. */
const BACK_TILE_WIDTH = 337;
const BACK_TREES: ReadonlyArray<readonly [x: number, h: number, w: number]> = [
    [26, 74, 17],
    [78, 96, 21],
    [136, 62, 14],
    [188, 86, 19],
    [244, 68, 15],
    [300, 90, 20],
];

export function Treeline({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden
            width="100%"
            height={BAND_HEIGHT}
            fill="currentColor"
            className={cn('block w-full text-primary', className)}
        >
            <defs>
                <pattern
                    id="treeline-back"
                    patternUnits="userSpaceOnUse"
                    width={BACK_TILE_WIDTH}
                    height={BAND_HEIGHT}
                >
                    <path
                        d={BACK_TREES.map(([x, h, w]) => pine(x, h, w)).join(
                            '',
                        )}
                        opacity="0.45"
                    />
                </pattern>
                <pattern
                    id="treeline-front"
                    patternUnits="userSpaceOnUse"
                    width={FRONT_TILE_WIDTH}
                    height={BAND_HEIGHT}
                >
                    <path
                        d={FRONT_TREES.map(([x, h, w]) => pine(x, h, w)).join(
                            '',
                        )}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#treeline-back)" />
            <rect width="100%" height="100%" fill="url(#treeline-front)" />
        </svg>
    );
}
