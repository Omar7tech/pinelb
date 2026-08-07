import useEmblaCarousel from 'embla-carousel-react';
import { LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface FilterPillsProps {
    categories: Category[];
    /** The selected category id. */
    activeId: number;
    onSelect: (id: number) => void;
    /** Returns to the category boxes. */
    onClear: () => void;
}

/** The CSS mask that fades whichever edges of the row are still scrollable. */
function edgeMask(edges: { start: boolean; end: boolean }): string | undefined {
    const fade = '2rem';

    if (edges.start && edges.end) {
        return `linear-gradient(to right, transparent, #000 ${fade}, #000 calc(100% - ${fade}), transparent)`;
    }

    if (edges.end) {
        return `linear-gradient(to right, #000 calc(100% - ${fade}), transparent)`;
    }

    if (edges.start) {
        return `linear-gradient(to right, transparent, #000 ${fade})`;
    }

    return undefined;
}

/**
 * The category filter row shown once a category is open: an "all categories"
 * pill that returns to the boxes, then one pill per category. Selecting a pill
 * swaps the products client-side.
 *
 * The row is an Embla carousel in free-drag mode, so it can be dragged with a
 * mouse as well as a finger. Whichever edge still hides pills gets a fade — a
 * "there's more" cue on narrow screens.
 */
export function FilterPills({
    categories,
    activeId,
    onSelect,
    onClear,
}: FilterPillsProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        dragFree: true,
        align: 'start',
        containScroll: 'trimSnaps',
    });

    const [edges, setEdges] = useState({ start: false, end: false });

    // Mirror how far the row can still travel into the edge fades.
    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const sync = (): void => {
            setEdges({
                start: emblaApi.canScrollPrev(),
                end: emblaApi.canScrollNext(),
            });
        };

        emblaApi.on('scroll', sync);
        emblaApi.on('settle', sync);
        emblaApi.on('reInit', sync);
        // Embla is imperative; read its initial position once on mount.
        sync();

        return () => {
            emblaApi.off('scroll', sync);
            emblaApi.off('settle', sync);
            emblaApi.off('reInit', sync);
        };
    }, [emblaApi, categories]);

    /** Bring a pill into view when it's off-screen, e.g. once it's selected. */
    const revealPill = (index: number): void => {
        if (!emblaApi || emblaApi.slidesInView().includes(index)) {
            return;
        }

        emblaApi.scrollTo(index);
    };

    // Follow the selection, which can also be changed from the footer links.
    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const index = categories.findIndex(
            (category) => category.id === activeId,
        );

        if (index === -1 || emblaApi.slidesInView().includes(index)) {
            return;
        }

        emblaApi.scrollTo(index);
    }, [emblaApi, categories, activeId]);

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onClear}
                aria-label="Back to all categories"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
                <LayoutGrid className="size-4" />
            </button>

            <div
                ref={emblaRef}
                style={{
                    maskImage: edgeMask(edges),
                    WebkitMaskImage: edgeMask(edges),
                }}
                className="min-w-0 flex-1 overflow-hidden py-1 select-none"
            >
                <div className="-ml-2 flex">
                    {categories.map((category, index) => {
                        const active = category.id === activeId;

                        return (
                            <div key={category.id} className="shrink-0 pl-2">
                                <button
                                    type="button"
                                    onClick={() => onSelect(category.id)}
                                    // Tabbing to a clipped pill would scroll the
                                    // viewport out from under Embla, so move the
                                    // row itself instead.
                                    onFocus={() => revealPill(index)}
                                    aria-pressed={active}
                                    className={cn(
                                        'cursor-pointer rounded-full border px-4 py-2 text-sm tracking-wide whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                        active
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-primary/20 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10',
                                    )}
                                >
                                    {category.title}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
