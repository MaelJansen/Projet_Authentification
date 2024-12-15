# Projet_Authentification

## Les fonctionnalités présentes :

1. Création de compte et connexion

- Accéder au formulaire via la page "Mon espace" (ou via la redirection des blogs privés si non connecté)
- Remplir le formulaire (si c'est le formulaire d'inscription, il redirigera vers le formulaire de login après l'inscription)
- La connexion peut aussi se faire via Google (en suivant le lien "Se connecter avec Google" sur le formulaire de connexion)

2. Enregistrement d'un blog

- Via la page "Mon espace" : remplir les champs et cliquer sur "Enregistrer les modifications"
- Si la double authentification n'a pas été activée précédemment, elle sera demandée (les modifications apportées au blog seront supprimées - bug à corriger)
- Une fois les modifications enregistrées, le site redirigera vers la page d'accueil (il faudra peut-être actualiser la page pour voir les modifications)

3. Consulter des blogs

- Pour l'instant, on ne peut voir que les aperçus de blogs via les onglets "Public" et "Privé"
- Pour avoir accès aux blogs privés, la connexion est nécessaire

4. Déconnexion

- Deux boutons de déconnexion sont disponibles :
- "Se déconnecter de l'appareil" : il permet de déconnecter la session actuelle
- "Se déconnecter de tous les appareils" : il permet de déconnecter toutes les sessions liées à l'utilisateur

## L'installation du projet

Pour configurer l'environnement :

- Remplir le fichier .env avec les infos obtenus via la page google developpers
- Remplir le session_secret (facultatif)

Pour installer et lancer le projet il faut :

- Faire la commande `npm i` (pour installer tout les modules)
- Faire la commande `node ./index.js` (pour lancer le serveur)