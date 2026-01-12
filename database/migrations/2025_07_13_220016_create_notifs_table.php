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
  Schema::create('notifs', function (Blueprint $table) {
    $table->id('id_notif');
    $table->string('message');
    $table->dateTime('dateEnvoi')->nullable();

    // 👇 créer la colonne AVANT la foreign key
    $table->unsignedBigInteger('id_user');

    $table->foreign('id_user')
          ->references('id_user')
          ->on('utilisateurs')
          ->onDelete('cascade');

    $table->timestamps();
});

}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifs');
    }
};
