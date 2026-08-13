import { usePage } from '@inertiajs/react';
import { ShopHours } from '@/components/menu/shop-hours';
import { Treeline } from '@/components/treeline';
import type { Category } from '@/types';

interface SiteFooterProps {
    categories: Category[];
    /** Jump to a category in the menu above (the same filter the pills use). */
    onSelectCategory?: (id: number) => void;
}

/**
 * Closing strip for the menu: a category quick-jump, the social links, and the
 * treeline that also anchors the landing page.
 */
export function SiteFooter({ categories, onSelectCategory }: SiteFooterProps) {
    const socials = usePage().props.socials;

    return (
        <footer className="mt-16">
            <div className="mx-auto max-w-7xl px-4 pb-10 md:px-10">
                <div className="flex flex-col gap-8 border-t border-primary/10 pt-8 md:flex-row md:justify-between">
                    {categories.length > 0 && (
                        <nav>
                            <h2 className="mb-3 text-[10px] tracking-[0.22em] text-primary/50 uppercase">
                                Categories
                            </h2>
                            <ul className="grid grid-cols-2 gap-x-10 gap-y-1.5">
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSelectCategory?.(category.id)
                                            }
                                            className="text-sm tracking-wide text-foreground/70 uppercase transition-colors hover:text-primary"
                                        >
                                            {category.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    <ShopHours />

                    {socials.length > 0 && (
                        <nav>
                            <h2 className="mb-3 text-[10px] tracking-[0.22em] text-primary/50 uppercase">
                                Follow
                            </h2>
                            <ul className="flex items-center gap-5">
                                {socials.map((social) => (
                                    <li key={social.platform}>
                                        <a
                                            href={social.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={social.label}
                                            title={social.label}
                                            className="block rounded-sm transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                                        >
                                            <img
                                                src={social.icon}
                                                alt=""
                                                className="size-8"
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </div>

                <p className="mt-8 text-center text-[10px] tracking-[0.22em] text-primary/40 uppercase">
                    © {new Date().getFullYear()} Pine
                </p>
            </div>

            <Treeline />
        </footer>
    );
}
