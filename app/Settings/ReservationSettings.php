<?php

namespace App\Settings;

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
}
