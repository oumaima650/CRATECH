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
        $table->morphs('destinataire'); // => destinataire_id + destinataire_type
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
