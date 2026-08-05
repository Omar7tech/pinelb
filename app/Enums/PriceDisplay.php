<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

/**
 * Which currency the storefront menu prices are rendered in.
 */
enum PriceDisplay: string implements HasIcon, HasLabel
{
    case USD = 'usd';
    case LBP = 'lbp';
    case BOTH = 'both';

    public function getLabel(): string
    {
        return match ($this) {
            self::USD => 'USD only',
            self::LBP => 'LBP only',
            self::BOTH => 'Both (USD & LBP)',
        };
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::USD, self::LBP => Heroicon::OutlinedBanknotes,
            self::BOTH => Heroicon::OutlinedArrowsRightLeft,
        };
    }

    /**
     * Whether this display mode needs a configured LBP exchange rate.
     */
    public function needsLbpRate(): bool
    {
        return $this !== self::USD;
    }
}
