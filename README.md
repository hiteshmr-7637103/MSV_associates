# MSV Insurance Workflow Management System

A premium, interactive workflow management application designed specifically for insurance agents and admins at MSV Associates. Built using a full-stack JavaScript architecture (**React/Vite + Node.js/Express + MongoDB** with an automatic file-based database fallback).

## Key Features

1. **Jira-like Workflow Board:**
   - Visual Kanban board split into columns matching the specific operational blocks:
     - **Checklist / To-Do Pool**: Central storage for new, unassigned tasks.
     - **Current Work**: Block assigned to Singaravel and Suguna.
     - **Intermediate Work**: Block assigned to Staffs and Admins.
     - **Outerworks**: Block assigned to Outerworks Staff.
     - **Done / Archived**: For completed tasks.
   - Smooth drag-and-drop or status selections to move tasks across blocks.
   
2. **Unstructured Data Support:**
   - Insurance policy details vary significantly by policy type (Motor, Health, Life, etc.).
   - Admins can add **arbitrary custom metadata fields** (e.g. `Vehicle Model`, `Hospital Network`, etc.) on the fly. These are saved into a NoSQL model.

3. **Checklist Builder:**
   - Create sub-tasks checklist inside each ticket and track completion progress dynamically with a progress bar.

4. **Staff Management Panel:**
   - Displays all registered agents, their system roles, assigned blocks, and real-time workload counters (number of active assigned tasks).
   - Dynamic form to add new agents on the fly.

5. **Real-time Synchronization & Search:**
   - Periodic API polling every 5 seconds syncing details across different agent screens in real-time.
   - Filter by policy category (Motor, Health, Life, etc.) or search dynamically.

---

## Getting Started

### Prerequisites
1. **Node.js** (v18 or higher recommended). Download it from [nodejs.org](https://nodejs.org/).
2. (Optional) **MongoDB**. If MongoDB is not running locally, the application automatically falls back to storing data inside a local JSON file (`backend/local_db.json`), requiring zero installation to get started!

### Installation
Once Node.js is installed, open your terminal in this project folder (`E:/MSV_Associates/`) and run:

```bash
# Install root, backend, and frontend dependencies
npm run install-all
```

### Running Locally
To launch both the Node/Express backend and Vite/React frontend simultaneously in development mode:

```bash
npm run dev
```

- **Frontend Dashboard**: `http://localhost:3000`
- **Backend Server**: `http://localhost:5000`

---

## Production Build & Hosting
To compile the React frontend and serve it directly from the Express backend process (ideal for deploying to Vercel, Render, Heroku, or digital ocean):

1. Build the production package:
   ```bash
   npm run build
   ```
2. Start the Express server to serve both API and frontend static assets:
   ```bash
   npm start --prefix backend
   ```
3. Set your `MONGODB_URI` environment variable to connect it to a cloud DB (e.g., MongoDB Atlas).
