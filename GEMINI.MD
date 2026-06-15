# Guide de Projet & Instructions de Développement — zdmsFacture

Ce fichier sert de documentation de référence et d'historique de conception pour tout futur agent d'IA ou développeur travaillant sur l'application **zdmsFacture**.

---

## 1. Description du Projet (Qu'est-ce que l'application fait ?)
**zdmsFacture** est un logiciel SaaS de facturation premium, moderne et haut de gamme (inspiré des standards Awwwards et Dribbble) conçu pour le marché de la République Démocratique du Congo (RDC). Il permet aux entrepreneurs et aux entreprises de gérer leurs clients, de générer des devis et factures conformes, de suivre les encaissements, de gérer les remboursements/avoirs et de suivre la santé financière générale en temps réel.

L'application gère une double devise fluide (Dollar USD et Franc Congolais CDF) avec un taux de change configurable et applique les règles fiscales standards de la RDC (TVA de 18% par défaut).

---

## 2. Fonctionnalités Implémentées

### A. Dashboard / Overview
- **Indicateurs clés (KPIs)** : Chiffre d'affaires mensuel, factures en attente, clients actifs, taux de recouvrement avec deltas d'évolution par rapport au mois précédent.
- **Statistiques des revenus** : Graphique de barres horizontales dynamique affichant les flux de trésorerie mensuels.
- **Répartition des factures** : Graphique en anneau (donut) montrant le pourcentage de factures par statut.
- **Top Clients** : Classement des meilleurs clients par volume de facturation.
- **Dernières Factures** : Tableau résumé des transactions récentes avec statuts de badges doux et actions directes.

### B. Gestion des Factures (`/invoices`)
- **Liste des Factures** : Tableau avec recherche multi-critères (client, numéro de facture) et filtrage par onglet de statut.
- **Création & Édition de Facture** :
  - Formulaire interactif avec sélection dynamique du client.
  - Gestion de lignes d'articles illimitées (Prestation, Qté, Prix unitaire) avec calcul automatique et arrondi à l'entier.
  - Aperçu A4 temps réel synchronisé pendant la saisie.
  - Boîte de dialogue (Popup) de succès après enregistrement, permettant de retourner à la liste ou d'ouvrir directement le PDF imprimable.
- **Détail d'une Facture** :
  - Vue A4 officielle avec structure émetteur, client, dates, détails de prestations, sous-total, calcul de TVA (18% par défaut), total USD et total indicatif en CDF.
  - Action latérale permettant de modifier le statut en direct (Brouillon, Envoyée, Payée, En retard).
  - Actions d'exportation avec un mode d'impression (`window.print()`) épuré, masquant automatiquement les éléments structurels de l'application (Sidebar, Header, boutons, sélections) pour imprimer uniquement le feuillet A4.

### C. Gestion des Clients (`/clients`)
- **Liste & Recherche** : Liste des clients avec coordonnées, adresse, e-mail, téléphone et volume total facturé.
- **CRUD Client** : Formulaire modal pour ajouter ou modifier des clients, persistant en cascade dans les factures associées.

### D. Enregistrement des Paiements (`/payments`)
- **Historique** : Suivi des transactions et règlements par client.
- **Formulaire d'encaissement** : Modal permettant d'associer un règlement à une facture en attente, avec choix du mode de paiement (Virement bancaire, Mobile Money (M-Pesa, Orange Money, Airtel Money), Cash) et numéro de référence/transaction.

### E. Gestion des Remboursements (`/refunds`)
- **Suivi des avoirs** : Table des notes de crédit et remboursements émis.
- **Formulaire de demande** : Modal de remboursement liée exclusivement aux factures enregistrées comme "Payée".

### F. Abonnement SaaS (`/subscriptions`)
- **Plans d'abonnement** : Comparatif visuel haut de gamme des forfaits (Gratuit, Pro, Entreprise) avec commutateur de facturation Mensuel / Annuel (offrant une réduction de 20%).
- **Changement de forfait** : Mise à jour immédiate de l'abonnement en cours au clic sur un forfait.

### G. Paramètres de l'Entreprise (`/settings`)
- **Informations d'identité** : Raison sociale, adresse de facturation, contact.
- **Préférences fiscales & monétaires** : Configuration du taux de TVA (18% par défaut), de la devise principale et du taux de change indicatif USD/CDF. Ces paramètres sont sauvegardés de manière persistante et s'appliquent sur l'ensemble des pages.

### H. Centre d'Aide & Support (`/support`)
- **Foire Aux Questions (FAQ)** : Accordéon interactif fluide développé sans dépendance externe.
- **Formulaire de support** : Envoi de ticket de support avec validation et écran de succès animé.

---

## 3. Structure des Fichiers

La structure suit la convention standard de Next.js App Router (14+) :

```text
zdmsFacture/
├── app/
│   ├── (dashboard)/            # Routes protégées partageant la Sidebar et le Header
│   │   ├── invoices/           # Factures
│   │   │   ├── page.tsx        # Liste des factures
│   │   │   ├── new/            # Création de facture
│   │   │   │   └── page.tsx
│   │   │   └── [id]/           # Détails de la facture
│   │   │       ├── page.tsx
│   │   │       └── edit/       # Modification de la facture
│   │   │           └── page.tsx
│   │   ├── clients/            # Liste & gestion des clients
│   │   ├── payments/           # Gestion des paiements
│   │   ├── refunds/            # Gestion des remboursements
│   │   ├── subscriptions/      # Tarification & Abonnements
│   │   ├── settings/           # Paramètres de l'entreprise
│   │   ├── support/            # FAQ & Tickets de support
│   │   └── overview/           # Tableau de bord principal (page d'accueil)
│   │       └── page.tsx
│   ├── globals.css             # Styles globaux (dont directives print & scrollbars)
│   ├── layout.tsx              # Layout racine HTML5
│   └── page.tsx                # Redirection automatique vers /overview
├── components/                 # Composants d'interface réutilisables
│   ├── dashboard/              # Widgets graphiques (Recharts, Donut, InvoiceTable)
│   ├── invoices/               # Formulaire de facture (InvoiceForm)
│   └── layout/                 # Sidebar et Header globaux
├── context/
│   └── AppContext.tsx          # Gestionnaire d'état global, hooks localStorage et CRUD
├── data/
│   └── mock.ts                 # Données d'initialisation (Clients, Factures, Taux)
├── types/
│   └── index.ts                # Définitions TypeScript
├── public/                     # Assets statiques et polices
└── package.json                # Dépendances du projet
```

---

## 4. Technologies Utilisées

1. **Framework** : Next.js 14 (App Router) et React 18.
2. **Langage** : TypeScript pour la sécurité de typage.
3. **Styling** : TailwindCSS v3 pour une intégration rapide des classes utilitaires.
4. **Librairie d'icônes** : Lucide React (pour un style premium, propre et cohérent).
5. **Graphiques** : Recharts (configuré avec des conteneurs de sécurité et des vérifications `isMounted` pour éviter les erreurs d'hydratation et les effondrements de hauteur/largeur sur Next.js).
6. **Persistance de l'état** : React Context API synchronisée automatiquement avec le `localStorage`.

---

## 5. Décisions de Design (Design System)

Toutes les interfaces suivent scrupuleusement la charte définie dans `design.md` :
- **Thème Violet Premium** : Couleur primaire `#7C3AED` (purple-600) avec des touches légères d'indigo sombre `#1E1B4B` pour les textes et un fond global ultra-propre `#F4F4F6`.
- **Badges de Statuts** : Tons très doux pour éviter les contrastes agressifs (ex : vert clair `#DCFCE7` et texte `#15803D` pour "Payée").
- **Coins arrondis** : Style haut de gamme utilisant massivement `rounded-2xl` (16px) pour les cartes et conteneurs et `rounded-xl` (12px) pour les entrées de formulaire et boutons.
- **Animations** : Transition fluide d'entrée de page (`animate-scale-in` et cascade d'opacité progressive via `animate-fade-in-up`). Effets au survol (`hover-card-effect`) simulant une élévation physique avec ombres violettes diffuses.
- **Impression PDF** : Intégration dans `globals.css` d'un média `@media print` qui occulte la Sidebar (`aside`), le Header (`header`), les boutons de commande et les sélecteurs de statut afin d'obtenir un rendu papier A4 impeccable et autonome sans dépendance externe lourde.
- **Défilement mobile** : Contraintes de largeur adaptatives (`w-full md:w-auto md:max-w-max`) combinées avec des styles de masquage de la barre de défilement brute (`.no-scrollbar`) pour garantir une navigation fluide par glissement tactile sur mobile.

---

## 6. Instructions pour les Futures IA (Consignes critiques)

Si vous reprenez ce projet pour y ajouter des fonctionnalités ou corriger des bugs, respectez impérativement ces règles :

1. **Double Devise & Arrondis** : Conservez toujours le calcul en dollars (USD) et en Francs Congolais (CDF) en utilisant la variable `exchangeRate` stockée dans le contexte. Les montants doivent être arrondis à l'entier.
2. **Hydratation Recharts (Next.js)** : Les composants Recharts doivent impérativement être protégés par un état `isMounted` (rendu uniquement côté client) et placés dans un conteneur relatif parent disposant de dimensions absolues (ex: `relative w-full h-[300px]`) pour éviter les warnings d'hydratation Next.js ou les effondrements de rendu.
3. **Conserver le Design System** : N'utilisez pas de couleurs ad-hoc ou génériques. Inspirez-vous des classes définies dans `design.md`. Utilisez les animations existantes et les rayons de bordures `rounded-2xl`.
4. **Impression PDF native** : Si vous modifiez la page de détail d'une facture, veillez à ne jamais briser le sélecteur `.print-sheet` ou à ajouter des éléments non annotés de la classe `.no-print`, car le système d'exportation PDF dépend entièrement du style CSS `@media print` natif du navigateur.
5. **Règles Globales du Propriétaire** :
   - Saluez toujours l'utilisateur par **"Bonjour Bruno"** au tout début de chaque message.
   - Ne publiez/déployez jamais le site en ligne sans d'abord lui poser explicitement la question : **"Est ce que tu peux le faire ?"**.
