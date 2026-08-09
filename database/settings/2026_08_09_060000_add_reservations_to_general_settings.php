<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.reservations_active', true);
        $this->migrator->add('general.reservation_phone_number', '+96171387946');
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.reservation_phone_number');
        $this->migrator->deleteIfExists('general.reservations_active');
    }
};
