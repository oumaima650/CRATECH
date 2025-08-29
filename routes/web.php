<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AcceuilController;


// Redirection vers Keycloak
Route::get('/', [AcceuilController::class, 'index'])->name('accueil.html');

// Route de login Keycloak
Route::get('/login', [AuthController::class, 'redirectToKeycloak'])->name('login');

// Route de callback Keycloak (TRÈS IMPORTANTE)
Route::get('/callback', [AuthController::class, 'handleCallback'])->name('keycloak.callback');

// Route mot de passe oublié
Route::get('/mot-de-passe-oublie', [AuthController::class, 'motDePasseOublie'])->name('password.forgot');

// Routes protégées
Route::middleware(['auth', 'checkRole:administrateur'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
});

Route::middleware(['auth', 'checkRole:validateur'])->group(function () {
    Route::get('/validateur/dashboard', [ValidateurController::class, 'index'])->name('validateur.dashboard');
});

Route::middleware(['auth', 'checkRole:employé'])->group(function () {
    Route::get('/employe/dashboard', [EmployeController::class, 'index'])->name('employe.dashboard');
});
// Route temporaire pour voir les logs - À SUPPRIMER EN PRODUCTION
Route::get('/logs', [AuthController::class, 'showLogs']);
// routes/web.php - Ajoutez ces routes
Route::get('/css/{file}', function ($file) {
    $path = resource_path('css/' . $file);
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/css');
    }
    abort(404);
});

Route::get('/js/{file}', function ($file) {
    $path = resource_path('js/' . $file);
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'application/javascript');
    }
    abort(404);
});

Route::get('/img/{file}', function ($file) {
    $path = resource_path('img/' . $file);
    if (file_exists($path)) {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        return response(file_get_contents($path))->header('Content-Type', 'image/' . $extension);
    }
    abort(404);
});