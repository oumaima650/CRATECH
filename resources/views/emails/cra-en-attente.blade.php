<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRATECH - CRA en attente</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #eee;">
        <div style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;">
            <span style="padding:6px 10px; border-radius:20px; background:#DBEAFE; color:#1E40AF; font-weight:600; font-size:12px;">Notification</span>
        </div>

        <div style="margin-top: 8px;">
            <h3 style="color:#111827;">CRA en attente de validation</h3>
            <p style="color:#374151; line-height:1.6;">
                Bonjour,<br>
                Un CRA de l'utilisateur <strong>{{ $userName ?? 'Utilisateur' }}</strong> (ID <strong>{{ $userId }}</strong>) est <strong>en attente de validation</strong>.
                @if($month && $year)
                    <br> Période: <strong>{{ $month }}/{{ $year }}</strong>
                @endif
            </p>

            <div style="padding:16px; border:2px solid #3B82F6; border-radius:8px; background:#EFF6FF; margin: 16px 0;">
                <p style="margin:0; color:#1F2937;">
                    Veuillez vous connecter à votre espace validateur pour consulter le CRA et effectuer l'action requise.
                </p>
            </div>

            @if($craId)
            <p style="margin:0 0 16px 0; font-size:14px; color:#6B7280;">ID CRA: <strong>{{ $craId }}</strong></p>
            @endif


            <p style="font-size:12px; color:#6B7280; margin-top: 16px;">
                Ceci est un e-mail automatique, merci de ne pas y répondre.
            </p>
        </div>
    </div>
</body>
</html>