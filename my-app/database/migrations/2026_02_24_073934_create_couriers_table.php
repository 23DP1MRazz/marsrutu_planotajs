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
        Schema::create('couriers', function (Blueprint $table) {
            // user_id as PK enforces exactly one courier profile per user.
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            // Availability flag for dispatching logic; defaults offline.
            $table->boolean('on_duty')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('couriers');
    }
};
