/**
 * Build a WhatsApp deep link for a number, with a message pre-filled when one
 * is given and an empty chat when it isn't. The number is reduced to digits
 * because wa.me rejects spaces, dashes and a leading `+`.
 */
export function buildWhatsAppUrl(number: string, message?: string): string {
    const digits = number.replace(/\D/g, '');
    const url = `https://wa.me/${digits}`;

    return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
