<?php

return [
    'base_url' => env('KEYCLOAK_BASE_URL', 'http://localhost:8180'),
    'realm' => env('KEYCLOAK_REALM', 'CRATECH'),
    'client_id' => env('KEYCLOAK_CLIENT_ID', 'cratech-app'),
    'client_secret' => env('KEYCLOAK_CLIENT_SECRET', 'Mako5Mrhpriywd1iJvV4mzScKnqJ8R4L'),
    'redirect_uri' => env('KEYCLOAK_REDIRECT_URI', 'http://localhost:8000/auth/keycloak/callback'),
    
    // API Admin endpoints
    'admin_realm' => env('KEYCLOAK_ADMIN_REALM', 'master'), // Realm pour l'auth admin (souvent master)
    'admin_username' => env('KEYCLOAK_ADMIN_USERNAME', 'admin'),
    'admin_password' => env('KEYCLOAK_ADMIN_PASSWORD', 'admin'),
];
