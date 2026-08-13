import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';
import type { SpotImage } from '@/types';

interface SpotGalleryProps {
    images: SpotImage[];
    /** Alt text prefix, the spot name. */
    name: string;
    className?: string;
}

/**
 * The photo strip at the top of a spot card. A single photo renders as a plain
 * image; several become a looping, draggable carousel with arrows and dots.
 * With no photos at all it draws nothing, rather than holding a stand-in open.
 */
export function SpotGallery({ images, name, className }: SpotGalleryProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selected, setSelected] = useState(0);

    // Embla is imperative; mirror its position into state for the dots.
    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const sync = (): void => setSelected(emblaApi.selectedScrollSnap());

        emblaApi.on('select', sync);
        emblaApi.on('reInit', sync);
        sync();

        return () => {
            emblaApi.off('select', sync);
            emblaApi.off('reInit', sync);
        };
    }, [emblaApi]);

    const scrollTo = useCallback(
        (index: number): void => {
            emblaApi?.scrollTo(index);
        },
        [emblaApi],
    );

    if (images.length === 0) {
        return null;
    }

    if (images.length === 1) {
        return (
            <SmartImage
                src={images[0].url}
                alt={name}
                className={cn(
                    'aspect-[4/3] w-full rounded-[1.15rem]',
                    className,
                )}
                imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                draggable={false}
            />
        );
    }

    return (
        <div
            className={cn(
                'group/gallery relative aspect-[4/3] w-full overflow-hidden rounded-[1.15rem]',
                className,
            )}
        >
            <div ref={emblaRef} className="h-full overflow-hidden">
                <div className="flex h-full touch-pan-y">
                    {images.map((image, index) => (
                        <div key={image.id} className="min-w-0 flex-[0_0_100%]">
                            <SmartImage
                                src={image.url}
                                alt={`${name} — photo ${index + 1}`}
                                className="size-full"
                                imgClassName="object-cover"
                                loading={index === 0 ? 'eager' : 'lazy'}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-primary opacity-0 transition-opacity group-hover/gallery:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
                <ChevronLeft className="size-4" />
            </button>

            <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-primary opacity-0 transition-opacity group-hover/gallery:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
                <ChevronRight className="size-4" />
            </button>

            <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
                {images.map((image, index) => (
                    <button
                        key={image.id}
                        type="button"
                        onClick={() => scrollTo(index)}
                        aria-label={`Go to photo ${index + 1}`}
                        aria-current={index === selected}
                        className={cn(
                            'h-1.5 rounded-full bg-background/60 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            index === selected ? 'w-4 bg-background' : 'w-1.5',
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
