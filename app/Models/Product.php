<?php

namespace App\Models;

use App\Enums\OrderType;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

#[Sluggable(from: 'title', to: 'slug')]
#[Guarded(['id'])]
class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory , InteractsWithMedia;


    protected $casts = [
        'order_type' => OrderType::class,
        'variants' => 'array',
    ];
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')
            ->singleFile()
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
            ->fit(Fit::Max, 400, 400);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
