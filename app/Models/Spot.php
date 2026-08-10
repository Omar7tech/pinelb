<?php

namespace App\Models;

use Database\Factories\SpotFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * A bookable seat or table — a "spot" — customers reserve from the landing
 * page. Each spot carries its own gallery so the card can show the setting
 * from more than one angle.
 */
#[Sluggable(from: 'name', to: 'slug')]
#[Guarded(['id'])]
class Spot extends Model implements HasMedia
{
    /** @use HasFactory<SpotFactory> */
    use HasFactory, InteractsWithMedia;

    /**
     * Unlike the menu models a spot keeps a whole gallery, so the collection is
     * left multi-file and ordered by the media library's own `order_column`.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->useDisk('public');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('webp')
            ->nonQueued()
            ->format('webp')
            ->quality(75);

        $this->addMediaConversion('thumb')
            ->nonQueued()
            ->format('webp')
            ->quality(50)
            ->fit(Fit::Max, 600, 600);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'discount_price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_reserved' => 'boolean',
            'map_x' => 'decimal:2',
            'map_y' => 'decimal:2',
            'price' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }
}
