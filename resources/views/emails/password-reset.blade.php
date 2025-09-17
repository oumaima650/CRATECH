<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>CRATECH - Nouveau mot de passe</title>
</head>
<body>
    <p>CRATECH - Sécurité</p>

    <p>Nouveau mot de passe généré</p>
    <p>Bonjour {{ $user->nom_user }},</p>

    <p>Suite à votre demande, un nouveau mot de passe vient d'être généré pour votre compte.</p>

    <p>Mot de passe temporaire: {{ $password }}</p>

    <p>Veuillez retourner sur la page de récupération et saisir ce mot de passe dans la fenêtre de vérification. 
    Une fois validé, vous pourrez vous connecter avec ce mot de passe.</p>

    <p>Si vous n'êtes pas à l'origine de cette demande, nous vous recommandons de sécuriser votre compte et de nous contacter.</p>

    <p>&copy; 2025 CRATECH. Tous droits réservés.</p>
</body>
</html>
