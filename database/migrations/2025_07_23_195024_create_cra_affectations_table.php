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
        Schema::create('cra_affectations', function (Blueprint $table) {
            $table->id('id_affectation');
            $table->unsignedBigInteger('id_CRA');
            $table->foreign('id_CRA')->references('id_CRA')->on('c_r_a_s')->onDelete('cascade');
            $table->unsignedBigInteger('id_validateur')->nullable();
            $table->foreign('id_validateur')->references('id_user')->on('utilisateurs')->onDelete('cascade');
            $table->date('date_affectation'); 
            $table->boolean('actif')->default(true); // Assuming 'actif' indicates if the assignment is active
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cra_affectations');
    }
};
