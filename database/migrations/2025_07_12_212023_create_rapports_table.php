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
        Schema::create('rapports', function (Blueprint $table) {
            $table->id('id_rapport');
            $table->unsignedBigInteger('id_user');
            $table->foreign('id_user')->references('id_user')->on('utilisateurs')->onDelete('cascade');
            $table->string('cheminFichier');
            // cheminFichier is the path to the report file, which is stored in the filesystem.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapports');
    }
};
