interface CategoryTitleProps {
    title: string;
}

/**
 * The display title for an open category. Cormorant is a high-contrast serif,
 * so the title runs large on tight leading with the caps lightly tracked, and
 * the initial is set in italic at a larger size as a swash.
 */
export function CategoryTitle({ title }: CategoryTitleProps) {
    const [initial = '', ...rest] = Array.from(title);

    return (
        <h2 className="mt-3 -mb-1 font-heading text-5xl leading-[0.92] font-semibold tracking-[0.015em] text-balance text-primary uppercase sm:text-6xl md:text-7xl">
            <span className="pr-[0.02em] text-[1.28em] leading-[0] font-normal italic">
                {initial}
            </span>
            {rest.join('')}
        </h2>
    );
}
