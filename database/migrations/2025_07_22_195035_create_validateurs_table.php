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
        Schema::create('validateurs', function (Blueprint $table) {
            $table->id('id_val');
            $table->string('nom_val');
            $table->string('email_val')->unique();
            $table->string('motdepasse_val');
            $table->enum('status' , ['present', 'absent'])->default('present'); 
            $table->unsignedBigInteger('id_groupe');
            $table->foreign('id_groupe')->references('id_groupe')->on('groupes'); // Assuming validateurs belong to a group
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('validateurs');
    }
};
