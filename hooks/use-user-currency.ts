import { useAuth } from "@/components/auth/auth-provider"
import { formatCurrency, formatCurrencyWithSign, getCurrencySymbol } from "@/lib/utils/currency"

/**
 * Hook pour utiliser la devise de l'utilisateur connecté
 */
export function useUserCurrency() {
  const { profile } = useAuth()
  const userCurrency = profile?.currency || 'EUR'

  /**
   * Formate un montant avec la devise de l'utilisateur
   */
  const formatAmount = (amount: number, decimals?: number) => {
    return formatCurrency(amount, userCurrency, decimals)
  }

  /**
   * Formate un montant avec signe (+ ou -) et la devise de l'utilisateur
   */
  const formatAmountWithSign = (amount: number, decimals?: number) => {
    return formatCurrencyWithSign(amount, userCurrency, decimals)
  }

  /**
   * Obtient le symbole de la devise de l'utilisateur
   */
  const getCurrencySymbolForUser = () => {
    return getCurrencySymbol(userCurrency)
  }

  return {
    currency: userCurrency,
    formatAmount,
    formatAmountWithSign,
    getCurrencySymbol: getCurrencySymbolForUser,
  }
} 