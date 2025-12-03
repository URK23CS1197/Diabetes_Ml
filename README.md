# Diabetes_ML

A compact, end-to-end machine learning project for diabetes prediction — includes data processing, model training, evaluation, and a simple web UI (backend + frontend) to preview and serve predictions.

---

## Table of contents

* [Project Overview](#project-overview)
* [Key Features](#key-features)
* [Repository Structure](#repository-structure)
* [Tech Stack](#tech-stack)
* [Dataset](#dataset)
* [Setup & Installation](#setup--installation)

  * [Prerequisites](#prerequisites)
  * [Run locally (backend)](#run-locally-backend)
  * [Run locally (frontend)](#run-locally-frontend)
* [Usage](#usage)

  * [Train the model](#train-the-model)
  * [Evaluate the model](#evaluate-the-model)
  * [Serve predictions (API)](#serve-predictions-api)
  * [Frontend demo](#frontend-demo)
* [Project Design & Decisions](#project-design--decisions)
* [How to contribute](#how-to-contribute)
* [Testing](#testing)
* [Roadmap / Improvements](#roadmap--improvements)
* [Contact](#contact)

---

## Project Overview

This repository demonstrates a small but production-minded workflow for a supervised ML classification task (predicting diabetes). It contains data processing scripts, model training and evaluation code, a lightweight API (backend) to serve predictions, and a minimal frontend to interact with the model.

The project is structured so that each part can be extended independently: retrain models with different algorithms, improve preprocessing pipelines, or replace the UI.

---

## Key Features

* Clear separation between `backend` and `frontend`.
* Reproducible training pipeline (data load → preprocessing → model → metrics → artifacts).
* Example API endpoint to request single-record predictions.
* Frontend demo to interact with the model in-browser.
* Easy-to-follow scripts and documented commands for common tasks.

---

## Repository Structure

```
Diabetes_Ml/
├── backend/            # API, training scripts, model artifacts, requirements
├── frontend/           # React/Vue/Vanilla frontend to demo predictions
├── .github/            # Optional: CI/workflow configs
├── README.md           # Project overview (this file)
```

> Note: adjust the tree above if your repo's folders or filenames differ.

---

## Tech Stack

* Python 3.8+ — training & backend.
* Flask / FastAPI (backend) — lightweight ML API.
* Scikit-learn / XGBoost / LightGBM — model training (example uses scikit-learn).
* pandas, numpy — data processing.
* Jupyter notebooks — exploratory analysis (optional).
* Frontend: simple HTML/JS or modern stack (React/Vue) for demo.

---

## Dataset

This project is compatible with the Pima Indians Diabetes dataset (commonly used for diabetes classification) or any similar CSV with these columns:

* Pregnancies
* Glucose
* BloodPressure
* SkinThickness
* Insulin
* BMI
* DiabetesPedigreeFunction
* Age
* Outcome (0 or 1)

**How to provide the dataset**

* Place the CSV in `backend/data/` as `diabetes.csv` or update the path in the training script.
* If your repo already has a dataset file, the training script will try to load it automatically.

---

## Setup & Installation

### Prerequisites

* Python 3.8 or newer
* Node.js and npm/yarn (if using the frontend)
* git

### Run locally (backend)

1. Clone the repo (if not already done):

```bash
git clone https://github.com/URK23CS1197/Diabetes_Ml.git
cd Diabetes_Ml/backend
```

2. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate      # macOS / Linux
.\.venv\Scripts\activate     # Windows (PowerShell)
pip install -r requirements.txt
```

3. Run the API server (example using FastAPI):

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

If the backend uses Flask, the command may be:

```bash
export FLASK_APP=app.py
flask run --host=0.0.0.0 --port=8000
```

### Run locally (frontend)

From the `frontend/` folder, install packages and start the dev server:

```bash
cd ../frontend
npm install
npm run start
# or
# yarn
```

Open `http://localhost:3000` (or the port shown by the dev server) and interact with the demo.

---

## Usage

### Train the model

From `backend/` run the training script. Example:

```bash
python train.py --data data/diabetes.csv --out models/diabetes_model.pkl
```

Notes:

* `train.py` should implement reproducible preprocessing (imputation, scaling), model training, and serialization of the trained model and any required preprocessing pipeline (e.g. using `joblib`).
* Add `--seed` to fix randomness for reproducibility.

### Evaluate the model

Run the evaluation script to compute metrics (accuracy, precision, recall, F1, ROC-AUC):

```bash
python evaluate.py --model models/diabetes_model.pkl --test data/test.csv
```

Include a `reports/` folder to store evaluation outputs (confusion matrix, classification report, ROC curve image).

### Serve predictions (API)

The API should expose an endpoint accepting JSON like:

```json
POST /predict
{
  "Pregnancies": 6,
  "Glucose": 148,
  "BloodPressure": 72,
  "SkinThickness": 35,
  "Insulin": 0,
  "BMI": 33.6,
  "DiabetesPedigreeFunction": 0.627,
  "Age": 50
}
```

Response example:

```json
{
  "prediction": 1,
  "probability": 0.87
}
```

### Frontend demo

The frontend should call `/predict` and display the prediction and probability with simple validation.

---

## Project Design & Decisions

* **Model choice:** Start with logistic regression or RandomForest for baseline clarity, then experiment with ensemble methods.
* **Preprocessing:** Replace zeros in biologically impossible fields (e.g. BMI=0) with median/imputed values. Standardize numeric features for models that need it.
* **Serialization:** Save both the trained model and the preprocessing pipeline (scaler, imputer) together so the API can reconstruct the exact pipeline used at train time.

---

## How to contribute

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/awesome`
3. Commit changes: `git commit -m "Add awesome feature"`
4. Push: `git push origin feature/awesome`
5. Open a Pull Request with description and tests.

Please follow the repository style (PEP8 for Python) and add unit tests for new features.

---

## Testing

* Add unit tests for data preprocessing functions and the API endpoints.
* Use `pytest` for running tests:

```bash
pytest -q
```

---

## CI/CD

This project includes a **complete CI/CD pipeline** using **GitHub Actions**, Docker-based testing, and **Render deployment** through a Service ID. The workflows are located in:

```
.github/workflows/ci_cd.yml
```

### 🔄 Continuous Integration (CI)

Your repository uses a **single unified workflow (`ci_cd.yml`)** that handles model training, evaluation, backend Flask API packaging, and frontend Docker builds.

Here is the accurate CI flow based on your repo structure:

#### **1. Checkout & Setup**

* Pulls the repository
* Sets up Python for backend
* Installs backend dependencies from:

```
backend/requirements.txt
```

#### **2. Train the Model — using `train.py`**

Your CI pipeline executes:

```
python backend/train.py
```

This script performs:

* **Data loading** from your dataset inside backend
* **Model training** (Logistic Regression / RF / etc.)
* **Model evaluation** (accuracy, metrics printed inside workflow)
* **Saving the trained artifacts**, such as:

```
backend/diabetes_model.pkl
backend/diabetes_model.joblib
```

These artifacts are used directly when building the backend Docker container.

#### **3. Backend (Flask API) Docker Build**

Your backend uses **Flask**, located at:

```
backend/main.py   → Flask API entrypoint
backend/Dockerfile
```

CI performs:

* Build backend Docker image
* Copy trained model (`.pkl` / `.joblib`) into the container
* Run backend tests via:

```
backend/test_backend.py
```

Inside Docker, the workflow verifies:

* Flask API starts successfully
* Model loads without errors
* Prediction endpoint returns valid output

This ensures the same behavior Render will use in production.

#### **4. Frontend Docker Build**

Your frontend folder:

```
frontend/
frontend/Dockerfile
```

CI performs:

* Install Node dependencies
* Build production bundle
* Create frontend Docker image
* Optional preview test

The frontend bundle will later be deployed through Render.

---

### 🚀 Continuous Deployment (CD)

Your deployment process is **fully automated** using GitHub Actions + Render API.
Render deployment happens **immediately after CI passes**, and it uses:

* **Render Service ID** (stored securely in GitHub Secrets)
* **Render API Key** (stored as `RENDER_API_KEY`)
* **GitHub Actions workflow (`ci_cd.yml`)** to trigger deployments

#### **CD Workflow Steps**

Once CI completes successfully:

1. GitHub Actions prepares a deployment request for Render
2. It reads the following secrets:

   * `RENDER_API_KEY` → Authenticates GitHub → Render API
   * `RENDER_SERVICE_ID` → Specifies **which Render service** to deploy
3. The workflow sends a `POST` request to the Render Deploy API:

```
https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys
```

4. Render pulls the exact Docker image created in CI
5. Backend Flask API + model artifact + frontend build are deployed automatically
6. Render restarts the service with the new version

#### **What Makes This CD Pipeline Strong**

* **Zero manual deployment** — everything is triggered by pushes to main branch
* **Secure** — API key & service ID are never exposed in repo
* **Consistent** — Render deploys the same tested Docker image from CI
* **Atomic releases** — backend Flask API + model + frontend update together

#### **Secrets Required in GitHub**

Under **Repository → Settings → Secrets and variables → Actions**:

* `RENDER_API_KEY`
* `RENDER_SERVICE_ID`

These are used directly inside the deployment step of `ci_cd.yml`.

#### **End-to-End Flow**

1. Code pushed → CI starts
2. `train.py` trains & evaluates model
3. Model artifact generated
4. Backend Flask API Docker image built + tested
5. Frontend Docker image built
6. Render deployment triggered via Render API + Service ID
7. Production updated automatically

This ensures the latest code + latest validated model are always deployed.

---

## Roadmap / Improvements

* Add CI for tests and linting.
* Add Dockerfiles for backend and frontend for consistent deployment.
* Add a dedicated model registry or tagging for multiple model versions.
* Build a simple mobile-friendly UI and authentication for the API.

---

## Contact

niransonc@karunya.edu.in
