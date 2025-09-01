<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Utilisateur;

class CompteCreeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $password;
    public $userId;

    public function __construct(Utilisateur $user, $password, $userId)
    {
        $this->user = $user;
        $this->password = $password;
        $this->userId = $userId;
    }

    public function build()
    {
        return $this->subject("Votre compte CRATECH - ID: " . $this->userId)
                    ->view('emails.compte-cree');
    }
}
