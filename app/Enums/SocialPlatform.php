<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

/**
 * The social networks that can be linked from the storefront footer.
 */
enum SocialPlatform: string implements HasLabel
{
    case INSTAGRAM = 'instagram';
    case FACEBOOK = 'facebook';
    case WHATSAPP = 'whatsapp';
    case TIKTOK = 'tiktok';

    public function getLabel(): string
    {
        return match ($this) {
            self::INSTAGRAM => 'Instagram',
            self::FACEBOOK => 'Facebook',
            self::WHATSAPP => 'WhatsApp',
            self::TIKTOK => 'TikTok',
        };
    }

    /**
     * The public path to this platform's icon, served from `public/social-icons`.
     */
    public function getIconPath(): string
    {
        return "/social-icons/{$this->value}.svg";
    }
}
