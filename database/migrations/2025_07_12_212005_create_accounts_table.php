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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id('id_account');
            $table->unsignedBigInteger('id_user');
            $table->date('dateCreation'); 
            $table->string('MotDePasseTemp')->nullable();
            // MotDePasseTemp is a temporary password field, can be null if not set in case the user wants to reset or delete their password.
            $table->boolean('actif')->default(true);
            $table->timestamps();
            $table->foreign('id_user')->references('id_user')->on('utilisateurs')->onDelete('cascade');
            //onDelete('cascade') ensures that when a user is deleted, their associated account is also deleted.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
