<?php

namespace App\Http\Controllers;

use App\Models\CRA;
use App\Models\JourActivite;
use App\Models\Activité;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EmployeController extends Controller
{
    public function dashboard()
    {
        $path = resource_path('views/employe/dashboard.html');
        if (file_exists($path)) {
            return response(file_get_contents($path))->header('Content-Type', 'text/html');
        }
        abort(404);
    }

    public function saveCra(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'entries' => 'required|array',
        ]);

        $user = Auth::user();
        $year = (int) $request->year;
        $month = (int) $request->month;
        $firstOfMonth = sprintf('%04d-%02d-01', $year, $month);

        // Ensure an activity exists; use first active or create a generic one
        $activity = Activité::first();
        if (!$activity) {
            $activity = Activité::create([
                'nom_act' => 'Activité Générique',
                'description' => 'Activité par défaut pour le CRA',
                'status' => 'actif',
            ]);
        }

        // Create or get CRA for this month
        $cra = CRA::firstOrCreate([
            'id_user' => $user->id_user,
            'dateMois' => $firstOfMonth,
        ], [
            'status' => 'en_attente',
        ]);

        // Remove existing day entries for this CRA/month (simpler reconciliation)
        JourActivite::where('id_CRA', $cra->id_CRA)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->delete();

        $payload = [];
        foreach ($request->entries as $date => $value) {
            if (!in_array((string) $value, ['0', '0.5', '1'], true)) {
                continue;
            }
            // Store only non-zero values
            if ((string) $value === '0') {
                continue;
            }

            $payload[] = [
                'id_CRA' => $cra->id_CRA,
                'date' => $date,
                'description' => null,
                'type' => (string) $value,
                'id_activité' => $activity->id_activité,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($payload)) {
            JourActivite::insert($payload);
        }

        return response()->json([
            'success' => true,
            'message' => 'CRA sauvegardé. N\'oubliez pas de cliquer sur « sauvegarder » après vos modifications.',
        ]);
    }
}


