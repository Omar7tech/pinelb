import { Minus, Pencil, Plus, StickyNote, Trash2 } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import { cartItemUnitUsd } from '@/contexts/cart-context';
import type { CartItem } from '@/contexts/cart-context';
import type { PriceParts } from '@/hooks/use-pricing';
import { cn } from '@/lib/utils';

interface CartLineProps {
    item: CartItem;
    pricing: PriceParts;
    onIncrement: () => void;
    onDecrement: () => void;
    onRemove: () => void;
    onEditNote: () => void;
}

/** One row in the cart: thumbnail, extras breakdown, note, and a qty stepper. */
export function CartLine({
    item,
    pricing,
    onIncrement,
    onDecrement,
    onRemove,
    onEditNote,
}: CartLineProps) {
    const note = item.note?.trim() ?? '';
    const lineTotalUsd = cartItemUnitUsd(item) * item.quantity;

    return (
        <li className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-center gap-3">
                {item.image && (
                    <SmartImage
                        src={item.image}
                        alt={item.title}
                        className="size-14 shrink-0 rounded-xl border border-primary/15"
                        imgClassName="object-cover"
                        draggable={false}
                    />
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm leading-tight font-medium">
                        {item.title}
                    </p>
                    {item.variantName && (
                        <p className="truncate text-xs text-muted-foreground">
                            {item.variantName}
                        </p>
                    )}

                    {item.addons.length > 0 ? (
                        <div className="mt-1 flex flex-col gap-0.5 rounded-xl border border-dashed border-primary/25 p-2 text-[11px] text-muted-foreground">
                            <div className="flex items-center justify-between gap-2">
                                <span>Item</span>
                                <span className="tabular-nums">
                                    {pricing.primary(
                                        item.unitUsd * item.quantity,
                                    )}
                                </span>
                            </div>

                            {item.addons.map((addon) => (
                                <div
                                    key={addon.name}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span className="min-w-0 truncate">
                                        <span className="tabular-nums">
                                            {addon.quantity * item.quantity}×
                                        </span>{' '}
                                        {addon.name}
                                    </span>
                                    <span className="shrink-0 tabular-nums">
                                        +
                                        {pricing.primary(
                                            addon.price *
                                                addon.quantity *
                                                item.quantity,
                                        )}
                                    </span>
                                </div>
                            ))}

                            <div className="mt-0.5 flex items-center justify-between gap-2 border-t border-primary/15 pt-1 text-xs text-primary">
                                <span className="tracking-wide uppercase">
                                    Total
                                </span>
                                <span className="tabular-nums">
                                    {pricing.primary(lineTotalUsd)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col text-xs leading-tight">
                            {pricing.showUsd && (
                                <span className="text-primary">
                                    {pricing.usd(item.unitUsd * item.quantity)}
                                </span>
                            )}
                            {pricing.showLbp && (
                                <span
                                    className={cn(
                                        pricing.showUsd
                                            ? 'text-[11px] text-muted-foreground'
                                            : 'text-primary',
                                    )}
                                >
                                    {pricing.lbp(item.unitUsd * item.quantity)}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label={`Remove ${item.title}`}
                        className="-m-1 rounded-full p-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <Trash2 className="size-4" />
                    </button>

                    <div className="flex items-center gap-0.5 rounded-full border border-primary/20 bg-primary/5 p-0.5">
                        <button
                            type="button"
                            onClick={onDecrement}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="flex size-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:text-primary/30 disabled:hover:bg-transparent"
                        >
                            <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm tabular-nums">
                            {item.quantity}
                        </span>
                        <button
                            type="button"
                            onClick={onIncrement}
                            aria-label="Increase quantity"
                            className="flex size-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                            <Plus className="size-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {note !== '' ? (
                <button
                    type="button"
                    onClick={onEditNote}
                    className="flex w-full items-start gap-1.5 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-left text-xs transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <StickyNote className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="flex-1 break-words text-foreground/80">
                        {note}
                    </span>
                    <Pencil className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onEditNote}
                    className="inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <StickyNote className="size-3.5" />
                    Add a note
                </button>
            )}
        </li>
    );
}
