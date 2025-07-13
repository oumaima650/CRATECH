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
        Schema::create('rapport_mensuels', function (Blueprint $table) {
            $table->id('rapport_mensuel_id');
            $table->unsignedBigInteger('id_CRA');
            $table->string('chemin_fichier');
            $table->foreign('id_CRA')->references('id_CRA')->on('c_r_a_s')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapport_mensuels');
    }
};
