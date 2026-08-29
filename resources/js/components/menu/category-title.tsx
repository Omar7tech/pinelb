interface CategoryTitleProps {
    title: string;
}

/**
 * The display title for an open category. It runs large on tight leading with
 * the caps lightly tracked.
 */
export function CategoryTitle({ title }: CategoryTitleProps) {
    return (
        <h2 className="mt-3 -mb-1 text-4xl leading-[0.92] font-semibold tracking-[0.015em] text-balance text-primary uppercase sm:text-6xl md:text-7xl">
            {title}
        </h2>
    );
}
