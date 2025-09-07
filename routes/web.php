<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AcceuilController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\ValidateurController;
use App\Models\Utilisateur;

// Route d'accueil
Route::get('/', [AcceuilController::class, 'index'])->name('accueil');

// Page utilisateurs HTML publique (pas d'auth)
Route::get('/admin/users.html', function () {
    $path = resource_path('views/admin/users.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page création utilisateur HTML publique (pas d'auth)
Route::get('/admin/users/create.html', function () {
    $path = resource_path('views/admin/users/create.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page activités HTML publique (pas d'auth)
Route::get('/admin/activities.html', function () {
    $path = resource_path('views/admin/activities.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page création activité HTML publique (pas d'auth)
Route::get('/admin/activities/create.html', function () {
    $path = resource_path('views/admin/activities/create.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page dashboard HTML publique (pas d'auth)
Route::get('/admin/dashboard.html', function () {
    $path = resource_path('views/admin/dashboard.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});
// API publique pour lister les utilisateurs (lecture seule)
Route::get('/api/public/users', function () {
    $users = Utilisateur::orderBy('created_at', 'desc')
        ->get(['id_user', 'nom_user', 'email_user', 'role', 'status', 'created_at']);
    return response()->json([
        'users' => $users,
    ]);
});

// API publique pour lister les activités (lecture seule)
Route::get('/api/public/activities', function () {
    $activities = \App\Models\Activité::withCount('assignements')
        ->orderBy('created_at', 'desc')
        ->get(['id_activité', 'nom_act', 'description', 'status', 'created_at']);
    
    // Ajouter le nombre d'utilisateurs assignés
    $activities->each(function ($activity) {
        $activity->assigned_users = $activity->assignements_count;
    });
    
    return response()->json([
        'activities' => $activities,
    ]);
});

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
    
   Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    
    // REMPLACE la fonction anonyme par l'appel à ta méthode du contrôleur
    Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    
    Route::get('/api/users', [AdminController::class, 'getUsersData'])->name('admin.api.users');
    Route::get('/users/create', [AdminController::class, 'createUser'])->name('admin.users.create');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('admin.users.store');
    Route::get('/users/{id}/edit', [AdminController::class, 'editUser'])->name('admin.users.edit');
    Route::get('/api/users/{id}', [AdminController::class, 'getUserData'])->name('admin.api.user');
    Route::put('/users/{id}', [AdminController::class, 'updateUser'])->name('admin.users.update');
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser'])->name('admin.users.delete');
    
    // Routes pour les activités
    Route::get('/activities', [AdminController::class, 'activities'])->name('admin.activities');
    Route::get('/activities/create', [AdminController::class, 'createActivity'])->name('admin.activities.create');
    Route::post('/activities', [AdminController::class, 'storeActivity'])->name('admin.activities.store');
    Route::get('/activities/{id}/edit', [AdminController::class, 'editActivity'])->name('admin.activities.edit');
    Route::put('/activities/{id}', [AdminController::class, 'updateActivity'])->name('admin.activities.update');
    Route::delete('/activities/{id}', [AdminController::class, 'deleteActivity'])->name('admin.activities.delete');
        
        

        // Routes pour les validateurs
        Route::get('/validators', [AdminController::class, 'validators'])->name('admin.validators');
        Route::get('/api/validators', [AdminController::class, 'getValidatorsData'])->name('admin.api.validators');
        Route::get('/validators/create', [AdminController::class, 'createValidator'])->name('admin.validators.create');
        Route::post('/validators', [AdminController::class, 'storeValidator'])->name('admin.validators.store');
        Route::get('/validators/{id}/edit', [AdminController::class, 'editValidator'])->name('admin.validators.edit');
        Route::get('/api/validators/{id}', [AdminController::class, 'getValidatorData'])->name('admin.api.validator');
        Route::put('/validators/{id}', [AdminController::class, 'updateValidator'])->name('admin.validators.update');
        Route::delete('/validators/{id}', [AdminController::class, 'deleteValidator'])->name('admin.validators.delete');
        
        // ... (toutes les autres routes admin restent ici)
    });
    
    // Routes pour les employés
    Route::prefix('employe')->group(function () {
        Route::get('/dashboard', [EmployeController::class, 'dashboard'])->name('employe.dashboard');
        Route::post('/cra/save', [EmployeController::class, 'saveCra'])->name('employe.cra.save');
    });
    
    // Routes pour les validateurs
    Route::prefix('validateur')->group(function () {
        Route::get('/dashboard', [ValidateurController::class, 'dashboard'])->name('validateur.dashboard');
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

// Route de test
Route::get('/admin/test', function () {
    $html = file_get_contents(resource_path('views/admin/test.html'));
    return response($html)->header('Content-Type', 'text/html; charset=utf-8');
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