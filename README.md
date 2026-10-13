# DermAI - Intelligent Skin Disease Detection System

## 1. Project Overview
DermAI is an AI-powered dermatology screening web application designed to assist users in the early detection of skin anomalies. By analyzing skin images using advanced deep learning architecture, it provides preliminary screening insights with high confidence. Beyond standard AI analysis, the platform bridges the gap between AI and human expertise by letting patients instantly share their scan results with registered dermatologists for professional diagnosis, review, and treatment booking.

---

## 2. Core Functionalities & Features

### 👤 Patient Portal
*   **AI Skin Scanning:** Upload a photo of a skin condition to receive instantaneous AI analysis (predicted disease, confidence score, symptoms, and potential causes).
*   **Medical History Tracking:** Keep a localized record of all past skin scans for longitudinal tracking.
*   **Doctor Directory & Appointments:** Browse a list of available dermatologists, view their verified credentials/profiles, and seamlessly book online or in-clinic consultations.
*   **Medical Reports Export:** Automatically generate and download comprehensive PDF medical reports summarizing the AI findings and doctor's notes.

### 🩺 Doctor Portal
*   **Clinical Dashboard:** View a secure feed of incoming appointments requested by patients.
*   **AI Scan Review:** Review patient-uploaded skin images and AI predictions before the consultation begins.
*   **Appointment Management:** Approve, reschedule, or complete consultation requests.
*   **Professional Diagnosis Registration:** Override or confirm the AI's preliminary prediction, embedding a final confirmed professional diagnosis into the patient's medical history.

---

## 3. Overall Project Structure

The platform is logically separated into two primary microservices: a modern JavaScript Frontend and an Asynchronous Python Backend.

```text
skin-diseases/
├── backend/
│   ├── api/               # FastAPI Router endpoints (Auth, Predictions, Doctors, Appointments)
│   ├── ml_pipeline/       # AI Model Training, Inference handlers, and Grad-CAM implementation
│   ├── models/            # Pydantic Schemas ensuring strict data validation before DB insertion
│   ├── services/          # Core Business logic (PDF Generator, JWT Authentication Utils)
│   ├── database.py        # MongoDB connection management handling
│   ├── main.py            # Main FastAPI server entry point and CORS configuration
│   └── requirements.txt   # Python dependency list
└── frontend/
    ├── src/
    │   ├── app/           # Next.js App Router topology (Pages for Dashboard, Scan, Auth, etc.)
    │   ├── components/    # Reusable React UI Components (Navbars, Modals, Tables, Cards)
    │   └── globals.css    # Global Tailwind styling injections
    ├── package.json       # Node.js dependencies
    ├── tailwind.config.ts # Global theme design system configuration
    └── next.config.ts     # Next.js bundler settings
```

---

## 4. Technologies & Software Components Used

### Frontend (User Interface)
*   **Next.js (App Router):** The React-based framework driving server-side rendering, layout management, and dynamic routing for high SEO and performance.
*   **TypeScript:** Used heavily for strict type-checking, drastically reducing run-time bugs.
*   **Tailwind CSS:** A utility-first CSS framework utilized for crafting the modern, glass-morphism inspired, responsive user interface.
*   **Lucide React & Framer Motion:** Drives the platform's iconography and smooth, dynamic micro-animations (e.g., fluid modal pop-ups and transition states).

### Backend (Logic & APIs)
*   **Python:** The core language powering data manipulation, the API, and machine learning components.
*   **FastAPI:** An extremely fast, high-performance web framework for constructing the RESTful API endpoints.
*   **Uvicorn:** The lightning-fast ASGI web server hosting the FastAPI application.
*   **Pydantic:** Validates all incoming and outgoing JSON payloads against explicitly defined Python dataclass schemas.
*   **ReportLab:** Programmatically synthesizes downloadable, formatted PDF medical documents containing patient data.

### Database & Security Structure
*   **MongoDB:** The primary NoSQL database leveraged to store user records, complex nested AI prediction histories, and appointment graphs.
*   **Motor:** An asynchronous Python driver acting as the conduit linking FastAPI to MongoDB without blocking the event loop.
*   **Python-JOSE (JWT Tokenization):** Handles generation and validation of secure authorization bearer tokens, facilitating stateful user sessions statelessly.
*   **Passlib (Bcrypt):** Ensures passwords are cryptographically salted and hashed before ever touching the database.

---

## 5. Machine Learning Models & Algorithms

*   **Core Architecture - MobileNetV2 (Transfer Learning):** 
    The artificial intelligence driving DermAI relies heavily on **MobileNetV2**. This specific Convolutional Neural Network (CNN) architecture was chosen due to its robust balance of accuracy and computational efficiency. It allows the system to achieve highly accurate Multi-Class Image Classifications with minimal latency, making it ideal for scalable edge and web deployments.
*   **Algorithmic Optimization Pipeline:** 
    The training process utilizes the Adam Optimizer coupled with Categorical Cross-Entropy Loss and strategic Learning Rate Decay scheduling to ensure localized minimums are avoided during gradient descent.
*   **Model Explainability - Grad-CAM:** 
    Gradient-weighted Class Activation Mapping (Grad-CAM) is implemented to generate a visual heatmap directly over the uploaded skin image. This visually highlights exactly which granular pixels the mobile-net model factored most heavily into its prediction, establishing critical trust with medical professionals reviewing the scans.

---

## 6. Software Requirements & Data Flow (SRS Walkthrough)

### Phase 1: Authentication & Authorization Flow
1. **Registration:** Roles are separated at birth (Patient, Doctor, Admin). The backend digests the payload, strips the password, hashes it using Bcrypt, and stores the `User` object spanning MongoDB.
2. **Session Generation:** Upon valid login, the `oauth2` endpoint delegates a signed JWT containing the user's explicit Role mapping, enabling Role-Based Access Control (RBAC) across all API endpoints.

### Phase 2: AI Predictive Analysis Flow
1. **Data Ingestion:** A Patient visually drops an image into the `/scan` portal.
2. **Transmission:** A `multipart/form-data` POST request is fired to the backend `/api/predictions/analyze` endpoint.
3. **Hashing & Storage:** The backend takes a cryptogram SHA-256 hash of the image. It checks the DB; if this exact image was previously analyzed, it instantly returns the cached result to save compute overhead. Otherwise, it stores the image locally to `/uploads`.
4. **Inference Execution:** The image tensor is passed into the `.h5` MobileNetV2 model payload via `ml_pipeline/inference.py`. 
5. **Persistence:** The returned tensor mappings are parsed into human-readable conditions (Confidence, Precautions, Symptoms). This payload is injected into a `ScanHistory` object and saved to the patient document.

### Phase 3: Clinical Routing & Appointment Flow
1. **Doctor Discovery:** Patient routes to the `/doctors` directory to fetch the active pool of physicians. 
2. **Modal Interaction:** Clicking "Book Appointment" populates the `BookAppointmentModal`. 
3. **Data Linkage:** The Patient can optionally link the `Scan IDs` generated in Phase 2 directly to the appointment request. 
4. **State Transition:** The payload enters the DB as an `Appointment` with a standard state of `"Pending"`.
5. **Doctor Review:** The requested Doctor logs into their dashboard, views the connected visual scan/AI data, and patches the Appointment State to `"Approved"`.

### Phase 4: Diagnostic PDF Generation Flow
1. Upon consultation completion, or manually via the Patient Dashboard, the UI triggers a `GET /{scan_id}/download`.
2. The Backend intercepts the active JWT, ensures the requester is either the explicit owner of the scan or the assigned Doctor.
3. The server natively invokes `ReportLab`, dynamically generating a clinical-grade PDF merging the initial AI findings with the Final Doctor's Diagnosis.
4. An `application/pdf` Blob payload is returned to the client and saved locally.


backend: python -m uvicorn main:app --reload --port 8000

frontend:npm run dev