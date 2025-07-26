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
            $table->integer('heuresTravaillees'); // heures is the number of hours worked on that day.
            $table->text('description')->nullable(); // description is an optional field to provide details about the day's activities.
            $table->string('projet');
            $table->enum('type', ['présence', 'absence', 'conges', 'maladie', 'teletravail'])->default('absence');
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
