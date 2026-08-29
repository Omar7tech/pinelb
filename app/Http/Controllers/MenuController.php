<?php

namespace App\Http\Controllers;

use App\Enums\OrderType;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\SlideResource;
use App\Models\Category;
use App\Models\Slide;
use App\Models\Spot;
use App\Settings\GeneralSettings;
use Closure;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function dineIn(GeneralSettings $settings): Response
    {
        return $this->renderMenu(OrderType::DINE_IN, $settings);
    }

    public function delivery(GeneralSettings $settings): Response|RedirectResponse
    {
        // The delivery menu only exists while online ordering is active; otherwise
        // the shop is dine-in only, so send customers back to the dine-in menu.
        if (! $settings->online_ordering_active) {
            return redirect()->route('menu.dine-in');
        }

        return $this->renderMenu(OrderType::DELIVERY, $settings);
    }

    /**
     * Render the menu for one order type: the carousel slides on top, then the
     * category boxes that open a client-side filtered list of that category's
     * products. Categories without any product for this order type are dropped
     * so a box never opens onto an empty list.
     */
    private function renderMenu(OrderType $orderType, GeneralSettings $settings): Response
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->with([
                'media',
                'products' => $this->productsConstraint($orderType),
            ])
            ->orderBy('sort_order')
            ->get()
            ->filter(fn (Category $category): bool => $category->products->isNotEmpty())
            ->values();

        return Inertia::render('menu', [
            'orderType' => $orderType->value,
            'orderTypeLabel' => $orderType->getLabel(),
            'categories' => CategoryResource::collection($categories)->resolve(),
            'slides' => SlideResource::collection($this->activeSlides($orderType))->resolve(),
            // Where an order sent from this menu lands. Table orders don't ride
            // on the delivery switch — a dine-in-only shop still takes them.
            'orderWhatsappNumber' => $settings->whatsapp_number,
            // The tables a dine-in order can be seated at. Empty on the delivery
            // menu, where the order goes to an address instead.
            'tableSpots' => $orderType === OrderType::DINE_IN ? $this->tableSpots() : [],
        ]);
    }

    /**
     * The spots an order can be seated at: the bookable ones that are switched
     * on, in the order the rest of the storefront lists them. Landmarks — the
     * parking, the WC — are left out, since nobody eats at them.
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function tableSpots(): array
    {
        return Spot::query()
            ->where('is_active', true)
            ->where('is_reservable', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Spot $spot): array => [
                'id' => $spot->id,
                'name' => $spot->name,
            ])
            ->all();
    }

    /**
     * The active carousel slides in display order, with the linked product (and
     * its category, for add-ons) eager-loaded.
     *
     * A slide linked to a product is only kept while that product is available
     * on this menu — an inactive product, or one whose order type doesn't match
     * (e.g. a delivery-only item on the dine-in menu) — so the carousel never
     * points at something a customer can't get here. Plain image slides always show.
     *
     * @return Collection<int, Slide>
     */
    private function activeSlides(OrderType $orderType): Collection
    {
        $allowedTypes = [$orderType, OrderType::BOTH];

        return Slide::query()
            ->where('is_active', true)
            ->with(['media', 'product.media', 'product.category'])
            ->orderBy('sort_order')
            ->get()
            ->filter(fn (Slide $slide): bool => $slide->product === null || (
                $slide->product->is_active
                && in_array($slide->product->order_type, $allowedTypes, true)
            ))
            ->values();
    }

    /**
     * Constrain a category's eager-loaded products to the active ones offered
     * for this order type, in display order.
     */
    private function productsConstraint(OrderType $orderType): Closure
    {
        return function (Relation $query) use ($orderType): void {
            $query
                ->with('media')
                ->where('is_active', true)
                ->whereIn('order_type', [$orderType->value, OrderType::BOTH->value])
                ->orderBy('sort_order');
        };
    }
}
