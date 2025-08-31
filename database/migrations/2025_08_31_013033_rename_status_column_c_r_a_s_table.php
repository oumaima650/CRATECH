
    <?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('_r_a_s', function (Blueprint $table) {
            $table->renameColumn('statut', 'status');
        });
    }

    public function down(): void
    {
        Schema::table('c_r_a_s', function (Blueprint $table) {
            $table->renameColumn('status', 'statut');
        });
    }
};

