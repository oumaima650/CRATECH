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
        Schema::create('c_r_a_s', function (Blueprint $table) {
            $table->id('id_CRA');
            $table->unsignedBigInteger('id_user');
            $table->date('dateMois');
            $table->enum('status' ,['en_attente', 'valide', 'refuse'])->default('en_attente');
            $table->timestamp('submittedAT')->nullable();
            // submittedAT is nullable to allow for cases where the CRA has not yet been submitted.
            $table->timestamps();
            $table->foreign('id_user')->references('id_user')->on('utilisateurs')->onDelete('cascade');
            // onDelete('cascade') ensures that when a user is deleted, their associated CRA is
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('c_r_a_s');
    }
};
