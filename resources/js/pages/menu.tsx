import { useEffect, useMemo, useState } from 'react';
import { CartSheet } from '@/components/menu/cart-sheet';
import { CartToast } from '@/components/menu/cart-toast';
import { CategoryGrid } from '@/components/menu/category-grid';
import { CategoryTitle } from '@/components/menu/category-title';
import { FilterPills } from '@/components/menu/filter-pills';
import { MenuSlider } from '@/components/menu/menu-slider';
import { OrderTypeSwitch } from '@/components/menu/order-type-switch';
import { ProductCard } from '@/components/menu/product-card';
import { ShopClosedNotice } from '@/components/menu/shop-closed-notice';
import { SiteBanner } from '@/components/menu/site-banner';
import { SiteFooter } from '@/components/menu/site-footer';
import { SiteHeader } from '@/components/menu/site-header';
import { WhatsAppFab } from '@/components/menu/whatsapp-fab';
import { PageHead } from '@/components/page-head';
import { CartProvider } from '@/contexts/cart-context';
import type { Category, OrderType, Slide } from '@/types';

interface MenuProps {
    orderType: OrderType;
    orderTypeLabel: string;
    categories: Category[];
    slides: Slide[];
}

/** The category whose slug is in `?category=`, or null for the boxes view. */
function readCategoryFromUrl(categories: Category[]): number | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const slug = new URLSearchParams(window.location.search).get('category');

    if (slug === null) {
        return null;
    }

    return categories.find((category) => category.slug === slug)?.id ?? null;
}

export default function Menu({
    orderType,
    orderTypeLabel,
    categories,
    slides,
}: MenuProps) {
    // Null shows the category boxes; a category id shows that category's items.
    const [activeId, setActiveId] = useState<number | null>(() =>
        readCategoryFromUrl(categories),
    );

    // Mirror the open category into the URL so the view survives a refresh and
    // can be shared, without a server round-trip.
    useEffect(() => {
        const url = new URL(window.location.href);
        const slug =
            activeId === null
                ? null
                : (categories.find((category) => category.id === activeId)
                      ?.slug ?? null);

        if (slug === null) {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', slug);
        }

        window.history.replaceState(window.history.state, '', url);
    }, [activeId, categories]);

    const activeCategory = useMemo(
        () => categories.find((category) => category.id === activeId) ?? null,
        [activeId, categories],
    );

    const products = activeCategory?.products ?? [];

    const selectCategory = (id: number): void => {
        setActiveId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Ordering only exists on the delivery menu; dine-in stays read-only.
    const cartEnabled = orderType === 'delivery';

    return (
        <CartProvider>
            <PageHead />

            <div className="flex min-h-svh flex-col">
                <SiteBanner />
                <SiteHeader showCart={cartEnabled} />
                <ShopClosedNotice />

                <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-10">
                    <MenuSlider slides={slides} enableCart={cartEnabled} />

                    <header className="flex items-end justify-between gap-3 border-b border-primary/15 pb-4">
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="flex items-center gap-2 text-[10px] tracking-[0.28em] text-primary/45 uppercase">
                                <span
                                    aria-hidden
                                    className="h-px w-5 bg-primary/30"
                                />
                                Our menu
                            </span>

                            <h1 className="min-w-0 truncate text-4xl leading-none font-semibold tracking-normal text-primary uppercase md:text-5xl">
                                {orderTypeLabel}
                            </h1>
                        </div>

                        <OrderTypeSwitch current={orderType} />
                    </header>

                    {activeCategory === null ? (
                        <CategoryGrid
                            categories={categories}
                            onSelect={(category) => setActiveId(category.id)}
                        />
                    ) : (
                        <>
                            <FilterPills
                                categories={categories}
                                activeId={activeCategory.id}
                                onSelect={setActiveId}
                                onClear={() => setActiveId(null)}
                            />

                            <CategoryTitle title={activeCategory.title} />

                            {products.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            addons={
                                                activeCategory.addons ??
                                                undefined
                                            }
                                            enableCart={cartEnabled}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="py-8 text-sm text-muted-foreground">
                                    No items available.
                                </p>
                            )}
                        </>
                    )}
                </main>

                <SiteFooter
                    categories={categories}
                    onSelectCategory={selectCategory}
                />
            </div>

            {cartEnabled && <CartSheet />}
            {cartEnabled && <CartToast />}

            <WhatsAppFab />
        </CartProvider>
    );
}
