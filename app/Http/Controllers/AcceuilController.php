<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AcceuilController extends Controller
{
    /**
     * Afficher la page d'accueil
     */
    public function index()
    {
        return view('accueil');
    }
}