<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('keycloak.login');
});
Route::middleware(['auth', 'checkRole:administrateur'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
});

Route::middleware(['auth', 'checkRole:validateur'])->group(function () {
    Route::get('/validateur/dashboard', [ValidateurController::class, 'index'])->name('validateur.dashboard');
});

Route::middleware(['auth', 'checkRole:employé'])->group(function () {
    Route::get('/employe/dashboard', [EmployeController::class, 'index'])->name('employe.dashboard');
});
Route::get('/mot-de-passe-oublie', [AuthController::class, 'motDePasseOublie'])->name('password.forgot');

