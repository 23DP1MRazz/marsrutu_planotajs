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
        Schema::create('transport_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('courier_user_id')->unique()->constrained('couriers', 'user_id')->cascadeOnDelete();
            $table->string('type', 32);
            $table->decimal('cap_weight_kg', 8, 2)->default(0);
            $table->decimal('cap_volume_l', 8, 2)->default(0);
            $table->timestamps();

            $table->index(['organization_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transport_vehicles');
    }
};
