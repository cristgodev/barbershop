export function formatCurrency(amount: number, currencyCode: string = 'USD') {
    // Attempt to map common currencies to their optimal locales for best display
    const localeMap: Record<string, string> = {
        'USD': 'en-US',
        'MXN': 'es-MX',
        'COP': 'es-CO',
        'EUR': 'es-ES',
        'GBP': 'en-GB',
        'ARS': 'es-AR',
        'CLP': 'es-CL',
        'PEN': 'es-PE',
    };
    
    const locale = localeMap[currencyCode?.toUpperCase()] || undefined;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount));
}
