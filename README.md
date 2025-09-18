````markdown
# 🦦 Otterbau Tracking – PWA

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Eine **Progressive Web App (PWA)** zur Erfassung und Auswertung von **Arbeitszeiten, Ausgaben und Projektkosten** rund um den Hausbau.  
Die App ist **offlinefähig**, mobil nutzbar und angelehnt an das **Apple iOS Design (HIG)**.

---

## 🚀 Features

- **Arbeitszeiten-Tracking**: wer, wann, wie viele Stunden
- **Ausgaben erfassen**: Position, Kategorie, Käufer, Preis, Menge, Zusatzinfos
- **Projektkosten**: z. B. Grundstück, Immobilie, Nebenkosten, Umbaukosten
- **Quick-Add Buttons**: Arbeitsstunde oder Ausgabe mit einem Klick erfassen
- **Dashboard**: Kennzahlen und Kacheln für aktuelle Woche/Monat
- **Charts (Recharts)**:
  - Arbeitsstunden pro Person (Balkendiagramm)
  - Ausgaben pro Kategorie (Kreisdiagramm)
  - Zeitliche Verläufe (Linien- / Balkendiagramme)
- **Offlinefähig** dank Service Worker (IndexedDB als lokale DB)
- **JSON-Import** historischer Daten inkl. Personen
- **Responsive UI** (Mobile-First, optimiert für Nutzung am Handy)

---

## 📊 Datenmodell

### Personen (`Person`)

- `id: string (uuid)`
- `name: string`
- `createdAt: string (ISO)`

### Einträge (`Entry`)

- `id: string (uuid)`
- `type: "work" | "expense" | "projectCost"`
- `date: string (ISO yyyy-mm-dd)`
- `tags: string[]`
- `payload: WorkPayload | ExpensePayload | ProjectCostPayload`
- `createdAt: string`
- `updatedAt: string`

#### WorkPayload

- `personId: uuid`
- `personName: string`
- `hours: number`
- `project?: string`
- `note?: string`

#### ExpensePayload

- `position: string`
- `manufacturer?: string`
- `category: string`
- `type?: string`
- `extra?: string`
- `buyer: string`
- `qty: number`
- `unitPrice: number`
- `total: number`
- `currency: string (default EUR)`
- `note?: string`

#### ProjectCostPayload

- `position: string`
- `category: string`
- `note?: string`
- `amount: number`
- `paidDate?: string`

### Settings (`Settings`)

- `defaultCurrency: "EUR"`
- `weekStart: 0–6`
- `exportFormat: "csv" | "json"`
- `backupPolicy: "manual" | "on-online" | "daily"`

---

## 🎨 UI & Design

Angelehnt an **Apple HIG (Human Interface Guidelines)**, umgesetzt mit **Tailwind CSS**:

- **App-Header** (sticky, zentriert, border bottom)
- **Suchfeld** (iOS-like Input, aktuell Platzhalter)
- **Icon-Tabbar** (Navigation: Stunden | Ausgaben | Analyse)
- **Dashboard-Karten** (Arbeitszeit Woche, Ausgaben Monat etc.)
- **Quick-Add Buttons** (blau für Stunden, grün für Ausgaben)
- **Dark-Mode vorbereitet** (`dark:`-Klassen)

---

## 🛠️ Tech-Stack

- **Next.js 15 (App Router, Turbopack)**
- **TypeScript**
- **Tailwind CSS**
- **Dexie.js** (IndexedDB Wrapper)
- **Zod** (Schema-Validierung)
- **Recharts** (Charts & Visualisierung)
- **Vercel** (geplantes Deployment/Hosting)

---

## 🔄 Datenimport / Reset

- **Importfunktion (Settings-Seite):**
  - Upload einer JSON-Datei
  - Zod-Validierung
  - Speicherung per Dexie `bulkPut`
- **Resetfunktion (Settings-Seite):**
  - Löscht alle lokalen Daten aus der IndexedDB
  - Ermöglicht Neu-Import

---

## 📱 Nutzung auf Handy

- PWA lässt sich via **„Zum Home-Bildschirm hinzufügen“** installieren
- Funktioniert komplett **offline**
- Optimiert für **Mobile-Viewport (390×844 iPhone)**
- Desktop-Nutzung ebenfalls möglich

---

## 🧑‍💻 Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
````

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Vercel Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)

---

## ☁️ Deployment

Empfohlene Plattform: [Vercel](https://vercel.com)

- Automatisches Build & Deployment
- HTTPS, PWA-ready
- GitHub Integration (CI/CD)

---

## ✅ Projektstatus

- ✔️ App-Grundgerüst (Next.js + Tailwind + PWA)
- ✔️ Datenbank (Dexie, Zod-Schemas)
- ✔️ Quick-Add für Arbeitszeiten & Ausgaben
- ✔️ Dashboard mit Kennzahlen
- ✔️ Erste Charts eingebunden
- ✔️ JSON-Import + Reset

---

```

```
