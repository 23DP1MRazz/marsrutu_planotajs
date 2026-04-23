<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('transport_vehicles');
    }

    public function down(): void
    {
        Schema::create('transport_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('courier_user_id')->unique()->constrained('couriers', 'user_id')->cascadeOnDelete();
            $table->string('type', 32);
            $table->unsignedInteger('cap_weight_kg')->nullable();
            $table->unsignedInteger('cap_volume_l')->nullable();
            $table->timestamps();
        });
    }
};
