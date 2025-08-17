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
       Schema::create('user__acts', function (Blueprint $table) {
    $table->bigIncrements('id_assignement');
    
    $table->unsignedBigInteger('id_user');
    $table->foreign('id_user')->references('id_user')->on('utilisateurs')->onDelete('cascade');

    $table->unsignedBigInteger('id_activité');
    $table->foreign('id_activité')->references('id_activité')->on('activités')->onDelete('cascade');

    
    $table->string('role_projet');
    $table->enum('status', ['actif', 'inactif'])->default('actif');
    $table->integer('total_travaille')->nullable();
    
    $table->timestamps();
});
    }

        

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user__acts');
    }
};
