<?php

namespace App\Settings;

use Illuminate\Support\Facades\Storage;
use Spatie\LaravelSettings\Settings;

/**
 * The spot reservation settings. Kept in their own group rather than folded
 * into {@see GeneralSettings}, so the reservation admin page owns its data and
 * saving it can't touch the storefront settings.
 */
class ReservationSettings extends Settings
{
    /**
     * Whether spots can be booked. When off the landing page's reservation
     * button is disabled and `/spots` redirects back home.
     */
    public bool $is_active;

    /**
     * The WhatsApp number reservation requests are sent to.
     */
    public ?string $phone_number;

    /**
     * Whether the spot map is offered. When off the reservation page only ever
     * lists cards, with no view switch.
     */
    public bool $map_is_active;

    /**
     * The uploaded map image, as a path on the public disk.
     */
    public ?string $map_image;

    public static function group(): string
    {
        return 'reservation';
    }

    /**
     * The number reservation requests are sent to, or null when reservations
     * can't be taken — either they're switched off or no number is configured.
     */
    public function usablePhoneNumber(): ?string
    {
        return $this->is_active && filled($this->phone_number)
            ? $this->phone_number
            : null;
    }

    /**
     * The public URL of the map image, or null when the map can't be shown —
     * either it's switched off or no image has been uploaded.
     */
    public function usableMapImageUrl(): ?string
    {
        if (! $this->map_is_active || blank($this->map_image)) {
            return null;
        }

        return Storage::disk('public')->url($this->map_image);
    }
}
