# 🛡️ Cyber Location Investigation Simulator

An educational and research-oriented **simulated mobile location investigation dashboard** built with **FastAPI, PostgreSQL, HTML, CSS, JavaScript and Streamlit**.

> ⚠️ **EDUCATIONAL SIMULATOR**
>
> This project uses fictional/simulated users, towers and location records.
> It does **not** retrieve, track, intercept or expose real mobile-device locations,
> telecom subscriber information, SS7 data, IMSI data, or carrier network data.

---

## 🌐 Live Project

- **GitHub Repository:** https://github.com/amarchand-tigaya-pushkar/mobile-location-cyber-project
- **Live Frontend:** https://amarchand-tigaya-pushkar.github.io/mobile-location-cyber-project/
- **Live Backend API:** https://mobile-location-cyber-project.onrender.com
- **API Health Check:** https://mobile-location-cyber-project.onrender.com/health

---

## 📌 Project Overview

Cyber Location Investigation Simulator is a full-stack educational application designed to demonstrate how simulated location-investigation data can be:

- collected
- stored in PostgreSQL
- accessed through a REST API
- analyzed
- visualized on an interactive dashboard
- exported as investigation evidence/reports

The project is designed for **cyber-security learning, Python/FastAPI practice, database practice, investigation workflow demonstrations and portfolio use**.

---

# 🚀 Features

## 🔐 Investigator Authentication

The application includes backend-enforced investigator authentication using:

- JWT access tokens
- PBKDF2-SHA256 password hashing
- Protected FastAPI endpoints
- Token-based frontend API requests
- Session-expiration handling

The demo investigator account is configured through environment variables and is **not hard-coded into the production frontend**.

---

## 👤 Simulated Users

The demonstration database contains **23 fictional users**.

Each user can have multiple simulated location records.

Example fictional phone range:

```text
9000000001
9000000002
...
9000000023
```

These numbers are simulated data only.

---

## 🗼 Simulated Towers

The demonstration environment contains **20 fictional towers**:

```text
SIM-TOWER-001
SIM-TOWER-002
SIM-TOWER-003
...
SIM-TOWER-020
```

These are simulator records and do **not** represent real telecom infrastructure.

---

## 📍 Simulated Location History

The demonstration database contains simulated location events.

Each event can contain:

- User ID
- Tower ID
- Latitude
- Longitude
- Accuracy
- Timestamp

The current demonstration dataset contains approximately **460 simulated location records**.

---

# 📊 Investigation Dashboard

The web dashboard provides multiple investigation sections.

### Investigation Summary

Displays:

- Total locations
- Towers visited
- First seen
- Last seen
- Latest tower

### Latest Location

Displays the latest simulated location associated with the selected user.

### Movement Analysis

Provides simulated:

- Distance
- Direction
- Duration

### Speed Analysis

Provides:

- Average speed
- Maximum speed
- Distance
- Duration

### Investigation Timeline

Displays simulated location events chronologically.

### Location History

Displays location records in tabular form.

### Simulated Location Map

Displays simulated location points and movement.

### Tower Information

Displays:

- Tower ID
- Area
- Latitude
- Longitude

### Investigation Event Details

Displays individual simulated investigation events.

### Evidence Log

Provides an investigation-oriented evidence/event record.

### Case ID

Each investigation workflow can use a case identifier for organizing the simulated investigation.

### Export / Reporting

The dashboard supports:

- CSV export
- Printable investigation report

---

# 🧰 Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Leaflet.js
- Chart.js

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- JWT authentication
- PBKDF2-SHA256 password hashing

## Database

- PostgreSQL

## Analytics

- Streamlit
- Pandas
- Plotly

## Deployment

- GitHub Pages — Frontend
- Render — FastAPI Backend
- PostgreSQL-compatible cloud database

---

# 🏗️ Architecture

```text
                    ┌─────────────────────────┐
                    │        Frontend         │
                    │     HTML / CSS / JS     │
                    │ Leaflet / Chart.js      │
                    └────────────┬────────────┘
                                 │
                                 │ HTTPS REST API
                                 ▼
                    ┌─────────────────────────┐
                    │        FastAPI          │
                    │        Backend          │
                    │                         │
                    │ JWT Authentication      │
                    │ Protected API Routes    │
                    └────────────┬────────────┘
                                 │
                                 │ SQLAlchemy
                                 ▼
                    ┌─────────────────────────┐
                    │       PostgreSQL        │
                    │                         │
                    │ users                   │
                    │ towers                  │
                    │ location_logs           │
                    └─────────────────────────┘


                    ┌─────────────────────────┐
                    │       Streamlit         │
                    │   Analytics Dashboard   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       PostgreSQL        │
                    └─────────────────────────┘
```

---

# 📁 Project Structure

```text
MOBILE_LOCATION_CYBER_PROJECT/
│
├── .gitignore
├── README.md
├── requirements.txt
├── streamlit_app.py
├── .python-version
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── auth.py
│       ├── config.py
│       ├── database.py
│       ├── main.py
│       ├── models.py
│       ├── schemas.py
│       └── routes/
│           ├── __init__.py
│           ├── auth_routes.py
│           └── location_routes.py
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       └── config.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── data/
├── tests/
└── docs/
```

---

# 🗄️ Database Schema

The core PostgreSQL database contains:

### `users`

Stores fictional simulator users.

```text
id
name
phone
password_hash
created_at
```

### `towers`

Stores fictional simulator towers.

```text
id
tower_id
area
latitude
longitude
created_at
```

### `location_logs`

Stores simulated location events.

```text
id
user_id
tower_id
latitude
longitude
accuracy
recorded_at
```

---

# 🔑 Authentication Flow

```text
Investigator
     │
     ▼
Login Form
     │
     ▼
POST /api/auth/login
     │
     ▼
FastAPI verifies credentials
     │
     ▼
JWT Access Token
     │
     ▼
Frontend stores token
     │
     ▼
Authorization: Bearer <token>
     │
     ▼
Protected API
     │
     ▼
PostgreSQL
```

Protected endpoints include:

```text
GET /api/users
GET /api/towers
GET /api/locations/{user_id}
```

---

# ⚙️ Local Installation

## 1. Clone the repository

```bash
git clone https://github.com/amarchand-tigaya-pushkar/mobile-location-cyber-project.git
cd mobile-location-cyber-project
```

## 2. Create a virtual environment

### Windows PowerShell

```powershell
python -m venv venv
.env\Scripts\Activate.ps1
```

## 3. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

## 4. Configure environment variables

Create:

```text
backend/.env
```

Use `backend/.env.example` as the template.

Never commit real secrets to GitHub.

---

# ▶️ Run FastAPI Backend

From the project root:

```powershell
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

API:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

---

# 🌐 Run Frontend Locally

The frontend can be served with a simple local HTTP server.

From the `frontend` directory:

```powershell
python -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500
```

---

# 📊 Run Streamlit

From the project root:

```powershell
streamlit run streamlit_app.py
```

---

# 🔒 Security Notes

This project follows a simulated/educational investigation model.

Important security practices:

- Never commit `.env` files.
- Never expose PostgreSQL credentials publicly.
- Never expose JWT secrets publicly.
- Use strong production secrets.
- Use HTTPS for deployed applications.
- Keep API authentication enabled.
- Treat all location records in this repository as fictional/simulated.
- Do not use this project to access or track real devices without proper legal authorization and consent.

---

# ⚖️ Legal & Ethical Notice

This repository is intended for:

- Education
- Cyber-security learning
- Full-stack development practice
- Database/API learning
- Investigation workflow simulation
- Portfolio and demonstration purposes

It is **not** a telecom interception system and does not provide access to:

- Real-time mobile-number tracking
- SS7 exploitation
- IMSI catcher functionality
- Real subscriber databases
- Carrier location APIs
- Unauthorized device tracking
- Private telecom network data

All location data used by the demonstration system is fictional/simulated.

---

# 🎯 Learning Objectives

This project demonstrates practical concepts in:

- Python backend development
- FastAPI REST APIs
- JWT authentication
- Password hashing
- PostgreSQL database design
- SQLAlchemy ORM
- REST API security
- JavaScript API integration
- Interactive maps
- Location-data visualization
- Movement calculations
- Investigation workflows
- CSV reporting
- Streamlit analytics
- Cloud deployment

---

# 🚀 Deployment

The current project uses:

```text
GitHub
   │
   ├── GitHub Pages
   │       └── Frontend
   │
   └── Render
           └── FastAPI Backend
                    │
                    ▼
                PostgreSQL
```

Frontend:

https://amarchand-tigaya-pushkar.github.io/mobile-location-cyber-project/

Backend:

https://mobile-location-cyber-project.onrender.com

---

# 👨‍💻 Project

**Cyber Location Investigation Simulator**

GitHub:

https://github.com/amarchand-tigaya-pushkar/mobile-location-cyber-project

Built as an educational full-stack cyber-security and location-analysis simulation project.
