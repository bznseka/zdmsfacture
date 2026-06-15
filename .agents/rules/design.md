---
trigger: always_on
---

Design System — zdmsFacture
Ce document définit les règles de conception et d'intégration front-end de notre SaaS de facturation. Toutes les pages futures doivent suivre scrupuleusement ces spécifications pour garantir une cohérence visuelle haut de gamme (inspirée de Awwwards et Dribbble).

1. Palette de Couleurs (Thème Violet Premium)
Couleurs de Fond & Base
Fond global de l'application : #F4F4F6 (gris très clair et chaud pour faire ressortir les cartes).
Fond des cartes / sidebar / éléments flottants : #FFFFFF (blanc pur).
Fond d'effet verre (Glassmorphism) : rgba(255, 255, 255, 0.8) avec flou de fond (backdrop-blur-md).
Palette Primaire & Accents
Primaire (Violet) : #7C3AED (purple-600) - Utilisé pour l'état actif, les boutons primaires et les accents visuels forts.
Primaire Hover : #6D28D9 (purple-700).
Primaire Light (Fond Actif) : #EDE9FE (purple-50 / bg-primary-light).
Teal (Accent graphique) : #14B8A6 (teal-500).
Rose (Accent graphique) : #EC4899 (pink-500).
Palette de Statut
Chaque statut de facture possède une couleur de badge dédiée très douce avec un texte contrasté :

Payée (Paid) : Fond #DCFCE7 (vert clair), Texte #15803D (vert foncé), Bordure #BBF7D0.
Envoyée / En attente (Pending/Sent) : Fond #FEF3C7 (ambre clair), Texte #D97706 (ambre foncé), Bordure #FDE68A.
En retard (Overdue) : Fond #FEE2E2 (rose/rouge clair), Texte #B91C1C (rouge foncé), Bordure #FECACA.
Brouillon (Draft) : Fond #F3F4F6 (gris clair), Texte #4B5563 (gris foncé), Bordure #E5E7EB.
Couleurs de Texte
Texte Principal / Titres : #1E1B4B (indigo très sombre pour un aspect premium, évite le noir pur).
Texte Secondaire : #4B5563 (slate-600 / gris moyen).
Texte Mute / Légendes : #94A3B8 (slate-400 / gris clair).
2. Typographie (Inter)
Famille : Inter (importé de Google Fonts) avec lissage des polices activé (antialiased).
Titres de Page (h1) : Taille text-2xl (desktop : text-3xl), graisse font-extrabold, espacement tracking-tight.
Titres de Section / Cartes (h3) : Taille text-base, graisse font-bold.
Texte de Description / Légendes : Taille text-xs ou text-sm, graisse font-medium ou font-semibold.
Montants Principaux : Graisse font-bold ou font-black, espacement condensé.
3. Bordures & Angles (Subtiles & Premium)
Rayon d'angle (Border Radius) :
Cartes & Conteneurs principaux : rounded-2xl (16px / 1rem).
Boutons & Inputs : rounded-xl (12px / 0.75rem) ou rounded-2xl (16px / 1rem).
Petits badges / avatars : rounded-lg (8px / 0.5rem) ou rounded-xl (12px / 0.75rem).
Style de Bordure :
Standard : border border-slate-100 (bordure invisible mais structurante).
Intermédiaire : border border-slate-200/80.
Séparateurs :
Lignes de division : border-b border-slate-50 ou divide-y divide-slate-100.
4. Ombres & Effets Tactiles
Ombre Standard : shadow-sm (très douce).
Ombre au Hover (Cartes interactives) :
css

box-shadow: 0 12px 20px -8px rgba(124, 58, 237, 0.12), 0 4px 6px -2px rgba(124, 58, 237, 0.04);
(Simulé via la classe CSS .hover-card-effect).
5. Micro-Animations & Transitions
Pour capter l'utilisateur et donner une impression de réactivité haut de gamme :

Entrées de Page :
Fond de page global : animate-scale-in (transition d'échelle douce).
Éléments internes (cartes, graphes, tables) : animate-fade-in-up avec délais progressifs de 100ms à 400ms ([animation-delay:100ms], etc.) pour un effet de cascade.
Interactions de Cartes (hover-card-effect) :
Légère élévation : translate-y-[-2px].
Durée : duration-300, interpolation : cubic-bezier(0.4, 0, 0.2, 1).
Hover sur Liens (Sidebar / Menus) :
Icône : Agrandissement léger (group-hover:scale-110).
Texte : Translation douce vers la droite (group-hover:translate-x-1).
Durée globale : duration-300.
Hover sur Boutons CTA :
Légère rotation des icônes fonctionnelles (comme le + de création de facture : group-hover:rotate-90).
Transition : duration-300.
6. Alignements & Espacements (Grille & Marges)
Marges de Contenu principal :
Remplissage : p-6 (mobile) à p-8 (desktop).
Conteneur de page : Largeur maximale max-w-[1600px] w-full mx-auto.
Espacement entre Sections : space-y-8.
Grille de Cartes Statistiques :
Mobile : 1 colonne.
Tablette : 2 colonnes.
Desktop XL : 4 colonnes.
Grille de Détails (Cartes/Tableaux) :
Grid 3 colonnes : Le tableau/graphique principal prend lg:col-span-2, l'élément secondaire (Donut, Top Clients) prend col-span-1.
7. Responsivité (Mobile-First)
Navigation Principale :
Desktop (lg et +) : Sidebar fixe de 64px (w-64).
Mobile : Menu tiroir coulissant (-translate-x-full lg:translate-x-0) avec overlay flouté transparent.
Tableaux de Données :
Toujours enveloppés dans un conteneur avec overflow-x-auto.
Fixer une largeur minimale (min-w-[800px]) sur le tableau pour éviter le retour à la ligne du texte.
Utiliser la classe whitespace-nowrap sur les en-têtes et les cellules de données pour forcer l'affichage sur une ligne et activer le défilement horizontal.