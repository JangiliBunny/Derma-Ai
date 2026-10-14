# 🩺 DermaAI — AI-Powered Skin Disease Screening System

**An AI-powered web application for skin disease screening using Deep Learning and Computer Vision.**

DermaAI is a final-year group project that combines Artificial Intelligence, Deep Learning, and Web Development to provide preliminary skin condition predictions from uploaded skin images. The platform integrates a MobileNetV2-based deep learning model with a modern web interface, user authentication, prediction history, and report generation.

🌐 **Live Demo:** [DermaAI Web Application](https://derma-ai-lovat.vercel.app/)

🔗 **Backend API:** [Railway Deployment](https://derma-ai-production.up.railway.app/)

📘 **API Documentation:** [FastAPI Swagger UI](https://derma-ai-production.up.railway.app/docs)

---

## ✨ Features

- 🖼️ **Skin Image Analysis** — Upload skin images for AI-based screening.
- 🧠 **Deep Learning Model** — Uses MobileNetV2 for image classification across 20 supported skin condition classes.
- 🔐 **User Authentication** — Registration and login functionality.
- 🗄️ **Cloud Database** — MongoDB Atlas integration for application data.
- 📊 **Prediction Results** — Displays predicted skin condition information.
- 📄 **Report Generation** — Generates downloadable reports where supported.
- 💬 **AI Chat Assistant** — Provides conversational assistance where configured.
- 👨‍⚕️ **Doctor and Appointment Features** — Supports relevant doctor and appointment workflows where enabled.
- 🌐 **Full-Stack Deployment** — Frontend hosted on Vercel and backend hosted on Railway.

## 🧠 Supported Skin Condition Classes

The current baseline model supports the following 20 classes:

1. Acne
2. Actinic Keratosis
3. Basal Cell Carcinoma
4. Benign Keratosis
5. Contact Dermatitis
6. Dermatofibroma
7. Eczema
8. Impetigo
9. Lupus
10. Melanoma
11. Nevus
12. Psoriasis
13. Ringworm
14. Rosacea
15. Seborrheic Keratosis
16. Tinea
17. Urticaria
18. Vascular Lesion
19. Vitiligo
20. Warts

*Note: These are the model's supported output classes. They do not imply equal diagnostic accuracy or clinical validation for every condition.*

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Python, FastAPI |
| Deep Learning | TensorFlow, Keras, MobileNetV2 |
| Database | MongoDB Atlas, Motor |
| Authentication | Token-based authentication |
| Report Generation | ReportLab |
| AI Assistant | Google Gemini API, when configured |
| Frontend Deployment | Vercel |
| Backend Deployment | Railway |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

```text
                   ┌──────────────────────┐
                   │       User           │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Next.js Frontend     │
                   │       Vercel         │
                   └──────────┬───────────┘
                              │ REST API
                              ▼
                   ┌──────────────────────┐
                   │ FastAPI Backend      │
                   │      Railway         │
                   └──────────┬───────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌────────────┐ ┌────────────┐ ┌────────────┐
        │ MobileNetV2│ │ MongoDB    │ │ Report and │
        │ Inference  │ │ Atlas      │ │ AI Services│
        └────────────┘ └────────────┘ └────────────┘
```

## 🚀 Live Deployment

| Service | URL |
|---|---|
| Frontend | https://derma-ai-lovat.vercel.app/ |
| Backend Health Check | https://derma-ai-production.up.railway.app/api/health |
| API Documentation | https://derma-ai-production.up.railway.app/docs |

## ⚙️ Local Installation and Setup

### Prerequisites

- Node.js and npm
- Python 3.10–3.12, subject to dependency compatibility
- MongoDB local instance or MongoDB Atlas account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/JangiliBunny/Derma-Ai.git
cd Derma-Ai
```

### 2. Configure the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```powershell
venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local `.env` file inside `backend/` using `backend/.env.example` as a reference. Configure the required variables, including:

```env
MONGODB_URL=your_mongodb_connection_string
SECRET_KEY=your_generated_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MODEL_TYPE=baseline_20class
```

Use your own credentials and generated secret. Never commit `.env` files or expose API keys.

Start the backend from the `backend` directory:

```bash
uvicorn main:app --reload --port 8000
```

Backend API: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### 3. Configure the frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

## 📂 Project Structure

```text
Derma-Ai/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   ├── models/
│   ├── services/
│   ├── ml_pipeline/
│   ├── saved_models/
│   ├── uploads/
│   └── reports/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── .env.example
│
└── README.md
```

*The structure above is representative; actual folders may differ based on your current repository.*

## 🔬 Deep Learning Workflow

1. The user uploads a skin image through the web application.
2. The frontend sends the image to the FastAPI backend.
3. The backend preprocesses the image for the trained MobileNetV2 model.
4. The model predicts a class from its supported output classes.
5. The backend returns the prediction and available supporting information.
6. The application displays the result and provides other enabled features, such as report generation.

## 👥 Project Team

This project was developed collaboratively as a final-year academic group project.

| Team Member | Responsibility | GitHub |
|---|---|---|
| **JANGILI BUNNY** | Project Development and Integration | [@JangiliBunny](https://github.com/JangiliBunny) |
| **VELDANDI RAKESH** | [Frontend Development / UI] | [@VeldandiRakesh](https://github.com/VeldandiRakesh) |
| **NAMPELLY GNYANENDRACHARY** | [Backend Development / APIs] | [@N.Gnyanendrahary](https://github.com/NAMPELLYGNYANENDRACHARY) |
| **VINAY GOUD KOTA** | [Machine Learning / Testing] | [@Vinay goud](https://github.com/VinayGoud622) |


## 🔮 Future Enhancements

- Improve model performance through additional training and evaluation.
- Expand and validate datasets across different skin tones and image conditions.
- Improve accessibility and responsive user experience.
- Add comprehensive model evaluation metrics and explainability features.
- Improve image storage, monitoring, and deployment reliability.

## ⚠️ Medical Disclaimer

DermaAI is an academic project intended for educational demonstration and preliminary skin condition screening research. Its predictions are experimental and are **not a medical diagnosis**. It is not a substitute for professional medical advice, examination, or treatment. Consult a qualified healthcare professional for medical concerns.

## 🎓 Project Information

**Project Type:** Final-Year Group Project  
**Domain:** Artificial Intelligence, Deep Learning, and Full-Stack Web Development  
**Model:** MobileNetV2  
**Application:** Web-Based Skin Disease Screening System
