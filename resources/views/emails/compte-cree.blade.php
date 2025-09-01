<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Votre compte CRATECH</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 20px;">
        <h2 style="color:#7C3AED;">Bienvenue {{ $user->nom_user }} 🎉</h2>
        <p>Votre compte CRATECH a été créé avec succès.</p>

        <div style="padding:15px; border:2px solid #4caf50; border-radius:5px; background:#e8f5e8; text-align:center;">
            <h3>  Votre Identifiant</h3>
            <p style="font-size:20px; font-weight:bold;">CRATECH - :{{ $userId }}</p>
        </div>

        <h3> Vos informations :</h3>
        <ul>
            <li><strong>ID Utilisateur :</strong> {{ $userId }}</li>
            <li><strong>Email :</strong> {{ $user->email_user }}</li>
            <li><strong>Mot de passe temporaire :</strong> {{ $password }}</li>
        </ul>

        <p style="font-size:12px; color:#666;">⚠️ Conservez précieusement ces informations.</p>
    </div>
</body>
</html>
