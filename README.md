# 🎯 BettingTipsPros - Application PWA de Suivi de Paris Sportifs

Application moderne de suivi et d'analyse de paris sportifs avec intelligence artificielle, développée avec Next.js 15 et Supabase.

## ✨ Fonctionnalités

### 🚀 Core Features
- **📱 PWA** - Installation native sur mobile et desktop
- **📸 OCR Intelligent** - Extraction automatique des données de tickets via IA (Groq)
- **📊 Analytics Avancées** - Statistiques et graphiques de performance
- **💾 Mode Hors Ligne** - Fonctionnement sans connexion internet
- **🔔 Notifications Push** - Alertes de résultats en temps réel

### 🎪 Interface Utilisateur
- **🎨 Design Moderne** - Interface élégante avec Tailwind CSS
- **🌓 Mode Sombre/Clair** - Thème adaptatif
- **📱 Responsive** - Optimisé pour tous les écrans
- **⚡ Animations Fluides** - Transitions et micro-interactions

### 🔐 Sécurité & Performance
- **🛡️ Authentification Supabase** - Connexion sécurisée
- **⚡ Optimisations Next.js 15** - Performance maximale
- **🔒 Données Chiffrées** - Protection des informations sensibles

## 🛠️ Stack Technologique

### Frontend
- **Next.js 15** - Framework React avec App Router
- **React 19** - Interface utilisateur moderne
- **TypeScript** - Typage statique pour la robustesse
- **Tailwind CSS** - Framework CSS utilitaire
- **Shadcn/ui** - Composants UI de qualité

### Backend & Base de Données
- **Supabase** - Backend-as-a-Service complet
- **PostgreSQL** - Base de données relationnelle
- **Row Level Security** - Sécurité au niveau des données

### IA & Analyse
- **Groq** - API IA pour OCR des tickets de paris
- **Recharts** - Graphiques et visualisations
- **Zod** - Validation de schémas TypeScript

### DevOps & Déploiement
- **Vercel** - Plateforme de déploiement optimisée
- **pnpm** - Gestionnaire de paquets performant
- **ESLint + Prettier** - Qualité de code

## 🚦 Installation & Développement

### Prérequis
```bash
Node.js 18+
pnpm (recommandé)
Compte Supabase
Clé API Groq
```

### Configuration Locale

1. **Cloner le repository**
```bash
git clone https://github.com/alino229-full/bettingpros.git
cd bettingpros
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configuration des variables d'environnement**
```bash
cp env.example .env.local
```

Remplir les variables dans `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

4. **Lancer en développement**
```bash
pnpm dev
```

## 📱 PWA - Installation

L'application peut être installée comme une app native :

1. **Mobile (iOS/Android)** : Ouvrir dans Safari/Chrome → "Ajouter à l'écran d'accueil"
2. **Desktop** : Clic sur l'icône d'installation dans la barre d'adresse
3. **Notifications** : Autoriser les notifications pour les alertes de résultats

## 🎯 Utilisation

### 📸 Capture de Paris
1. Prendre une photo du ticket de pari
2. L'IA extrait automatiquement les informations
3. Vérifier et corriger si nécessaire
4. Valider pour enregistrer

### 📊 Analyse des Performances
- **Tableau de bord** : Vue d'ensemble de vos performances
- **Historique détaillé** : Tous vos paris avec filtres
- **Statistiques avancées** : Taux de réussite par type de pari
- **Graphiques** : Évolution des gains/pertes dans le temps

### ⚙️ Paramètres
- Configuration du profil utilisateur
- Préférences de notifications
- Export des données (CSV)

## 🏗️ Architecture

```
bettingtispros/
├── app/                    # App Router Next.js 15
│   ├── (auth)/            # Authentification
│   ├── api/               # API Routes
│   ├── capture/           # Capture de tickets
│   ├── history/           # Historique
│   ├── analysis/          # Analyses
│   └── settings/          # Paramètres
├── components/            # Composants réutilisables
│   ├── ui/               # Composants de base
│   ├── auth/             # Authentification
│   ├── capture/          # Capture
│   └── dashboard/        # Tableau de bord
├── lib/                  # Utilitaires et types
│   ├── supabase/         # Configuration Supabase
│   ├── types/            # Types TypeScript
│   └── utils/            # Fonctions utilitaires
├── hooks/                # Hooks React personnalisés
├── public/               # Assets statiques
└── styles/               # Styles globaux
```

## 🔄 CI/CD

Le déploiement est automatisé via Vercel :
- **Preview** : Chaque pull request génère un environnement de preview
- **Production** : Déploiement automatique sur merge vers `main`
- **Performance** : Lighthouse CI intégré

## 📈 Roadmap

### Version 1.1
- [ ] Intégration API résultats sportifs en temps réel
- [ ] Prédictions IA basées sur l'historique
- [ ] Mode multi-comptes

### Version 1.2
- [ ] Partage social des performances
- [ ] Groupes et compétitions entre amis
- [ ] Export PDF des rapports

### Version 2.0
- [ ] Intégration directe bookmakers
- [ ] Système de recommandations IA
- [ ] Application mobile native

## 👥 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créer une branch feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos modifications (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branch (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- 📧 Email : support@bettingtipspros.com
- 💬 Discord : [Serveur de support](https://discord.gg/bettingtipspros)
- 📖 Documentation : [docs.bettingtipspros.com](https://docs.bettingtipspros.com)

---

**Développé avec ❤️ par [alino229-full](https://github.com/alino229-full)** 