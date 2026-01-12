<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRATECH - Création de compte</title>
</head>
<body>
    <p>CRATECH</p>
    <p>Bienvenue 🎉</p>

    <p>Bonjour {{ $user->nom_user }} !</p>
    <p>Votre compte CRATECH a été créé avec succès.</p>

    <p>Votre Identifiant</p>
    <p>CRATECH - {{ $userId }}</p>

    <p>Vos informations :</p>
    <p>ID Utilisateur : {{ $userId }}</p>
    <p>Email : {{ $user->email_user }}</p>
    <p>Mot de passe temporaire : {{ $password }}</p>

    

    <p>⚠️ Conservez précieusement ces informations.</p>
</body>
</html>
