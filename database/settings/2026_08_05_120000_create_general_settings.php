<?php

use App\Enums\PriceDisplay;
use App\Enums\ShopStatusMode;
use App\Settings\GeneralSettings;
use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.show_banner', false);
        $this->migrator->add('general.banner_text', 'Welcome to Pine');

        $this->migrator->add('general.show_lbp_prices', false);
        $this->migrator->add('general.lbp_exchange_rate', null);
        $this->migrator->add('general.price_display', PriceDisplay::USD->value);

        $this->migrator->add('general.online_ordering_active', true);
        $this->migrator->add('general.whatsapp_number', null);

        $this->migrator->add('general.show_whatsapp_badge', false);
        $this->migrator->add('general.whatsapp_badge_number', null);

        $this->migrator->add('general.social_links', []);

        $this->migrator->add('general.charge_delivery', false);
        $this->migrator->add('general.delivery_fee', null);

        $this->migrator->add('general.require_full_name', false);
        $this->migrator->add('general.require_phone_number', false);
        $this->migrator->add('general.get_client_location', false);

        $this->migrator->add('general.status_mode', ShopStatusMode::MANUAL->value);
        $this->migrator->add('general.is_open', true);
        $this->migrator->add('general.opening_hours', GeneralSettings::defaultOpeningHours());

        $this->migrator->add('general.map_enabled', false);
        $this->migrator->add('general.map_url', null);
        $this->migrator->add('general.map_iframe_enabled', false);
        $this->migrator->add('general.map_iframe_url', null);
        $this->migrator->add('general.phone_number_enabled', false);
        $this->migrator->add('general.phone_number', null);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.phone_number');
        $this->migrator->deleteIfExists('general.phone_number_enabled');
        $this->migrator->deleteIfExists('general.map_iframe_url');
        $this->migrator->deleteIfExists('general.map_iframe_enabled');
        $this->migrator->deleteIfExists('general.map_url');
        $this->migrator->deleteIfExists('general.map_enabled');
        $this->migrator->deleteIfExists('general.opening_hours');
        $this->migrator->deleteIfExists('general.is_open');
        $this->migrator->deleteIfExists('general.status_mode');
        $this->migrator->deleteIfExists('general.get_client_location');
        $this->migrator->deleteIfExists('general.require_phone_number');
        $this->migrator->deleteIfExists('general.require_full_name');
        $this->migrator->deleteIfExists('general.delivery_fee');
        $this->migrator->deleteIfExists('general.charge_delivery');
        $this->migrator->deleteIfExists('general.social_links');
        $this->migrator->deleteIfExists('general.whatsapp_badge_number');
        $this->migrator->deleteIfExists('general.show_whatsapp_badge');
        $this->migrator->deleteIfExists('general.whatsapp_number');
        $this->migrator->deleteIfExists('general.online_ordering_active');
        $this->migrator->deleteIfExists('general.price_display');
        $this->migrator->deleteIfExists('general.lbp_exchange_rate');
        $this->migrator->deleteIfExists('general.show_lbp_prices');
        $this->migrator->deleteIfExists('general.banner_text');
        $this->migrator->deleteIfExists('general.show_banner');
    }
};
