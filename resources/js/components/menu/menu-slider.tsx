import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductDialog } from '@/components/menu/product-dialog';
import { SmartImage } from '@/components/smart-image';
import { cn, isArabic } from '@/lib/utils';
import type { Slide } from '@/types';

interface MenuSliderProps {
    slides: Slide[];
}

const AUTOPLAY_DELAY = 5000;

/**
 * Promotional carousel above the menu. Built on native scroll snapping, so it
 * swipes on touch, keeps keyboard scrolling, and needs no carousel library.
 * A slide linked to a product opens that product's details when tapped; plain
 * slides are decorative.
 */
export function MenuSlider({ slides }: MenuSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    // The slide whose product details are open, plus its chosen variant.
    const [activeSlide, setActiveSlide] = useState<Slide | null>(null);
    const [variantIndex, setVariantIndex] = useState(0);

    /** Scrolls so the slide at `index` sits at the start of the viewport. */
    const scrollToIndex = useCallback((index: number): void => {
        const track = trackRef.current;
        const card = track?.children[index];

        if (!track || !(card instanceof HTMLElement)) {
            return;
        }

        track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
    }, []);

    // Derive the active slide from the scroll offset: whichever card's left
    // edge is nearest the track's current scroll position.
    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const sync = (): void => {
            const cards = Array.from(track.children).filter(
                (child): child is HTMLElement => child instanceof HTMLElement,
            );

            let nearest = 0;

            for (let index = 0; index < cards.length; index++) {
                const current = Math.abs(
                    cards[index].offsetLeft - track.scrollLeft,
                );
                const best = Math.abs(
                    cards[nearest].offsetLeft - track.scrollLeft,
                );

                if (current < best) {
                    nearest = index;
                }
            }

            setActiveIndex(nearest);
        };

        sync();
        track.addEventListener('scroll', sync, { passive: true });

        return () => track.removeEventListener('scroll', sync);
    }, [slides]);

    // Advance on a timer, wrapping back to the first slide at the end. Pauses
    // while the pointer is over the carousel or the details dialog is open.
    useEffect(() => {
        if (paused || activeSlide !== null || slides.length < 2) {
            return;
        }

        const timer = window.setInterval(() => {
            const track = trackRef.current;

            if (!track) {
                return;
            }

            // At the far right there's nothing left to reveal, so wrap around.
            const atEnd =
                track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;

            scrollToIndex(atEnd ? 0 : activeIndex + 1);
        }, AUTOPLAY_DELAY);

        return () => window.clearInterval(timer);
    }, [paused, activeSlide, activeIndex, slides.length, scrollToIndex]);

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

    return (
        <section
            aria-label="Featured"
            className="relative flex flex-col gap-3"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div
                ref={trackRef}
                className="flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
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
                        'group relative block w-full shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-primary/15 basis-full sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(33.333%-0.5rem)]';

                    return slide.product ? (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => openSlide(slide)}
                            aria-label={`View ${slide.product.title}`}
                            className={cn(
                                shell,
                                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            )}
                        >
                            {image}
                            {caption}
                        </button>
                    ) : (
                        <span key={slide.id} className={shell}>
                            {image}
                            {caption}
                        </span>
                    );
                })}
            </div>

            {slides.length > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => scrollToIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-current={index === activeIndex}
                            className={cn(
                                'h-1.5 rounded-full transition-all duration-300',
                                index === activeIndex
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
                />
            )}
        </section>
    );
}
