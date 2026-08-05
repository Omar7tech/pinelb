<?php

use App\Enums\PriceDisplay;
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
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.show_banner');
        $this->migrator->deleteIfExists('general.banner_text');
        $this->migrator->deleteIfExists('general.show_lbp_prices');
        $this->migrator->deleteIfExists('general.lbp_exchange_rate');
        $this->migrator->deleteIfExists('general.price_display');
        $this->migrator->deleteIfExists('general.online_ordering_active');
        $this->migrator->deleteIfExists('general.whatsapp_number');
        $this->migrator->deleteIfExists('general.show_whatsapp_badge');
        $this->migrator->deleteIfExists('general.whatsapp_badge_number');
        $this->migrator->deleteIfExists('general.social_links');
    }
};
