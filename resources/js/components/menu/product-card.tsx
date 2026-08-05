import { Star } from 'lucide-react';
import { memo, useState } from 'react';
import { DietIcons } from '@/components/menu/diet-icons';
import { ProductDialog } from '@/components/menu/product-dialog';
import { ProductPrice } from '@/components/menu/product-price';
import { VariantSelector } from '@/components/menu/variant-selector';
import { SmartImage } from '@/components/smart-image';
import { cn, isArabic } from '@/lib/utils';
import type { CategoryAddon, Product } from '@/types';

interface ProductCardProps {
    product: Product;
    /** Add-ons from the product's category; empty when none are configured. */
    addons?: CategoryAddon[];
}

/**
 * A single menu item: thumbnail, name, short copy and price, with the variant
 * picker underneath when the item has options. Tapping anywhere opens the full
 * details dialog.
 */
function ProductCardComponent({ product, addons = [] }: ProductCardProps) {
    const variants = product.variants ?? [];
    const hasVariants = variants.length > 0;

    // Default to the last variant when variants exist, matching the dialog.
    const [selectedIndex, setSelectedIndex] = useState(
        hasVariants ? variants.length - 1 : 0,
    );
    const [open, setOpen] = useState(false);

    const selectedVariant = hasVariants ? variants[selectedIndex] : null;
    const basePrice = selectedVariant ? selectedVariant.price : product.price;
    const discountPrice = selectedVariant
        ? selectedVariant.discount_price
        : product.discount_price;

    const image = product.thumb ?? product.image;

    // Right-align and flip the text block to RTL when the title is Arabic.
    const rtl = isArabic(product.title);

    return (
        <>
            <div className="group relative flex h-full min-w-0 flex-col rounded-[1.5rem] border border-primary/15 bg-card/60 p-3 transition-all duration-300 focus-within:border-primary/35 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_32px_-24px_rgba(120,137,108,0.9)]">
                {/* The details trigger covers the whole card, so the heading and
                    copy can stay real block elements outside the button. */}
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="absolute inset-0 z-0 rounded-[1.5rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <span className="sr-only">View {product.title}</span>
                </button>

                <div className="pointer-events-none flex min-w-0 flex-1 gap-3">
                    {image && (
                        <SmartImage
                            src={image}
                            alt={product.title}
                            className="size-24 shrink-0 rounded-[1.15rem] md:size-28"
                            imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                            draggable={false}
                        />
                    )}

                    <div className="flex min-w-0 flex-1 flex-col">
                        <div
                            className={cn(
                                'flex items-center gap-1.5',
                                rtl && 'flex-row-reverse',
                            )}
                        >
                            <h3
                                dir={rtl ? 'rtl' : undefined}
                                className={cn(
                                    'min-w-0 flex-1 truncate font-heading text-xl leading-tight font-semibold text-primary',
                                    rtl && 'text-right',
                                )}
                            >
                                {product.title}
                            </h3>
                            {product.is_featured && (
                                <Star className="size-3.5 shrink-0 fill-primary/70 text-primary/70" />
                            )}
                            <DietIcons product={product} />
                        </div>

                        {product.subtitle && (
                            <p
                                dir={rtl ? 'rtl' : undefined}
                                className={cn(
                                    'truncate text-xs text-muted-foreground',
                                    rtl && 'text-right',
                                )}
                            >
                                {product.subtitle}
                            </p>
                        )}

                        {product.description && (
                            <p
                                dir={rtl ? 'rtl' : undefined}
                                className={cn(
                                    'line-clamp-2 text-xs text-muted-foreground/80',
                                    rtl && 'text-right',
                                )}
                            >
                                {product.description}
                            </p>
                        )}

                        <ProductPrice
                            basePrice={basePrice}
                            discountPrice={discountPrice}
                            className="mt-auto pt-2"
                        />
                    </div>
                </div>

                {hasVariants && (
                    <div className="relative z-10 mt-3 border-t border-primary/10 pt-3">
                        <VariantSelector
                            variants={variants}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                        />
                    </div>
                )}
            </div>

            <ProductDialog
                product={product}
                addons={addons}
                open={open}
                onOpenChange={setOpen}
                selectedIndex={selectedIndex}
                onSelectVariant={setSelectedIndex}
            />
        </>
    );
}

/**
 * Memoized so filter changes elsewhere on the page don't re-render every card
 * in the grid.
 */
export const ProductCard = memo(ProductCardComponent);
