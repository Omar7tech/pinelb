/**
 * Build a WhatsApp deep link for a number and a pre-filled message. The number
 * is reduced to digits because wa.me rejects spaces, dashes and a leading `+`.
 */
export function buildWhatsAppUrl(number: string, message: string): string {
    const digits = number.replace(/\D/g, '');

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
