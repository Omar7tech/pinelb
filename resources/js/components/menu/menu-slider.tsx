import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ProductDialog } from '@/components/menu/product-dialog';
import { SmartImage } from '@/components/smart-image';
import type { CartAddon } from '@/contexts/cart-context';
import { useCartActions } from '@/contexts/cart-context';
import { cn, isArabic } from '@/lib/utils';
import type { Slide } from '@/types';

interface MenuSliderProps {
    slides: Slide[];
    /** Whether a slide's details dialog can add to cart (delivery menu only). */
    enableCart?: boolean;
}

const AUTOPLAY_DELAY = 5000;

/**
 * Promotional carousel above the menu — one card per view on mobile, up to
 * three on desktop. Embla drives the track with pointer events, so it drags
 * with a mouse as well as a finger, and it loops as it auto-advances. A slide
 * linked to a product opens that product's details when tapped; plain slides
 * are decorative.
 */
export function MenuSlider({ slides, enableCart = false }: MenuSliderProps) {
    const { addItem } = useCartActions();

    const plugins = useMemo(
        () => [
            Autoplay({
                delay: AUTOPLAY_DELAY,
                // Keep advancing after a swipe, but hold while the pointer rests
                // on the carousel so a slide can be read.
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        ],
        [],
    );
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'start', containScroll: 'trimSnaps' },
        plugins,
    );

    const [selectedSnap, setSelectedSnap] = useState(0);
    const [snaps, setSnaps] = useState<number[]>([]);

    // The slide whose product details are open, plus its chosen variant.
    const [activeSlide, setActiveSlide] = useState<Slide | null>(null);
    const [variantIndex, setVariantIndex] = useState(0);

    // Mirror Embla's snap list and position into state for the dots.
    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const sync = (): void => {
            setSnaps(emblaApi.scrollSnapList());
            setSelectedSnap(emblaApi.selectedScrollSnap());
        };

        emblaApi.on('select', sync);
        emblaApi.on('reInit', sync);
        // Embla is imperative; read its initial layout once on mount.
        sync();

        return () => {
            emblaApi.off('select', sync);
            emblaApi.off('reInit', sync);
        };
    }, [emblaApi]);

    // Autoplay would keep sliding underneath the details dialog, so hold it
    // while a slide's product is open.
    useEffect(() => {
        const autoplay = emblaApi?.plugins().autoplay;

        if (!autoplay) {
            return;
        }

        if (activeSlide === null) {
            autoplay.play();
        } else {
            autoplay.stop();
        }
    }, [emblaApi, activeSlide]);

    if (slides.length === 0) {
        return null;
    }

    const openSlide = (slide: Slide): void => {
        if (!slide.product) {
            return;
        }

        // Default to the last variant, matching the product cards.
        const variants = slide.product.variants ?? [];
        setVariantIndex(variants.length > 0 ? variants.length - 1 : 0);
        setActiveSlide(slide);
    };

    const product = activeSlide?.product ?? null;
    const variants = product?.variants ?? [];
    const selectedVariant = variants.length > 0 ? variants[variantIndex] : null;
    const effectivePrice = selectedVariant
        ? (selectedVariant.discount_price ?? selectedVariant.price)
        : (product?.discount_price ?? product?.price ?? 0);

    const addToCart = (selectedAddons: CartAddon[] = []): void => {
        if (!product) {
            return;
        }

        addItem({
            productId: product.id,
            variantIndex: variants.length > 0 ? variantIndex : null,
            title: product.title,
            variantName: selectedVariant?.name ?? null,
            unitUsd: effectivePrice,
            image: product.thumb ?? product.image,
            addons: selectedAddons,
        });
        setActiveSlide(null);
    };

    return (
        <section aria-label="Featured" className="flex flex-col gap-3">
            <div ref={emblaRef} className="overflow-hidden select-none">
                <div className="-ml-3 flex">
                    {slides.map((slide) => {
                        const title = slide.product?.title ?? null;
                        const text = slide.text ?? null;
                        const rtl = isArabic(text ?? title);

                        const image = slide.image ? (
                            <SmartImage
                                src={slide.image}
                                alt={title ?? 'Featured'}
                                className="aspect-[16/9] w-full"
                                imgClassName="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                draggable={false}
                            />
                        ) : (
                            <span className="block aspect-[16/9] w-full bg-primary/10" />
                        );

                        const caption =
                            title || text ? (
                                <span
                                    dir={rtl ? 'rtl' : undefined}
                                    className={cn(
                                        'pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-4 pt-10',
                                        rtl
                                            ? 'items-end text-right'
                                            : 'items-start text-left',
                                    )}
                                >
                                    {text && (
                                        <span className="font-heading text-2xl leading-tight font-semibold text-white drop-shadow-sm sm:text-3xl">
                                            {text}
                                        </span>
                                    )}
                                    {slide.product && title && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs tracking-wide text-primary uppercase">
                                            {title}
                                            {rtl ? (
                                                <ChevronLeft className="size-3.5" />
                                            ) : (
                                                <ChevronRight className="size-3.5" />
                                            )}
                                        </span>
                                    )}
                                </span>
                            ) : null;

                        const shell =
                            'group relative block w-full overflow-hidden rounded-[1.5rem] border border-primary/15';

                        return (
                            <div
                                key={slide.id}
                                className="min-w-0 flex-[0_0_100%] pl-3 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                            >
                                {slide.product ? (
                                    <button
                                        type="button"
                                        onClick={() => openSlide(slide)}
                                        aria-label={`View ${slide.product.title}`}
                                        className={cn(
                                            shell,
                                            'cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                        )}
                                    >
                                        {image}
                                        {caption}
                                    </button>
                                ) : (
                                    <span className={shell}>
                                        {image}
                                        {caption}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {snaps.length > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                    {snaps.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => emblaApi?.scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-current={index === selectedSnap}
                            className={cn(
                                'h-1.5 rounded-full transition-all duration-300',
                                index === selectedSnap
                                    ? 'w-6 bg-primary'
                                    : 'w-1.5 bg-primary/25 hover:bg-primary/50',
                            )}
                        />
                    ))}
                </div>
            )}

            {product && (
                <ProductDialog
                    product={product}
                    addons={activeSlide?.addons ?? []}
                    open={activeSlide !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setActiveSlide(null);
                        }
                    }}
                    selectedIndex={variantIndex}
                    onSelectVariant={setVariantIndex}
                    onAddToCart={enableCart ? addToCart : undefined}
                />
            )}
        </section>
    );
}
