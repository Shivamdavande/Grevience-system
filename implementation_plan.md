# Implementation Plan: AI-Based Citizen Grievance Classification System

This plan outlines the architecture and implementation steps for building a complete grievance classification system using React, Node.js, MongoDB, and a Python FastAPI service powered by Hugging Face Transformers.

## User Review Required

> [!IMPORTANT]
> **AI Model Choice**: I plan to use the `facebook/bart-large-mnli` zero-shot classification model. This allows us to classify complaints into arbitrary categories (Road, Water, etc.) without needing a labeled dataset. It is resource-intensive but very accurate for hackathon demos.
> **Database**: I will assume a local MongoDB instance or a MongoDB Atlas connection string will be provided.
> **Google Maps**: I will implement the UI for location picking, but it will require a Google Maps API key to be fully functional.

## Proposed Changes

The project will be organized into three main directories: `client`, `server`, and `ai_service`.

---

### [NEW] AI Service (`ai_service/`)
A Python FastAPI application to handle classification and priority assignment.

- **`main.py`**: FastAPI entry point.
- **`classifier.py`**: Logic for Hugging Face `pipeline("zero-shot-classification")`.
- **`requirements.txt`**: Python dependencies (`fastapi`, `uvicorn`, `transformers`, `torch`).

### [NEW] Backend Service (`server/`)
Node.js Express server to manage data and coordinate between frontend and AI.

- **`models/Grievance.js`**: MongoDB schema for complaints (text, category, priority, status, location, timestamp).
- **`routes/complaintRoutes.js`**: API endpoints for submission, retrieval, and status updates.
- **`index.js`**: Express app setup and MongoDB connection.

### [NEW] Frontend Application (`client/`)
Vite + React application with a premium, modern design.

- **`src/components/`**: Reusable UI components (Navbar, Sidebar, StatCard, ComplaintTable).
- **`src/pages/`**:
    - `Home.jsx`: User-facing complaint submission form.
    - `AdminDashboard.jsx`: Analytics and complaint management.
- **`src/styles/`**: Global CSS with a custom design system (vibrant colors, glassmorphism).

---

## Technical Specifications

### API Endpoints
- `POST /api/complaints`: Submit a new grievance. Triggers AI classification.
- `GET /api/complaints`: Fetch all grievances (for admin).
- `PATCH /api/complaints/:id`: Update status (Pending -> In Progress -> Resolved).

### AI Classification Logic
- **Categories**: Road Issues, Sanitation, Electricity, Water Supply, Public Safety, Others.
- **Priority Logic**: Based on keywords and sentiment (e.g., "urgent", "danger", "broken pipe" -> High).

## Verification Plan

### Automated Tests
- Test Python FastAPI endpoint independently using `curl` or Postman.
- Test Node.js API connectivity to MongoDB.

### Manual Verification
- **User Flow**: Submit a complaint like "There is a deep pothole on Main Street" -> Verify it gets classified as "Road Issues".
- **Admin Flow**: Change status of a complaint and see it reflect on the dashboard charts.
- **Responsive Design**: Verify UI works on mobile and desktop.
