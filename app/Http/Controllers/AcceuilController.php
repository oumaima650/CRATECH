<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AcceuilController extends Controller
{
    public function index()
    {
        // Chemin vers votre fichier HTML existant
        $htmlContent = file_get_contents(resource_path('views/accueil.html'));
        
        // Correction des chemins des assets
        $htmlContent = str_replace(
            [
                'href="css/', 
                'src="js/',
                'src="img/'
            ],
            [
                'href="' . asset('css/'), 
                'src="' . asset('js/'),
                'src="' . asset('img/')
            ],
            $htmlContent
        );
        
        return response($htmlContent)->header('Content-Type', 'text/html');
    }
}