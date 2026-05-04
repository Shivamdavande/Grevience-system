# AI-Based Citizen Grievance Classification System

A complete full-stack solution for smart city grievance management, powered by Hugging Face Transformers.

## 🚀 Getting Started

### 1. AI Service (Python)
Requirements: Python 3.8+, pip
```bash
cd ai_service
pip install -r requirements.txt
python main.py
```
*Note: The first run will download the `facebook/bart-large-mnli` model (~1.6GB).*

### 2. Backend (Node.js)
Requirements: Node.js, MongoDB (Running locally)
```bash
cd server
npm install
npm run dev
```

### 3. Frontend (React)
```bash
cd client
npm install
npm run dev
```

## 🧠 How it Works
1. **Submission**: Citizen describes an issue (e.g., "Water pipe is leaking since morning").
2. **AI Analysis**: Python service uses a **Zero-Shot Classification Transformer** to identify the category (Water Supply) and determine priority (High).
3. **Storage**: Node.js saves the grievance with AI-generated metadata in MongoDB.
4. **Dashboard**: Admin views real-time analytics and updates issue status (Pending -> Resolved).

## 🛠 Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide React, Chart.js
- **Backend**: Node.js, Express, Mongoose
- **AI**: Python, FastAPI, Hugging Face Transformers (BART)
- **Database**: MongoDB
