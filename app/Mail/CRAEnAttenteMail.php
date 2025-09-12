<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CRAEnAttenteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userId;
    public $userName;
    public $month;
    public $year;
    public $craId;

    /**
     * Create a new message instance.
     */
    public function __construct($userId, $userName, $craId = null, $month = null, $year = null)
    {
        $this->userId = $userId;
        $this->userName = $userName;
        $this->craId = $craId;
        $this->month = $month;
        $this->year = $year;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('CRATECH - CRA en attente de validation')
            ->view('emails.cra-en-attente');
    }
}
