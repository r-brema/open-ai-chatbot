# open-ai-chatbot

# MedBot – Healthcare ChatBot with Streaming AI Responses

This project implements a healthcare chatbot using **FastAPI** for the backend and **React Chatify** for the frontend. The AI responses are streamed via **WebSocket** using OpenAI’s API, creating a smooth typing effect in the chat bubbles.

---

## Project Structure

project-root/
│
├─ main.py # FastAPI app
├─ requirements.txt # Python dependencies
│
├─ client/ # Vite + React Chatify frontend
│ └─ ...
│
├─ venv/ # Python virtual environment
├─ .env
└─ README.md


---

## Setup Instructions

**1. Clone the repository**

```bash
git clone https://github.com/r-brema/open-ai-chatbot.git
cd medbot

**2. Backend Setup****
a. Create Python virtual environment (if not already created)


b. Activate virtual environment

**Windows:**

venv\Scripts\activate

**
Linux/Mac:**

source venv/bin/activate

**c. Install backend dependencies**
pip install -r backend/requirements.txt

**3. Frontend Setup**
cd client
npm install

**4. Run Backend (FastAPI)**
# From project root
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

**5. Run Frontend (React Chatify)**
cd client
npm run dev


The frontend connects to the backend WebSocket for streaming AI responses.

**6. WebSocket Integration**

**Backend endpoint:** ws://localhost:8000/askAI

Frontend connects via React Chatify and streams AI tokens in real-time.

[END] token signals completion of AI response.

Chat bubbles display accumulated tokens using streamMessage and finalize with endStreamMessage.


**7. Pushing to GitHub**
# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - MedBot WebSocket streaming chatbot"

# Add remote
git remote add origin https://github.com/r-brema/open-ai-chatbot.git

# Push
git push -u origin main
