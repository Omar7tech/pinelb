import { ArrowUpRight } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import type { Category } from '@/types';

interface CategoryCardProps {
    category: Category;
    onSelect: (category: Category) => void;
}

/**
 * A single category box: the category image above its name on a soft sage
 * panel. Hovering lifts the box and fills it with sage, inverting the label.
 */
export function CategoryCard({ category, onSelect }: CategoryCardProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(category)}
            className="group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.5rem] border border-primary/20 bg-primary/5 p-3 text-primary transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary hover:shadow-[0_18px_32px_-20px_rgba(120,137,108,0.85)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
            {/* Sage panel wipes up from the baseline on hover. */}
            <span
                aria-hidden
                className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-primary transition-transform duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-y-100 motion-reduce:transition-none"
            />

            <ArrowUpRight className="absolute top-3 right-3 size-4 text-primary/30 transition-colors duration-300 group-hover:text-primary-foreground/60" />

            {category.image ? (
                /* Category art is cut out on a transparent background, so the
                   image sits whole inside its box rather than being cropped to
                   a circle. */
                <SmartImage
                    src={category.image}
                    alt={category.title}
                    className="aspect-square w-3/5 max-w-32"
                    imgClassName="object-contain transition-transform duration-300 group-hover:scale-105"
                    draggable={false}
                />
            ) : (
                <span className="aspect-square w-3/5 max-w-32 rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary-foreground/15" />
            )}

            <span className="line-clamp-2 text-center font-heading text-lg leading-tight font-semibold tracking-normal uppercase transition-colors duration-300 group-hover:text-primary-foreground sm:text-xl">
                {category.title}
            </span>
        </button>
    );
}
