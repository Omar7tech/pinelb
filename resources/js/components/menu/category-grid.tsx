import { CategoryCard } from '@/components/menu/category-card';
import type { Category } from '@/types';

interface CategoryGridProps {
    categories: Category[];
    onSelect: (category: Category) => void;
}

/**
 * The menu's landing view: a responsive grid of category boxes. Choosing one
 * swaps the page over to that category's products, client-side.
 */
export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
    if (categories.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-muted-foreground">
                The menu is being prepared. Please check back soon.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category) => (
                <CategoryCard
                    key={category.id}
                    category={category}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
