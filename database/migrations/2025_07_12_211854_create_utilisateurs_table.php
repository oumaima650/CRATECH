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
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->bigIncrements('id_user');
            $table->string('nom_user');
            $table->string('email_user')->unique()->nullable();
            $table->string('motdepasse_user');
            $table->enum('role', ['employé', 'sous-traitant', 'validateur' ,'administrateur']); // Assuming 'employé' is the default role
            $table->enum('status', ['actif', 'inactif'])->nullable(); 
            $table->unsignedBigInteger('id_validateur')->nullable();
            $table->foreign('id_validateur')->references('id_user')->on('utilisateurs')->nullOnDelete();
            $table->timestamps();
        });
    }
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};
