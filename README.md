# Procured Payment System (Mini Procure-to-Pay)

[Frontend Live](https://gilbe.vercel.app/) | [Backend Live](https://gilb.onrender.com/) | [GitHub Repository](https://github.com/Manzp111/Procured-Payment)


Frontend: https://gilbe.vercel.app
Backend:https://gilb.onrender.com/ use https://gilb.onrender.com/admin/  email:admin@gmail.com pass:admin for changing user role 
---

## Overview

**Procured Payment System** is a mini “Procure-to-Pay” system inspired by [Payhawk](https://payhawk.com/en-eu/lp-procure-to-pay-software).
It manages purchase requests, multi-level approvals, and finance workflows with AI-assisted document processing.

The system includes:

* **Role-based access**: Staff, Approvers (Level 1 is manager  &  and level 2 is general manager), Finance
* **Multi-level approval workflow**
* **Receipt validation** using AI/OCR
* **Automatic Purchase Order generation**
* **Frontend in React (Vite)** and **Backend in Django + DRF**
* **Asynchronous tasks** with **Celery + Redis**
* **Dockerized deployment** for easy setup

---

## Features

### Staff

* Create, view, and update pending purchase requests
* Upload receipts for submitted requests
* Receive feedback on approvals/rejections

### Approvers

* Approve or reject requests at multiple levels
* View approval history
* Trigger automatic Purchase Order generation on final approval

### Finance

* Access all approved requests
* Upload and manage files
* Validate receipts against purchase orders

### AI Document Processing

* Extract key data from proforma invoices
* Compare receipt items/prices with approved POs  using Ai
* Flag discrepancies for review if not matching it uses transaction to rollback and send difference to staff

---

## Technology Stack

| Layer            | Technology                                                |
| ---------------- | --------------------------------------------------------- |
| Backend          | Python 3.11, Django, Django REST Framework, Celery, Redis |
| Frontend         | React (Vite), Bootstrap                                   |
| Database         | PostgreSQL                                                |
| Containerization | Docker, docker-compose                                    |
| Deployment       | Render (Backend), Vercel (Frontend)                       |
| AI / OCR         | OpenAI API, pytesseract, pdfplumber, PyPDF2               |

---

## Project Structure

```text
Procured-Payment/
├── backend/                 # Django backend
│   ├── procured_payment/    # Django app
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── wait-for-it.sh
│   └── entrypoint.sh
    └── .env
├── Frontend/                # React frontend
│   ├── package.json
│   ├── Dockerfile
│   └── src/
    └── .env
├── docker-compose.yml       # Multi-container orchestration
└── .env                     # Environment variables (sensitive)
```

---

## Environment Variables

### Backend `.env`

```env
# Django Secret Key
SECRET_KEY=django-insecure-<your-secret-key>

# PostgreSQL Database
DB_NAME=ist_db
DB_USER=postgres
DB_PASSWORD=<your-db-password>
DB_HOST=localhost
DB_PORT=5432

# Redis / Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=<your-email>
EMAIL_HOST_PASSWORD=<your-email-password>
DEFAULT_FROM_EMAIL=<your-email>

# OpenAI API Key
OPENAI_API_KEY=<your-openai-key>

# Field Encryption
FIELD_ENCRYPTION_KEY=<your-encryption-key>
```

### Frontend `.env`

```env
VITE_API_URL=https://gilb.onrender.com
```


---

## Running the Project

### 1. Manual Setup (Without Docker)

#### Backend

```bash
cd backend
# Create virtual environment
python -m venv .venv
# Activate virtual environment
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate
# Install dependencies
pip install -r requirements.txt
# Apply migrations
python manage.py migrate
# Run server
python manage.py runserver
```

#### Frontend

Open a new terminal:

```bash
cd Frontend
# Install dependencies
npm install
# Run frontend in development mode
npm run dev -- --host 0.0.0.0
```

* Backend: [http://localhost:8000](http://127.0.0.1:8000/)
* Frontend: [http://localhost:5173](http://localhost:5173)

---

### 2. Running with Docker

```bash
git clone https://github.com/Manzp111/Procured-Payment.git
cd Procured-Payment
add environment variable
# Build and start all services
docker-compose up --build
```

This will automatically start:

* **Backend** (Django)
* **Frontend** (React)
* **Celery Worker**
* **Redis**
* **PostgreSQL Database**

---

### 3. Using Pre-built Docker Hub Images

```bash
# Pull images
docker pull manzp/ist_backend:latest
docker pull manzp/ist_frontend:latest

# Run services using docker-compose
docker-compose up
```

## API Endpoints (Django REST Framework)



> Includes authentication (JWT/Token/Session) and role-based access control.

---

## Deployment

* Backend: [Render](https://gilb.onrender.com/) 
* Frontend: [Vercel](https://gilbe.vercel.app/)




