import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Camera, Sun, Smartphone } from "lucide-react"

export function OcrTips() {
  const tips = [
    {
      icon: <Camera className="h-5 w-5 text-blue-500" />,
      title: "Cadrage optimal",
      description: "Centrez le ticket dans l'image et évitez les bords coupés",
    },
    {
      icon: <Sun className="h-5 w-5 text-yellow-500" />,
      title: "Éclairage suffisant",
      description: "Prenez la photo dans un endroit bien éclairé, évitez les ombres",
    },
    {
      icon: <Smartphone className="h-5 w-5 text-green-500" />,
      title: "Stabilité",
      description: "Tenez votre appareil stable pour éviter le flou",
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-purple-500" />,
      title: "Qualité d'image",
      description: "Assurez-vous que le texte est net et lisible",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Conseils pour de meilleurs résultats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            {tip.icon}
            <div>
              <h4 className="font-medium text-sm">{tip.title}</h4>
              <p className="text-xs text-muted-foreground">{tip.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
