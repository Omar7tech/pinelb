import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

function DialogOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-primary/25 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                className,
            )}
            {...props}
        />
    );
}

/**
 * Responsive dialog panel: a bottom sheet that slides up on mobile, a centered
 * modal on larger screens. Cream surface with a soft sage hairline, matching
 * the rest of the storefront.
 */
function DialogContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
}) {
    return (
        <DialogPortal>
            <DialogOverlay />
            {/* Full-screen wrapper centers on desktop and bottom-aligns on mobile.
                It ignores pointer events so clicks outside the panel still close. */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
                <DialogPrimitive.Content
                    data-slot="dialog-content"
                    className={cn(
                        'pointer-events-auto relative flex max-h-[88vh] w-full flex-col gap-4 overflow-y-auto rounded-t-[1.75rem] border border-primary/20 bg-background p-5 text-foreground shadow-[0_-12px_40px_-16px_rgba(120,137,108,0.5)] sm:max-w-lg sm:rounded-[1.75rem] sm:shadow-[0_24px_60px_-20px_rgba(120,137,108,0.55)]',
                        'duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
                        className,
                    )}
                    {...props}
                >
                    {/* Grab handle hint for the mobile bottom-sheet feel. */}
                    <span className="mx-auto -mt-1 mb-1 h-1 w-12 shrink-0 rounded-full bg-primary/25 sm:hidden" />

                    {children}

                    {showCloseButton && (
                        <DialogPrimitive.Close className="absolute top-3.5 right-3.5 z-10 inline-flex size-9 items-center justify-center rounded-full border border-primary/20 bg-background/80 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                            <X className="size-4" />
                            <span className="sr-only">Close</span>
                        </DialogPrimitive.Close>
                    )}
                </DialogPrimitive.Content>
            </div>
        </DialogPortal>
    );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={cn('flex flex-col gap-1 text-left', className)}
            {...props}
        />
    );
}

function DialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn(
                'font-heading text-3xl leading-tight font-semibold text-primary',
                className,
            )}
            {...props}
        />
    );
}

function DialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
