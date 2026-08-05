<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Category
 */
class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'image' => $this->getFirstMediaUrl('image', 'webp') ?: null,
            'addons' => $this->addons,
            'products' => $this->whenLoaded(
                'products',
                fn (): array => ProductResource::collection($this->products)->resolve(),
            ),
        ];
    }
}
