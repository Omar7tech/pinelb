import { Images } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';
import type { SpotImage } from '@/types';

interface SpotCoverProps {
    images: SpotImage[];
    /** Alt text, the spot name. */
    name: string;
    className?: string;
}

/**
 * The still photo at the top of a spot card: the first image only, with a badge
 * hinting at the rest. The full, swipeable gallery lives in the details dialog
 * so the card itself stays a single tap target.
 *
 * A spot without photos draws nothing at all — the card closes up around its
 * name rather than holding a stand-in open.
 */
export function SpotCover({ images, name, className }: SpotCoverProps) {
    const cover = images[0];

    if (!cover) {
        return null;
    }

    return (
        <div
            className={cn(
                'relative aspect-[4/3] w-full overflow-hidden rounded-[1.15rem]',
                className,
            )}
        >
            <SmartImage
                src={cover.url}
                alt={name}
                className="size-full"
                imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                draggable={false}
            />

            {images.length > 1 && (
                <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-[10px] text-primary tabular-nums backdrop-blur">
                    <Images aria-hidden className="size-3" />
                    {images.length}
                </span>
            )}
        </div>
    );
}
