export function formatCurrency(amount: number, currencyCode: string = 'USD') {
    const code = (currencyCode || 'USD').toUpperCase();
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
    
    const locale = localeMap[code] || undefined;
    
    // Currencies that practically never use cents in pricing UI
    const zeroDecimalCurrencies = ['COP', 'CLP', 'ARS', 'JPY', 'KRW', 'PYG'];
    const fractions = zeroDecimalCurrencies.includes(code) ? 0 : 2;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: fractions,
        maximumFractionDigits: fractions
    }).format(Number(amount));
}
