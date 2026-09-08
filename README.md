# DramaFlow AI — TikTok Mini-Drama SaaS Engine MVP

> Generate viral 9:16 vertical TikTok mini-dramas from scratch in under 60 seconds.

## Overview
DramaFlow AI is a specialized cloud-native SaaS platform built on Google Cloud Platform (GCP). It automates the end-to-end production of micro-dramas for businesses, brand storytellers, and creators:
1. **3-Act Script Generation:** Uses **Vertex AI (Gemini 2.0 Flash)** to engineer high-tension, high-retention hooks and narrative arcs.
2. **Multi-Character Voice Synthesis:** Powered by **Google Cloud Neural2 TTS** and character pitch/tone profiles.
3. **Word-Level Subtitle Timing:** Leverages **Whisper** to extract millisecond-accurate timestamps for bouncing TikTok/CapCut-style karaoke captions.
4. **Visual Enhancements:** Features **Rembg** for 2.5D character cutouts and **Real-ESRGAN** upscaling for crisp 1080x1920 vertical video.
5. **Dynamic Video Assembly:** Automated via an **FFmpeg** render pipeline with Ken Burns camera zoom, audio ducking (-18dB dialogue focus), sound effect triggers, and 1080p MP4 exports.

---

## Monorepo Architecture

```
drama-flow-saas/
├── apps/
│   ├── web/                     # Next.js 14 (App Router, Tailwind CSS, Lucide)
│   └── worker-engine/           # Python 3.11 FastAPI Render Service (FFmpeg, Vertex AI, Whisper)
├── .env                         # GCP Bindings & Environment Variables
├── cloudbuild.yaml              # Google Cloud Build & Cloud Run Deploy Pipeline
├── docker-compose.yml           # Local Multi-Service Orchestrator
└── README.md
```

---

## Infrastructure Bindings

- **GCP Project ID:** `dramaflow-mvp-1787884887`
- **GCP Region:** `us-central1`
- **Billing Account ID:** `010849-F1F4FD-7A10D8`
- **Storage Bucket:** `gs://dramaflow-mvp-1787884887-storage`
- **Service Account:** `antigravity-agent@dramaflow-mvp-1787884887.iam.gserviceaccount.com`

---

## Quickstart (Local Development)

### 1. Web App
```bash
cd apps/web
npm install
npm run dev
# Running on http://localhost:3000
```

### 2. Worker Engine
```bash
cd apps/worker-engine
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8080
# Running on http://localhost:8080
```

### 3. Docker Compose (Full Stack)
```bash
docker-compose up --build
```
