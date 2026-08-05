<?php

namespace App\Http\Resources;

use App\Models\Slide;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Slide
 */
class SlideResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Only link the slide while its product is still present and active, so
        // a hidden or deleted product degrades gracefully to a plain image.
        $product = $this->product && $this->product->is_active ? $this->product : null;

        return [
            'id' => $this->id,
            'text' => $this->text,
            'image' => $this->getFirstMediaUrl('image', 'slider') ?: ($this->getFirstMediaUrl('image') ?: null),
            'product' => $product ? (new ProductResource($product))->resolve() : null,
            // Add-ons come from the linked product's category, so the details
            // dialog opened from a slide can still offer the right extras.
            'addons' => $product?->category?->addons,
        ];
    }
}
