// Mapping des devises vers leurs symboles
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  FCFA: 'FCFA',
  CAD: 'CAD$',
  JPY: '¥',
}

// Mapping des devises vers leurs positions (avant ou après le montant)
const CURRENCY_POSITION: Record<string, 'before' | 'after'> = {
  EUR: 'after',
  USD: 'before', 
  GBP: 'before',
  CHF: 'after',
  FCFA: 'after',
  CAD: 'before',
  JPY: 'before',
}

// Mapping des devises vers leurs décimales par défaut
const CURRENCY_DECIMALS: Record<string, number> = {
  EUR: 2,
  USD: 2,
  GBP: 2,
  CHF: 2,
  FCFA: 0, // FCFA ne prend généralement pas de décimales
  CAD: 2,
  JPY: 0,
}

/**
 * Formate un montant avec la devise appropriée
 * @param amount - Le montant à formater
 * @param currency - Le code de la devise (EUR, USD, etc.)
 * @param decimals - Nombre de décimales (optionnel, utilise les défauts par devise)
 * @returns Le montant formaté avec le symbole de devise
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'EUR', 
  decimals?: number
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const position = CURRENCY_POSITION[currency] || 'after'
  const defaultDecimals = CURRENCY_DECIMALS[currency] ?? 2
  const finalDecimals = decimals !== undefined ? decimals : defaultDecimals
  
  const formattedAmount = amount.toFixed(finalDecimals)
  
  if (position === 'before') {
    return `${symbol}${formattedAmount}`
  } else {
    // Ajouter un espace avant FCFA
    const separator = currency === 'FCFA' ? ' ' : ''
    return `${formattedAmount}${separator}${symbol}`
  }
}

/**
 * Formate un montant avec un signe (+ ou -) et la devise
 */
export function formatCurrencyWithSign(
  amount: number,
  currency: string = 'EUR',
  decimals?: number
): string {
  const sign = amount >= 0 ? '+' : ''
  return `${sign}${formatCurrency(amount, currency, decimals)}`
}

/**
 * Obtient le symbole d'une devise
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency
}

/**
 * Obtient le nom complet d'une devise pour l'affichage
 */
export function getCurrencyName(currency: string): string {
  const names: Record<string, string> = {
    EUR: 'Euro',
    USD: 'Dollar américain',
    GBP: 'Livre sterling',
    CHF: 'Franc suisse',
    FCFA: 'Franc CFA',
    CAD: 'Dollar canadien',
    JPY: 'Yen japonais',
  }
  return names[currency] || currency
} 