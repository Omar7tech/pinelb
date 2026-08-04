<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

enum OrderType: string implements HasColor, HasIcon, HasLabel
{
    case DINE_IN = 'dine_in';
    case DELIVERY = 'delivery';
    case BOTH = 'both';

    public function getLabel(): string
    {
        return match ($this) {
            self::DINE_IN => 'Dine in',
            self::DELIVERY => 'Delivery',
            self::BOTH => 'Both',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::DINE_IN => 'info',
            self::DELIVERY => 'warning',
            self::BOTH => 'success',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::DINE_IN => Heroicon::BuildingStorefront,
            self::DELIVERY => Heroicon::Truck,
            self::BOTH => Heroicon::Squares2x2,
        };
    }
}
