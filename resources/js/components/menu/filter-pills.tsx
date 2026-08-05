import { LayoutGrid } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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

/**
 * Tracks which horizontal edges of the row still hide content, so whichever
 * side can scroll gets a fade — a "there's more" cue on narrow screens.
 */
function useScrollEdges(deps: unknown): {
    scrollRef: React.RefObject<HTMLDivElement | null>;
    edges: { start: boolean; end: boolean };
} {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ start: false, end: false });

    const updateEdges = useCallback((): void => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        const max = element.scrollWidth - element.clientWidth;

        setEdges({
            start: element.scrollLeft > 1,
            end: element.scrollLeft < max - 1,
        });
    }, []);

    useEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        updateEdges();
        element.addEventListener('scroll', updateEdges, { passive: true });

        const observer = new ResizeObserver(updateEdges);
        observer.observe(element);

        return () => {
            element.removeEventListener('scroll', updateEdges);
            observer.disconnect();
        };
    }, [updateEdges, deps]);

    return { scrollRef, edges };
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
 */
export function FilterPills({
    categories,
    activeId,
    onSelect,
    onClear,
}: FilterPillsProps) {
    const { scrollRef, edges } = useScrollEdges(categories);

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
                ref={scrollRef}
                style={{
                    maskImage: edgeMask(edges),
                    WebkitMaskImage: edgeMask(edges),
                }}
                className="flex min-w-0 flex-1 snap-x snap-mandatory [scrollbar-width:none] gap-2 overflow-x-auto scroll-smooth py-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {categories.map((category) => {
                    const active = category.id === activeId;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => onSelect(category.id)}
                            aria-pressed={active}
                            className={cn(
                                'shrink-0 snap-start rounded-full border px-4 py-2 text-sm tracking-wide whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                active
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-primary/20 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10',
                            )}
                        >
                            {category.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
