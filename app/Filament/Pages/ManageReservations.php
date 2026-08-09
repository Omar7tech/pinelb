<?php

namespace App\Filament\Pages;

use App\Settings\ReservationSettings;
use BackedEnum;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * The reservation settings, sitting under Spots in the Reservations group.
 */
class ManageReservations extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static ?string $navigationLabel = 'Settings';

    protected static ?string $title = 'Reservation settings';

    protected static string|UnitEnum|null $navigationGroup = 'Reservations';

    protected static ?int $navigationSort = 2;

    protected static string $settings = ReservationSettings::class;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Reservations')
                    ->description('Controls the landing page\'s reservation button and the /spots page.')
                    ->columnSpanFull()
                    ->components([
                        Toggle::make('is_active')
                            ->label('Enable reservations')
                            ->helperText('Turn off to disable the reservation button. Customers sent to /spots are returned to the landing page.')
                            ->default(true)
                            ->columnSpanFull(),

                        TextInput::make('phone_number')
                            ->label('Reservation phone number')
                            ->helperText('Reservation requests are sent to this number on WhatsApp. Include the country code, e.g. +96171387946.')
                            ->tel()
                            ->maxLength(255)
                            ->default('+96171387946')
                            ->requiredIf('is_active', true)
                            ->columnSpanFull()
                            ->visibleJs(<<<'JS'
                                $get('is_active')
                                JS),
                    ]),
            ]);
    }
}
