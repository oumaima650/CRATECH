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
        Schema::create('jour_activites', function (Blueprint $table) {
            $table->id('id_day');
            $table->unsignedBigInteger('id_CRA');
            $table->foreign('id_CRA')->references('id_CRA')->on('c_r_a_s')->onDelete('cascade');
            $table->date('date');
            $table->text('description')->nullable(); // description is an optional field to provide details about the day's activities.
            $table->enum('type', ['1', '0' , '0.5'])->default('0'); // Assuming '1' is presence, '0' is absence, and '0,5' is half-day
            $table->unsignedBigInteger('id_activité');
            $table->foreign('id_activité')->references('id_activité')->on('activités')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jour_activites');
    }
};
