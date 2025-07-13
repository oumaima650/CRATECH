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
        Schema::create('rapport_annuels', function (Blueprint $table) {
            $table->id('rapport_annuel_id');
            $table->unsignedBigInteger('id_user');
            $table->string('chemin_fichier');
            $table->foreign('id_user')->references('id_user')->on('utilisateurs')->onDelete('cascade');
            $table->year('annee'); // Optional field for the year of the report
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapport_annuels');
    }
};
