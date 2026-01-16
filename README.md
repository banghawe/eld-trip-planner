# ELD Trip Planner

A full-stack web application for planning truck driver trips with **Hours of Service (HOS)** compliance built into the scheduling.

![Trip Planner](https://img.shields.io/badge/Django-5.2-green) ![React](https://img.shields.io/badge/React-18-blue)

## Features

- 🗺️ **Route Planning** - Enter origin, pickup, and dropoff locations
- ⏰ **HOS Compliance** - Automatic rest stops per FMCSA regulations
- 📊 **Daily Logs** - Detailed driver log sheets with status chart
- ⚠️ **70-Hour Warning** - Alerts when approaching cycle limits
- 🖨️ **Print Ready** - Log sheets formatted for printing

## Project Structure

```
spotter-test/
├── frontend/           # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── README.md
├── backend/            # Django REST API
│   ├── config/
│   ├── trips/
│   ├── requirements.txt
│   └── README.md
└── README.md           # This file
```

## Quick Start

### Backend (Django 5.2)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## HOS Rules

This application enforces FMCSA Hours of Service regulations:

| Rule | Limit |
|------|-------|
| Driving per duty period | 11 hours |
| Duty window | 14 hours |
| Required rest | 10 hours |
| Break requirement | 30 min after 8h driving |
| Weekly cycle | 70 hours / 8 days |
| Cycle reset | 34 consecutive hours off |

## Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS
- React Router
- Leaflet (maps)

**Backend:**
- Django 5.2
- Django REST Framework
- SQLite (dev) / PostgreSQL (prod)

