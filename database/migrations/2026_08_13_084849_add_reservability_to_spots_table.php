<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Not everything on the plan is bookable: the parking, the WC and the
     * playground are landmarks customers read the map by. They keep a pin and a
     * name, but no price and no reserve action — so the price becomes optional
     * too, since a bookable spot may also be quoted on request.
     */
    public function up(): void
    {
        Schema::table('spots', function (Blueprint $table) {
            $table->boolean('is_reservable')->default(true)->after('is_reserved');
            $table->decimal('price', 8, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('spots', function (Blueprint $table) {
            $table->dropColumn('is_reservable');
            $table->decimal('price', 8, 2)->nullable(false)->change();
        });
    }
};
