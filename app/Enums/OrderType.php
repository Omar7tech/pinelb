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
    case TAKEAWAY = 'takeaway';
    case BOTH = 'both';

    public function getLabel(): string
    {
        return match ($this) {
            self::DINE_IN => 'Dine in',
            self::TAKEAWAY => 'Takeaway',
            self::BOTH => 'Both',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::DINE_IN => 'info',
            self::TAKEAWAY => 'warning',
            self::BOTH => 'success',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::DINE_IN => Heroicon::BuildingStorefront,
            self::TAKEAWAY => Heroicon::ShoppingBag,
            self::BOTH => Heroicon::Squares2x2,
        };
    }
}
