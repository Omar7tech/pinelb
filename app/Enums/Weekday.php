<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

/**
 * Days of the week, numbered to match JavaScript's `Date.getDay()` (0 = Sunday)
 * so the storefront helpers can resolve "today" without remapping.
 */
enum Weekday: int implements HasLabel
{
    case SUNDAY = 0;
    case MONDAY = 1;
    case TUESDAY = 2;
    case WEDNESDAY = 3;
    case THURSDAY = 4;
    case FRIDAY = 5;
    case SATURDAY = 6;

    public function getLabel(): string
    {
        return match ($this) {
            self::SUNDAY => 'Sunday',
            self::MONDAY => 'Monday',
            self::TUESDAY => 'Tuesday',
            self::WEDNESDAY => 'Wednesday',
            self::THURSDAY => 'Thursday',
            self::FRIDAY => 'Friday',
            self::SATURDAY => 'Saturday',
        };
    }
}
