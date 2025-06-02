import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, History, BarChart3, Settings, Plus, TrendingUp, Clock, Cog } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div>
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-0 md:p-6">
        <Link href="/capture" className="group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nouveau pari</h3>
              <p className="text-blue-100 text-sm">Capturer un ticket ou saisir manuellement</p>
            </div>
          </div>
        </Link>

        <Link href="/history" className="group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <History className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Historique</h3>
              <p className="text-green-100 text-sm">Consulter tous vos paris passés</p>
            </div>
          </div>
        </Link>

        <Link href="/analysis" className="group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-6 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analyses</h3>
              <p className="text-purple-100 text-sm">Statistiques et performances détaillées</p>
            </div>
          </div>
        </Link>

        <Link href="/settings" className="group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Paramètres</h3>
              <p className="text-orange-100 text-sm">Configuration et préférences</p>
            </div>
          </div>
        </Link>
      </CardContent>
    </div>
  )
}
