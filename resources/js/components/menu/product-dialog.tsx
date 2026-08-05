import { Clock, Star } from 'lucide-react';
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
}

/**
 * Full item details in a responsive dialog (bottom sheet on mobile, centered
 * modal on desktop): image, full copy, variant picker, the category's extras
 * and the price.
 */
export function ProductDialog({
    product,
    addons = [],
    open,
    onOpenChange,
    selectedIndex,
    onSelectVariant,
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
                                {addons.map((addon, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-3.5 py-2"
                                    >
                                        <span className="min-w-0 truncate text-sm text-foreground/80">
                                            {addon.name}
                                        </span>
                                        <span className="shrink-0 text-sm text-primary">
                                            {pricing.primary(
                                                Number(addon.price),
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Fixed footer: the price stays visible however long the copy runs. */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-primary/15 bg-primary/5 px-5 py-4">
                    <ProductPrice
                        basePrice={basePrice}
                        discountPrice={discountPrice}
                        size="lg"
                    />
                    {selectedVariant && (
                        <span className="text-xs tracking-[0.18em] text-primary/60 uppercase">
                            {selectedVariant.name}
                        </span>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
