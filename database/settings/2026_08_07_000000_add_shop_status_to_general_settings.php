<?php

use App\Enums\ShopStatusMode;
use App\Settings\GeneralSettings;
use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.status_mode', ShopStatusMode::MANUAL->value);
        $this->migrator->add('general.is_open', true);
        $this->migrator->add('general.opening_hours', GeneralSettings::defaultOpeningHours());
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.opening_hours');
        $this->migrator->deleteIfExists('general.is_open');
        $this->migrator->deleteIfExists('general.status_mode');
    }
};
