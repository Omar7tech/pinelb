import { ArrowUpRight } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import type { Category } from '@/types';

interface CategoryCardProps {
    category: Category;
    onSelect: (category: Category) => void;
}

/**
 * A single category box: the category image above its name on a sage panel.
 * Hovering only lifts the box — the colours stay put.
 */
export function CategoryCard({ category, onSelect }: CategoryCardProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(category)}
            className="group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.5rem] border border-primary bg-primary p-3 text-primary-foreground transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
            <ArrowUpRight className="absolute top-3 right-3 size-4 text-primary-foreground/50" />

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
                <span className="aspect-square w-3/5 max-w-32 rounded-xl bg-primary-foreground/10" />
            )}

            <span className="line-clamp-2 text-center font-heading text-lg leading-tight font-semibold tracking-normal uppercase sm:text-xl">
                {category.title}
            </span>
        </button>
    );
}
