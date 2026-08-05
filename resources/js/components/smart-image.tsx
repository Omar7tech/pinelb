import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SmartImageProps {
    src: string;
    alt: string;
    /** Classes for the wrapper box (sizing, border, radius). */
    className?: string;
    /** Classes for the `<img>` itself (object-fit, transforms). */
    imgClassName?: string;
    draggable?: boolean;
    loading?: 'lazy' | 'eager';
    /** Overlays rendered above the image, e.g. badges. */
    children?: ReactNode;
}

/**
 * An image that shows a spinner while it loads, then fades in. The wrapper takes
 * the layout/size classes; the image fills it.
 */
export function SmartImage({
    src,
    alt,
    className,
    imgClassName,
    draggable,
    loading = 'lazy',
    children,
}: SmartImageProps) {
    const ref = useRef<HTMLImageElement>(null);
    const [loaded, setLoaded] = useState(false);

    // Reset on src change, but treat already-cached images as loaded so the
    // spinner never flashes (a cached image won't fire `onLoad`).
    useEffect(() => {
        setLoaded(ref.current?.complete ?? false);
    }, [src]);

    return (
        <span className={cn('relative block overflow-hidden', className)}>
            {!loaded && (
                <span className="absolute inset-0 grid place-items-center bg-primary/5">
                    <Loader2 className="size-5 animate-spin text-primary/40" />
                </span>
            )}

            <img
                ref={ref}
                src={src}
                alt={alt}
                draggable={draggable}
                loading={loading}
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
                className={cn(
                    'size-full transition-opacity duration-300',
                    !loaded && 'opacity-0',
                    imgClassName,
                )}
            />

            {children}
        </span>
    );
}
