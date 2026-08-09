<?php

namespace App\Filament\Pages;

use App\Settings\GeneralSettings;
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
 * Only the reservation keys are in the form, so saving here leaves the rest of
 * the general settings untouched.
 */
class ManageReservations extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static ?string $navigationLabel = 'Settings';

    protected static ?string $title = 'Reservation settings';

    protected static string|UnitEnum|null $navigationGroup = 'Reservations';

    protected static ?int $navigationSort = 2;

    protected static string $settings = GeneralSettings::class;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Reservations')
                    ->description('Controls the landing page\'s reservation button and the /spots page.')
                    ->columnSpanFull()
                    ->components([
                        Toggle::make('reservations_active')
                            ->label('Enable reservations')
                            ->helperText('Turn off to disable the reservation button. Customers sent to /spots are returned to the landing page.')
                            ->default(true)
                            ->columnSpanFull(),

                        TextInput::make('reservation_phone_number')
                            ->label('Reservation phone number')
                            ->helperText('Reservation requests are sent to this number on WhatsApp. Include the country code, e.g. +96171387946.')
                            ->tel()
                            ->maxLength(255)
                            ->default('+96171387946')
                            ->requiredIf('reservations_active', true)
                            ->columnSpanFull()
                            ->visibleJs(<<<'JS'
                                $get('reservations_active')
                                JS),
                    ]),
            ]);
    }
}
