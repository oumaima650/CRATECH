<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AcceuilController;
use App\Http\Controllers\AdminController;

// Route d'accueil
Route::get('/', [AcceuilController::class, 'index'])->name('accueil');

// Routes d'authentification
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.forgot');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Route pour récupérer le token CSRF
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

// Routes protégées par authentification
Route::middleware(['auth'])->group(function () {
    
    // Routes pour les administrateurs
    Route::middleware(['auth'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
        Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
        Route::get('/users/create', [AdminController::class, 'createUser'])->name('admin.users.create');
        Route::post('/users', [AdminController::class, 'storeUser'])->name('admin.users.store');
        Route::get('/users/{id}/edit', [AdminController::class, 'editUser'])->name('admin.users.edit');
        Route::put('/users/{id}', [AdminController::class, 'updateUser'])->name('admin.users.update');
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser'])->name('admin.users.delete');
        
        // Autres routes admin
        Route::get('/validators', [AdminController::class, 'validators'])->name('admin.validators');
        Route::get('/assignments', [AdminController::class, 'assignments'])->name('admin.assignments');
        Route::get('/reporting', [AdminController::class, 'reporting'])->name('admin.reporting');
        Route::get('/cra', [AdminController::class, 'cra'])->name('admin.cra');
        Route::get('/projects', [AdminController::class, 'projects'])->name('admin.projects');
        Route::get('/profile', [AdminController::class, 'profile'])->name('admin.profile');
    });
    
    // Routes pour les employés
    Route::middleware(['auth'])->prefix('employe')->group(function () {
        Route::get('/dashboard', function () {
            return view('employe.dashboard');
        })->name('employe.dashboard');
    });
    
    // Routes pour les validateurs
    Route::middleware(['auth'])->prefix('validateur')->group(function () {
        Route::get('/dashboard', function () {
            return view('validateur.dashboard');
        })->name('validateur.dashboard');
    });
});

// Routes pour les vues HTML directes
Route::get('/auth/login', function () {
    return view('auth.login');
})->name('auth.login');

Route::get('/auth/register', function () {
    return view('auth.register');
})->name('auth.register');

// Route de fallback
Route::fallback(function () {
    return redirect('/login');
});

// Routes pour les ressources statiques
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