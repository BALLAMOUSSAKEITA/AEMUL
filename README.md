# AEMUL - Association des Étudiants Musulmans de l'Université Laval

Application web de gestion des membres avec formulaire d'inscription, génération de cartes de membre (QR Code + Code-barres) et dashboard administrateur.

## Stack technique

- **Frontend** : Next.js 15 (App Router), Tailwind CSS, shadcn/ui
- **Backend** : FastAPI, SQLAlchemy, Alembic
- **Base de données** : PostgreSQL (Railway)

## Structure du projet

```
AEMUL/
├── frontend/    # Application Next.js
├── backend/     # API FastAPI
└── README.md
```

## Démarrage rapide

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables d'environnement

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname
JWT_SECRET=your-secret-key
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
