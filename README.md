# Docs Management

Application web de gestion et de traitement de documents connectee a une API backend et a M-Files.

Le projet permet aux utilisateurs de deposer des documents, suivre leur traitement en temps reel, consulter l'historique des traitements, explorer les documents M-Files et administrer les utilisateurs et les instructions de classification.

## Fonctionnalites

- Authentification utilisateur : connexion, inscription et inscription par invitation.
- Routes protegees selon l'etat de connexion.
- Acces admin reserve aux utilisateurs avec le role `ADMIN`.
- Upload de documents vers l'API backend.
- Suivi des sessions de traitement avec mises a jour temps reel via SignalR.
- Historique pagine des sessions de traitement.
- Exploration des documents M-Files.
- Consultation du contenu des fichiers M-Files.
- Lecture et modification des proprietes de documents M-Files.
- Gestion des utilisateurs : liste, creation, invitation et changement de statut.
- Gestion des instructions liees aux classes de documents.
- Interface multilingue : francais, anglais et espagnol.

## Stack technique

- React 19
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Material UI
- i18next
- SignalR
- React Hook Form
- Zod
- React PDF / PDF.js
- Syncfusion PDF Viewer

## Structure principale

```text
src/
  components/      Composants reutilisables et composants metier
  hooks/           Hooks applicatifs pour l'auth, les documents, M-Files et l'admin
  locales/         Traductions i18next
  pages/           Pages principales de l'application
  store/           Slices Redux
  types/           Types TypeScript partages
  utils/           Helpers API, stockage local et validations
```

## Pages principales

- `/login` : connexion.
- `/signup` : creation de compte.
- `/invitation/register` : inscription par invitation.
- `/process` : upload et suivi du traitement des documents.
- `/history` : historique des sessions.
- `/explorer` : exploration des documents M-Files.
- `/members` : gestion des membres, reservee aux admins.
- `/instructions` : gestion des instructions.

## Configuration

L'URL de base de l'API est configuree dans `.env` :

```env
VITE_BASE_URL=/api
```

Les appels frontend utilisent cette base pour contacter les endpoints backend :

- `/auth`
- `/docs`
- `/MFilesDocs`
- `/admin`
- `/admin/instructions`

## Installation

```bash
npm install
```

## Developpement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Verification lint

```bash
npm run lint
```

## Preview du build

```bash
npm run preview
```

## Notes

Le dossier `dist/` contient le build de production genere par Vite. Le dossier `node_modules/` contient les dependances installees localement et ne doit pas etre versionne.
