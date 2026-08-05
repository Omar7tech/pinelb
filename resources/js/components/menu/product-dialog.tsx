import { Clock, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DietIcons } from '@/components/menu/diet-icons';
import { ProductPrice } from '@/components/menu/product-price';
import { VariantSelector } from '@/components/menu/variant-selector';
import { SmartImage } from '@/components/smart-image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { CartAddon } from '@/contexts/cart-context';
import { usePricing } from '@/hooks/use-pricing';
import type { CategoryAddon, Product } from '@/types';

interface ProductDialogProps {
    product: Product;
    /** Add-ons from the product's category; empty when none are configured. */
    addons?: CategoryAddon[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedIndex: number;
    onSelectVariant: (index: number) => void;
    /** When omitted the add-to-cart action is hidden (the dine-in menu). */
    onAddToCart?: (addons: CartAddon[]) => void;
}

/**
 * Full item details in a responsive dialog (bottom sheet on mobile, centered
 * modal on desktop): image, full copy, variant picker, the category's extras
 * with quantity steppers, and the price.
 */
export function ProductDialog({
    product,
    addons = [],
    open,
    onOpenChange,
    selectedIndex,
    onSelectVariant,
    onAddToCart,
}: ProductDialogProps) {
    const pricing = usePricing();
    const variants = product.variants ?? [];
    const hasVariants = variants.length > 0;
    const selectedVariant = hasVariants ? variants[selectedIndex] : null;
    const basePrice = selectedVariant ? selectedVariant.price : product.price;
    const discountPrice = selectedVariant
        ? selectedVariant.discount_price
        : product.discount_price;
    const image = product.image ?? product.thumb;

    // Quantity chosen per add-on, indexed alongside `addons`.
    const [addonQuantities, setAddonQuantities] = useState<number[]>([]);

    // Start the extras clean each time the dialog opens. Tracked during render
    // via the previous open state, so no effect fires a synchronous update.
    const [wasOpen, setWasOpen] = useState(open);

    if (open !== wasOpen) {
        setWasOpen(open);

        if (open) {
            setAddonQuantities(addons.map(() => 0));
        }
    }

    const selectedAddons = useMemo<CartAddon[]>(
        () =>
            addons
                .map((addon, index) => ({
                    name: addon.name,
                    price: Number(addon.price),
                    quantity: addonQuantities[index] ?? 0,
                }))
                .filter((addon) => addon.quantity > 0),
        [addons, addonQuantities],
    );

    const extrasUsd = selectedAddons.reduce(
        (total, addon) => total + addon.price * addon.quantity,
        0,
    );

    const setAddonQuantity = (index: number, next: number): void => {
        setAddonQuantities((previous) => {
            const updated = [...previous];
            updated[index] = Math.max(0, next);

            return updated;
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* The panel itself doesn't scroll: the image and price footer stay
                put and only the middle column scrolls. */}
            <DialogContent className="gap-0 overflow-y-hidden p-0">
                {image ? (
                    <div className="shrink-0 p-4 pt-2 sm:pt-4">
                        <SmartImage
                            src={image}
                            alt={product.title}
                            className="aspect-video w-full rounded-[1.35rem] border border-primary/15"
                            imgClassName="object-cover"
                            draggable={false}
                        />
                    </div>
                ) : (
                    // Keep the close button clear of the title when there's no image.
                    <div className="h-10 shrink-0 sm:h-12" />
                )}

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5">
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="flex items-start gap-2 pr-8">
                            <span className="flex-1">{product.title}</span>
                            {product.is_featured && (
                                <Star className="mt-1.5 size-5 shrink-0 fill-primary/70 text-primary/70" />
                            )}
                            <DietIcons
                                product={product}
                                iconClassName="size-5"
                                className="mt-2 gap-1.5"
                            />
                        </DialogTitle>

                        {product.subtitle && (
                            <p className="text-sm text-muted-foreground">
                                {product.subtitle}
                            </p>
                        )}

                        {product.preparation_time !== null &&
                            product.preparation_time > 0 && (
                                <span className="mt-1.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs tracking-wide text-primary uppercase">
                                    <Clock className="size-3.5" />
                                    Ready in ~{product.preparation_time} min
                                </span>
                            )}
                    </DialogHeader>

                    {product.description && (
                        <p className="max-h-[35vh] overflow-y-auto overscroll-contain pr-1 text-sm leading-relaxed text-muted-foreground">
                            {product.description}
                        </p>
                    )}

                    {hasVariants && (
                        <VariantSelector
                            variants={variants}
                            selectedIndex={selectedIndex}
                            onSelect={onSelectVariant}
                        />
                    )}

                    {addons.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                                Extras
                            </span>
                            <ul className="flex flex-col gap-1.5">
                                {addons.map((addon, index) => {
                                    const quantity =
                                        addonQuantities[index] ?? 0;

                                    return (
                                        <li
                                            key={index}
                                            className="flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 py-2 pr-2 pl-3.5"
                                        >
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate text-sm text-foreground/80">
                                                    {addon.name}
                                                </span>
                                                <span className="text-xs text-primary">
                                                    {pricing.primary(
                                                        Number(addon.price),
                                                    )}
                                                </span>
                                            </div>

                                            {/* Steppers only make sense when the
                                                extras can actually be ordered. */}
                                            {onAddToCart && (
                                                <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-primary/20 bg-background p-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setAddonQuantity(
                                                                index,
                                                                quantity - 1,
                                                            )
                                                        }
                                                        disabled={
                                                            quantity === 0
                                                        }
                                                        aria-label={`Less ${addon.name}`}
                                                        className="flex size-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:text-primary/30 disabled:hover:bg-transparent"
                                                    >
                                                        <Minus className="size-3.5" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm tabular-nums">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setAddonQuantity(
                                                                index,
                                                                quantity + 1,
                                                            )
                                                        }
                                                        aria-label={`More ${addon.name}`}
                                                        className="flex size-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                                    >
                                                        <Plus className="size-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Fixed footer: the price and action stay visible however long
                    the copy runs. */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-primary/15 bg-primary/5 px-5 py-4">
                    <ProductPrice
                        basePrice={basePrice}
                        discountPrice={discountPrice}
                        size="lg"
                    />

                    {onAddToCart ? (
                        <button
                            type="button"
                            onClick={() => onAddToCart(selectedAddons)}
                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            <ShoppingBag className="size-4" />
                            Add
                            {extrasUsd > 0 && (
                                <span className="text-primary-foreground/70">
                                    +{pricing.primary(extrasUsd)}
                                </span>
                            )}
                        </button>
                    ) : (
                        selectedVariant && (
                            <span className="text-xs tracking-[0.18em] text-primary/60 uppercase">
                                {selectedVariant.name}
                            </span>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
