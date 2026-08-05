<?php

namespace App\Filament\Pages;

use App\Enums\PriceDisplay;
use App\Enums\SocialPlatform;
use App\Settings\GeneralSettings;
use BackedEnum;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class ManageGeneral extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static ?string $navigationLabel = 'General';

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static string $settings = GeneralSettings::class;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make()
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Banner')
                            ->icon(Heroicon::OutlinedMegaphone)
                            ->schema([
                                Toggle::make('show_banner')
                                    ->label('Show banner')
                                    ->helperText('Shows a message strip above the menu header.')
                                    ->default(false)
                                    ->columnSpanFull(),

                                TextInput::make('banner_text')
                                    ->label('Banner text')
                                    ->default('Welcome to Pine')
                                    ->maxLength(255)
                                    ->requiredIf('show_banner', true)
                                    ->columnSpanFull()
                                    ->visibleJs(<<<'JS'
                                        $get('show_banner')
                                        JS),
                            ]),

                        Tab::make('Pricing')
                            ->icon(Heroicon::OutlinedBanknotes)
                            ->schema([
                                Toggle::make('show_lbp_prices')
                                    ->label('Enable LBP pricing')
                                    ->helperText('Turn on to allow prices to be shown in Lebanese Pounds.')
                                    ->default(false)
                                    ->columnSpanFull()
                                    ->live()
                                    ->afterStateUpdated(function (bool $state, callable $set): void {
                                        // Fall back to USD-only when LBP pricing is turned off.
                                        if (! $state) {
                                            $set('price_display', PriceDisplay::USD->value);
                                        }
                                    }),

                                TextInput::make('lbp_exchange_rate')
                                    ->label('LBP exchange rate')
                                    ->helperText('How many Lebanese Pounds one US Dollar is worth, e.g. 90000.')
                                    ->numeric()
                                    ->minValue(0)
                                    ->suffix('LBP')
                                    ->live(onBlur: true)
                                    ->requiredIf('show_lbp_prices', true)
                                    ->columnSpanFull()
                                    ->visibleJs(<<<'JS'
                                        $get('show_lbp_prices')
                                        JS),

                                Radio::make('price_display')
                                    ->label('Price display')
                                    ->helperText('LBP and Both need LBP pricing enabled with a rate above zero.')
                                    ->options(PriceDisplay::class)
                                    ->default(PriceDisplay::USD->value)
                                    ->required()
                                    ->columnSpanFull()
                                    ->disableOptionWhen(function (string $value, Get $get): bool {
                                        $lbpReady = $get('show_lbp_prices') && (float) $get('lbp_exchange_rate') > 0;

                                        return $value !== PriceDisplay::USD->value && ! $lbpReady;
                                    }),
                            ]),

                        Tab::make('Delivery')
                            ->icon(Heroicon::OutlinedTruck)
                            ->schema([
                                Toggle::make('online_ordering_active')
                                    ->label('Delivery menu active')
                                    ->helperText('Turn off to make the storefront dine-in only. The delivery link is disabled and /menu/delivery redirects to the dine-in menu.')
                                    ->default(true)
                                    ->columnSpanFull(),

                                TextInput::make('whatsapp_number')
                                    ->label('Orders WhatsApp number')
                                    ->helperText('Orders are sent to this number. Include the country code, e.g. +9613000000.')
                                    ->tel()
                                    ->maxLength(255)
                                    ->requiredIf('online_ordering_active', true)
                                    ->columnSpanFull()
                                    ->visibleJs(<<<'JS'
                                        $get('online_ordering_active')
                                        JS),

                                Toggle::make('charge_delivery')
                                    ->label('Charge for delivery')
                                    ->helperText('Adds a delivery charge to the cart total on the delivery menu.')
                                    ->default(false)
                                    ->columnSpanFull()
                                    ->visibleJs(<<<'JS'
                                        $get('online_ordering_active')
                                        JS),

                                TextInput::make('delivery_fee')
                                    ->label('Delivery charge')
                                    ->helperText('Amount in USD. Customers see it converted to their display currency.')
                                    ->numeric()
                                    ->minValue(0)
                                    ->prefix('$')
                                    ->requiredIf('charge_delivery', true)
                                    ->columnSpanFull()
                                    ->visibleJs(<<<'JS'
                                        $get('online_ordering_active') && $get('charge_delivery')
                                        JS),
                            ]),

                        Tab::make('Checkout')
                            ->icon(Heroicon::OutlinedShoppingCart)
                            ->schema([
                                Toggle::make('require_full_name')
                                    ->label('Require full name')
                                    ->helperText('Ask for the customer\'s name before they can send the order.')
                                    ->default(false)
                                    ->columnSpanFull(),

                                Toggle::make('require_phone_number')
                                    ->label('Require phone number')
                                    ->helperText('Ask for the customer\'s phone number before they can send the order.')
                                    ->default(false)
                                    ->columnSpanFull(),

                                Toggle::make('get_client_location')
                                    ->label('Ask for the customer\'s location')
                                    ->helperText('Requests the browser location and attaches a map link to the order. If it can\'t be captured, the customer is asked to share it in the chat instead.')
                                    ->default(false)
                                    ->columnSpanFull(),
                            ]),

                        Tab::make('WhatsApp button')
                            ->icon(Heroicon::OutlinedChatBubbleLeftRight)
                            ->schema([
                                Toggle::make('show_whatsapp_badge')
                                    ->label('Show WhatsApp button')
                                    ->helperText('Shows a floating WhatsApp button on the menu so customers can message you.')
                                    ->default(false)
                                    ->columnSpanFull(),

                                TextInput::make('whatsapp_badge_number')
                                    ->label('WhatsApp number')
                                    ->helperText('Messages from the button go to this number. Include the country code.')
                                    ->tel()
                                    ->maxLength(255)
                                    ->requiredIf('show_whatsapp_badge', true)
                                    ->columnSpanFull()
                                    ->visibleJs(<<<'JS'
                                        $get('show_whatsapp_badge')
                                        JS),
                            ]),

                        Tab::make('Social')
                            ->icon(Heroicon::OutlinedShare)
                            ->schema([
                                Repeater::make('social_links')
                                    ->label('Social links')
                                    ->helperText('These appear in the menu footer. Each platform can be added once.')
                                    ->addActionLabel('Add link')
                                    ->defaultItems(0)
                                    ->maxItems(count(SocialPlatform::cases()))
                                    ->columnSpanFull()
                                    ->itemLabel(function (array $state): ?string {
                                        $platform = $state['platform'] ?? null;

                                        if ($platform instanceof SocialPlatform) {
                                            return $platform->getLabel();
                                        }

                                        return is_string($platform)
                                            ? SocialPlatform::tryFrom($platform)?->getLabel()
                                            : null;
                                    })
                                    ->schema([
                                        Select::make('platform')
                                            ->label('Platform')
                                            ->options(SocialPlatform::class)
                                            ->required()
                                            ->disableOptionsWhenSelectedInSiblingRepeaterItems()
                                            ->columnSpanFull(),

                                        TextInput::make('url')
                                            ->label('Link')
                                            ->url()
                                            ->required()
                                            ->maxLength(255)
                                            ->columnSpanFull(),
                                    ]),
                            ]),
                    ]),
            ]);
    }
}
