<?php

namespace App\Http\Resources;

use App\Models\Spot;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @mixin Spot
 */
class SpotResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'discount_price' => $this->discount_price !== null ? (float) $this->discount_price : null,
            'is_reserved' => $this->is_reserved,
            'images' => $this->getMedia('images')
                ->map(fn (Media $media): array => [
                    'id' => $media->id,
                    'url' => $media->getUrl('webp'),
                    'thumb' => $media->getUrl('thumb'),
                ])
                ->values()
                ->all(),
        ];
    }
}
