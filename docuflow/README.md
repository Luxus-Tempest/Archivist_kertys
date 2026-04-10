# DocuFlow — Frontend

Interface React + TypeScript pour le traitement de fichiers avec suivi en temps réel via SignalR.

---

## Installation

```bash
npm install
cp .env.example .env   # puis renseigner VITE_API_BASE_URL
npm run dev            # http://localhost:3000
```

---

## Structure du projet

```
src/
├── types/
│   └── index.ts              # Types TypeScript partagés (FileStatus, TrackedFile, Session)
│
├── hooks/
│   └── useFileProcessor.ts   # ⭐ Toute la logique métier (upload + SignalR)
│
├── components/
│   ├── Sidebar.tsx / .module.css
│   ├── DropZone.tsx / .module.css
│   ├── FileRow.tsx / .module.css
│   └── StatusBadge.tsx / .module.css
│
├── pages/
│   ├── UploadPage.tsx / .module.css
│   └── HistoryPage.tsx / .module.css
│
├── App.tsx / App.module.css  # Routing entre pages + layout global
├── main.tsx                  # Point d'entrée React
└── index.css                 # Variables CSS (tokens design) + reset
```

---

## Intégration SignalR

Tout se passe dans **`src/hooks/useFileProcessor.ts`**.

### 1. Installer le package

```bash
npm install @microsoft/signalr
```

### 2. Remplacer `_startSignalR`

Chercher le commentaire `── Real SignalR (uncomment & adapt) ──` dans le hook et décommenter ce bloc :

```ts
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
  .withUrl(`${API_BASE_URL}/hub/processing?sessionId=${sid}`)
  .withAutomaticReconnect()
  .configureLogging(LogLevel.Warning)
  .build();

// L'event que le serveur pousse pour chaque mise à jour de statut
connection.on('FileStatusUpdate', (fileId: string, status: FileStatus) => {
  updateFileStatus(fileId, status);
});

// En cas d'erreur sur un fichier spécifique
connection.on('FileError', (fileId: string, message: string) => {
  updateFileStatus(fileId, 'error', message);
});

await connection.start();
signalRConnection.current = connection;
```

### 3. Supprimer le mock

Supprimer l'appel `_mockSignalR(trackedFiles, sid)` et la fonction `_mockSignalR` entière.

### 4. Contrat attendu du serveur

| Événement SignalR  | Paramètres                        | Description                     |
|--------------------|-----------------------------------|---------------------------------|
| `FileStatusUpdate` | `fileId: string, status: string`  | Mise à jour du statut d'un fichier |
| `FileError`        | `fileId: string, message: string` | Erreur sur un fichier           |

Les valeurs de `status` attendues : `"pending"` `"processing"` `"classified"` `"uploaded"`

> **Note** : le `fileId` retourné par le serveur doit correspondre aux IDs envoyés lors de l'upload POST `/api/sessions`. Adapter si le backend utilise ses propres identifiants — dans ce cas mapper l'ID local ↔ ID serveur dans le hook.

---

## API backend attendue

### `POST /api/sessions`

Envoie les fichiers, reçoit le `sessionId`.

```
Content-Type: multipart/form-data
Body: files[] (File[])

Response 200:
{
  "sessionId": "SESS-XXXXXXX"
}
```

---

## Build production

```bash
npm run build
# dist/ prêt à déployer (Nginx, Vercel, Azure Static Web Apps…)
```
