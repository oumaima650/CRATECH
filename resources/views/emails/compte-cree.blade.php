<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRATECH - Création de compte</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #eee;">
        <div style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;">
            <h2 style="color:#3B82F6; margin:0; display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:36px; height:36px; border-radius:10px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800;">C</span>
                <span>CRATECH</span>
            </h2>
            <span style="padding:6px 10px; border-radius:20px; background:#DBEAFE; color:#1E40AF; font-weight:600; font-size:12px;">Bienvenue 🎉</span>
        </div>

        <div style="margin-top: 8px;">
            <h3 style="color:#111827; margin:0 0 8px 0;">Bonjour {{ $user->nom_user }} !</h3>
            <p style="color:#374151; line-height:1.6;">
                Votre compte CRATECH a été <strong>créé avec succès</strong>.
            </p>

            <div style="padding:16px; border:2px solid #3B82F6; border-radius:8px; background:#EFF6FF; margin: 16px 0; text-align:center;">
                <h4 style="margin:0 0 6px 0; color:#1F2937;">Votre Identifiant</h4>
                <p style="margin:0; font-size:20px; font-weight:800; color:#111827;">CRATECH - {{ $userId }}</p>
            </div>

            <h4 style="color:#111827; margin:12px 0 6px 0;">Vos informations</h4>
            <ul style="margin:0 0 10px 18px; color:#374151;">
                <li><strong>ID Utilisateur :</strong> {{ $userId }}</li>
                <li><strong>Email :</strong> {{ $user->email_user }}</li>
                <li><strong>Mot de passe temporaire :</strong> {{ $password }}</li>
            </ul>

            <a href="{{ url('/login') }}" style="display:inline-block; text-decoration:none; background:#3B82F6; color:#fff; padding:10px 16px; border-radius:8px; font-weight:700;">Se connecter</a>

            <p style="font-size:12px; color:#6B7280; margin-top: 16px;">
                ⚠️ Conservez précieusement ces informations.
            </p>
        </div>
    </div>
</body>
</html>
