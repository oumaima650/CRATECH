<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ValidateurController extends Controller
{
    public function dashboard()
    {
        $path = resource_path('views/validateur/dashboard.html');
        if (file_exists($path)) {
            return response(file_get_contents($path))->header('Content-Type', 'text/html');
        }
        abort(404);
    }
}
