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
        Schema::create('activités', function (Blueprint $table) {
            $table->id('id_activité');
            $table->string('nom_act');
            $table->text('description')->nullable(); // Optional description for the activity
            $table->enum("status", ['actif', 'inactif']); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activités');
    }
};
