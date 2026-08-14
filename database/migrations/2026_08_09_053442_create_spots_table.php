<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('spots', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_reserved')->default(false);
            $table->boolean('is_reservable')->default(true);
            $table->unsignedMediumInteger('sort_order')->default(0);
            $table->decimal('price', 8, 2)->nullable();
            $table->decimal('discount_price', 8, 2)->nullable();

            // Where the pin sits on the uploaded map, as a percentage of the
            // image's width and height, so it travels with the image whatever
            // size it is rendered at. A spot without a pin is left null.
            $table->decimal('map_x', 5, 2)->nullable();
            $table->decimal('map_y', 5, 2)->nullable();
            $table->string('pin_color', 7)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spots');
    }
};
