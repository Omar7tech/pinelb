<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->inGroup('general', function ($blueprint): void {
            $blueprint->add('map_enabled', false);
            $blueprint->add('map_url', null);
            $blueprint->add('map_iframe_enabled', false);
            $blueprint->add('map_iframe_url', null);
            $blueprint->add('phone_number_enabled', false);
            $blueprint->add('phone_number', null);
        });
    }

    public function down(): void
    {
        $this->migrator->inGroup('general', function ($blueprint): void {
            $blueprint->deleteIfExists('phone_number');
            $blueprint->deleteIfExists('phone_number_enabled');
            $blueprint->deleteIfExists('map_iframe_url');
            $blueprint->deleteIfExists('map_iframe_enabled');
            $blueprint->deleteIfExists('map_url');
            $blueprint->deleteIfExists('map_enabled');
        });
    }
};
