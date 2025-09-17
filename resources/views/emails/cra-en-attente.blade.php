<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRATECH - CRA en attente</title>
</head>
<body>
    <p>Notification</p>

    <p>CRA en attente de validation</p>
    <p>
        Bonjour,<br>
        Un CRA de l'utilisateur {{ $userName ?? 'Utilisateur' }} (ID {{ $userId }}) est en attente de validation.
        @if($month && $year)
            <br>Période: {{ $month }}/{{ $year }}
        @endif
    </p>

    <p>
        Veuillez vous connecter à votre espace validateur pour consulter le CRA et effectuer l'action requise.
    </p>

    @if($craId)
    <p>ID CRA: {{ $craId }}</p>
    @endif

    <p>Ceci est un e-mail automatique, merci de ne pas y répondre.</p>
</body>
</html>
