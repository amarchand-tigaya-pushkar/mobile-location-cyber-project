# 🛡️ Cyber Location Investigation Simulator

An educational and research-oriented simulated mobile location investigation dashboard built with FastAPI, PostgreSQL, HTML, CSS, JavaScript and Streamlit.

> ⚠️ EDUCATIONAL SIMULATOR
>
> This project uses fictional/simulated users, towers and location records.
> It does not retrieve, track, intercept or expose real mobile-device locations,
> telecom subscriber information, SS7 data, IMSI data, or carrier network data.

---

## 📌 Project Overview

Cyber Location Investigation Simulator is a full-stack educational application designed to demonstrate how simulated location-investigation data can be collected, stored, analyzed and visualized.

The project provides:

- Investigator login
- Simulated user management
- Simulated tower information
- Simulated location history
- Investigation summary
- Location timeline
- Movement analysis
- Speed analysis
- Interactive map
- Tower information
- Investigation event details
- Evidence log
- Case ID
- CSV export
- Printable investigation report
- Streamlit analytics dashboard
- PostgreSQL database

All location information used by this project is fictional.

---

# 🚀 Features

## 👤 Simulated Users

The demonstration database contains simulated users.

Each user can have multiple simulated location records.

---

## 🗼 Simulated Towers

The demonstration environment contains:

- SIM-TOWER-001
- SIM-TOWER-002
- SIM-TOWER-003
- ...
- SIM-TOWER-020

These are fictional simulator tower records.

They do not represent real telecom infrastructure.

---

## 📍 Simulated Location History

Each demonstration user can have multiple simulated location events.

Each event contains:

- User ID
- Tower ID
- Latitude
- Longitude
- Accuracy
- Timestamp

---

# 📊 Investigation Dashboard

The web dashboard provides several investigation sections.

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

Displays simulated tower:

- Tower ID
- Area
- Latitude
- Longitude

### Investigation Event Details

Displays individual simulated investigation events.

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

## Database

- PostgreSQL

## Analytics

- Streamlit
- Pandas
- Plotly

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │  HTML / CSS / JS    │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
                               │ SQLAlchemy
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │                     │
                    │ users               │
                    │ towers              │
                    │ location_logs       │
                    └─────────────────────┘


                    ┌─────────────────────┐
                    │      Streamlit      │
                    │ Analytics Dashboard │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    └─────────────────────┘