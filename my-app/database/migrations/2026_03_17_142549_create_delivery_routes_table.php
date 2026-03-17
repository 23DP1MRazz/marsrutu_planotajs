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
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('courier_user_id')->constrained('couriers', 'user_id')->cascadeOnDelete();
            $table->date('date');
            $table->string('status', 32)->default('PLANNED');
            $table->timestamps();

            $table->unique(['organization_id', 'courier_user_id', 'date']);
            $table->index(['organization_id', 'status', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
