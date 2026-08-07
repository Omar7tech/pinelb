<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasDescription;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

/**
 * How the storefront's open/closed state is decided.
 */
enum ShopStatusMode: string implements HasDescription, HasIcon, HasLabel
{
    /**
     * The state is controlled by hand with a single switch.
     */
    case MANUAL = 'manual';

    /**
     * The state is derived from the weekly opening-hours schedule.
     */
    case AUTOMATIC = 'automatic';

    public function getLabel(): string
    {
        return match ($this) {
            self::MANUAL => 'Manual',
            self::AUTOMATIC => 'Automatic',
        };
    }

    public function getDescription(): string
    {
        return match ($this) {
            self::MANUAL => 'Open and close the shop yourself with a switch.',
            self::AUTOMATIC => 'Open and close the shop on a weekly schedule.',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::MANUAL => Heroicon::OutlinedHandRaised,
            self::AUTOMATIC => Heroicon::OutlinedClock,
        };
    }
}
