# ELD Trip Planner - Backend

Django REST Framework backend for the ELD Trip Planner application.

## Tech Stack

- **Django 5.2** - Web framework
- **Django REST Framework 3.15** - API toolkit
- **SQLite** - Database (development)
- **Gunicorn** - WSGI server (production)

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver 8000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DEBUG` | Enable debug mode (True/False) |
| `SECRET_KEY` | Django secret key |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins |

## API Endpoints

### POST /api/plan-trip

Plan a trip with HOS-compliant scheduling.

**Request Body:**
```json
{
  "current_location": {"label": "City, State", "lat": 0.0, "lng": 0.0},
  "pickup_location": {"label": "City, State", "lat": 0.0, "lng": 0.0},
  "dropoff_location": {"label": "City, State", "lat": 0.0, "lng": 0.0},
  "cycle_hours_used": 0
}
```

**Response:**
```json
{
  "name": "Origin → Destination",
  "totalMiles": 1234,
  "totalDays": 3,
  "totalDrivingHours": 25.5,
  "cycleHoursUsed": 45,
  "days": [...],
  "route": {...}
}
```

## Project Structure

```
backend/
├── config/             # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── trips/              # Trip planning app
│   ├── services/       # Business logic
│   │   └── hos_engine.py  # HOS calculation engine
│   ├── views.py        # API views
│   └── serializers.py  # DRF serializers
├── manage.py           # Django CLI
└── requirements.txt    # Python dependencies
```

## HOS Rules Implemented

- **11-Hour Driving Limit** - Max driving per duty period
- **14-Hour Duty Window** - Max duty time before rest
- **10-Hour Rest Requirement** - Minimum off-duty before new period
- **30-Minute Break** - Required after 8 hours of driving
- **70-Hour/8-Day Cycle** - Weekly driving limit with warnings
