import os
import uuid
import logging
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.modules.script_agent import ScriptAgent
from src.pipeline.orchestrator import DramaFlowOrchestrator
from src.modules.trend_scraper import TikTokTrendScraper
from src.modules.voice_synth import VoiceSynthesizer
from src.modules.audio_whisper import AudioWhisperTranscriber
from src.modules.bg_remover import BackgroundRemover
from src.modules.upscaler import FrameUpscaler
from src.modules.public_apis_client import PublicApisClient
from src.pipeline.context_enricher import ContextEnricher
from src.modules.f5_tts_engine import EmotionalTTSWrapper
from src.modules.visual_consistency import InstantIDConsistencyEngine, LivePortraitSynchronizer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("dramaflow-worker")

app = FastAPI(
    title="DramaFlow AI — Render & Intelligence Worker",
    version="1.1.0",
    description="Full-stack AI video generation engine with Whisper, Audiblez, Rembg, Upscayl, Playwright, and Public APIs."
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory task tracker
TASKS_DB: Dict[str, Dict[str, Any]] = {}

orchestrator = DramaFlowOrchestrator()
script_agent = ScriptAgent()
trend_scraper = TikTokTrendScraper()
voice_synth = VoiceSynthesizer()
whisper = AudioWhisperTranscriber()
bg_remover = BackgroundRemover()
upscaler = FrameUpscaler()
public_apis = PublicApisClient()
context_enricher = ContextEnricher()
emotional_tts = EmotionalTTSWrapper()
instant_id = InstantIDConsistencyEngine()
live_portrait = LivePortraitSynchronizer()

# Request Models
class GenerateScriptRequest(BaseModel):
    niche: str = Field(..., example="E-commerce SaaS")
    value_prop: str = Field(..., example="Automates inventory sync in 10 seconds")
    archetype: str = Field(default="Underdog Founder vs Skeptical Client", example="Underdog Founder vs Skeptical Client")
    target_audience: Optional[str] = Field(default="Shopify Brand Owners")
    custom_instructions: Optional[str] = Field(default="")
    enable_live_data: Optional[bool] = Field(default=True)

class RenderVideoRequest(BaseModel):
    project_id: str
    script_payload: Dict[str, Any]
    caption_style: Optional[str] = Field(default="karaoke_bounce")
    resolution_mode: Optional[str] = Field(default="1080p_fhd")
    enable_parallax_cutout: Optional[bool] = Field(default=True)

class VoiceSynthesisRequest(BaseModel):
    text: str
    profile_id: Optional[str] = "founder_female"
    custom_speed: Optional[float] = None
    custom_pitch: Optional[float] = None

class SubtitleExportRequest(BaseModel):
    text: str
    format: Optional[str] = "ass"
    style_preset: Optional[str] = "karaoke_bounce"

class ImageUpscaleRequest(BaseModel):
    image_url_or_path: str
    scale_factor: Optional[int] = 2
    resolution: Optional[str] = "1080p_fhd"

@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "dramaflow-worker-engine",
        "version": "1.1.0",
        "modules": {
            "crewai": "READY",
            "whisperx": "READY",
            "f5_tts": "READY",
            "instant_id": "READY",
            "live_portrait": "READY",
            "whisper": "READY",
            "audiblez": "READY",
            "rembg": "READY",
            "upscayl": "READY",
            "playwright": "READY",
            "public_apis": "READY"
        },
        "region": os.getenv("GCP_REGION", "us-central1"),
        "project_id": os.getenv("GCP_PROJECT_ID", "dramaflow-mvp-1787884887")
    }

# 1. Script Generation with Public APIs live enrichment
@app.post("/api/v1/generate-script")
async def generate_script_endpoint(req: GenerateScriptRequest):
    try:
        enriched_info = None
        if req.enable_live_data:
            enriched_info = await context_enricher.enrich(niche=req.niche, value_prop=req.value_prop)
        
        script = await script_agent.generate_script(
            niche=req.niche,
            value_prop=req.value_prop,
            archetype=req.archetype,
            target_audience=req.target_audience,
            custom_instructions=f"{req.custom_instructions} Context Fact: {enriched_info.get('urgency_trigger', '') if enriched_info else ''}"
        )
        return {
            "status": "SUCCESS",
            "data": script,
            "enrichment": enriched_info
        }
    except Exception as e:
        logger.error(f"Script generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 2. Playwright Trend Scraper
@app.get("/api/v1/trends")
async def get_trends(niche: str = "business", platform: str = "tiktok"):
    trends = await trend_scraper.scrape_trending_hooks(niche=niche, platform=platform)
    return {"status": "SUCCESS", "niche": niche, "platform": platform, "trends": trends}

# 3. Audiblez Character Voice Profiles
@app.get("/api/v1/voice/profiles")
async def get_voice_profiles():
    return {"status": "SUCCESS", "profiles": voice_synth.list_voice_profiles()}

@app.get("/api/v1/voice/preview-audio")
async def preview_voice_audio_stream(
    voice_id: str = Query(default="founder_female"),
    text: str = Query(default="Mirá bien las métricas. Automatizamos todo el flujo y multiplicamos las ventas por cuatro."),
    emotion: Optional[str] = Query(default="determined")
):
    from fastapi.responses import FileResponse
    out_path = f"/tmp/preview_{voice_id}_{uuid.uuid4().hex[:6]}.mp3"
    await voice_synth.synthesize_scene_dialogue(
        text=text,
        profile_id=voice_id,
        output_path=out_path,
        emotion=emotion
    )
    return FileResponse(out_path, media_type="audio/mpeg", filename=f"{voice_id}.mp3")

@app.post("/api/v1/voice/synthesize")
async def synthesize_voice_endpoint(req: VoiceSynthesisRequest):
    try:
        out_path = f"/tmp/preview_voice_{uuid.uuid4().hex[:8]}.mp3"
        await voice_synth.synthesize_scene_dialogue(
            text=req.text,
            profile_id=req.profile_id or "founder_female",
            output_path=out_path,
            custom_speed=req.custom_speed,
            custom_pitch=req.custom_pitch
        )
        return {"status": "SUCCESS", "audio_path": out_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Whisper Subtitle Export
@app.post("/api/v1/subtitles/export")
async def export_subtitles_endpoint(req: SubtitleExportRequest):
    timings = whisper.extract_word_timestamps("", reference_text=req.text)
    subs = whisper.export_subtitles(
        word_timings=timings,
        output_format=req.format or "ass",
        style_preset=req.style_preset or "karaoke_bounce"
    )
    return {"status": "SUCCESS", "format": req.format, "subtitles": subs, "word_timings": timings}

# 5. Public APIs Catalog & Live Newsjacking Hook
@app.get("/api/v1/public-apis")
async def list_public_apis(category: Optional[str] = None):
    return {"status": "SUCCESS", "apis": public_apis.list_available_apis(category=category)}

@app.get("/api/v1/public-apis/live-context")
async def get_live_context(niche: str = "business", topic: str = ""):
    data = await public_apis.fetch_live_narrative_context(niche=niche, topic=topic)
    return {"status": "SUCCESS", "data": data}

# 6. Render Video Task Pipeline
async def _async_render_job(
    task_id: str,
    project_id: str,
    script_payload: Dict[str, Any],
    caption_style: str,
    resolution_mode: str,
    enable_parallax_cutout: bool
):
    try:
        TASKS_DB[task_id]["status"] = "PROCESSING"
        TASKS_DB[task_id]["progress"] = 25
        
        result = await orchestrator.execute_render_pipeline(
            project_id=project_id,
            script_payload=script_payload,
            caption_style=caption_style,
            resolution_mode=resolution_mode,
            enable_parallax_cutout=enable_parallax_cutout
        )
        
        TASKS_DB[task_id]["status"] = "COMPLETED"
        TASKS_DB[task_id]["progress"] = 100
        TASKS_DB[task_id]["result"] = result
    except Exception as e:
        logger.error(f"Render job {task_id} failed: {e}")
        TASKS_DB[task_id]["status"] = "FAILED"
        TASKS_DB[task_id]["error"] = str(e)

@app.post("/api/v1/render-video")
async def render_video_endpoint(req: RenderVideoRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    TASKS_DB[task_id] = {
        "task_id": task_id,
        "project_id": req.project_id,
        "status": "QUEUED",
        "progress": 0,
        "result": None,
        "error": None
    }
    
    background_tasks.add_task(
        _async_render_job,
        task_id=task_id,
        project_id=req.project_id,
        script_payload=req.script_payload,
        caption_style=req.caption_style or "karaoke_bounce",
        resolution_mode=req.resolution_mode or "1080p_fhd",
        enable_parallax_cutout=req.enable_parallax_cutout if req.enable_parallax_cutout is not None else True
    )
    
    return {
        "status": "QUEUED",
        "task_id": task_id,
        "poll_url": f"/api/v1/status/{task_id}"
    }

@app.get("/api/v1/status/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in TASKS_DB:
        raise HTTPException(status_code=404, detail="Task ID not found")
    return TASKS_DB[task_id]

# 6. CrewAI Multi-Agent Pipeline (Guionista + Director de Arte + Editor de Ritmo)
class CrewDramaRequest(BaseModel):
    tema: str = Field(..., example="Conflicto entre socios por robo de startup")
    nicho: str = Field(..., example="Emprendimiento SaaS B2B")

@app.post("/api/v1/crew/generate-minidrama")
async def generate_crew_minidrama(req: CrewDramaRequest):
    try:
        from src.crew_orchestrator import generar_minidrama
        result = generar_minidrama(tema=req.tema, nicho=req.nicho)
        return {
            "status": "SUCCESS",
            "tema": req.tema,
            "nicho": req.nicho,
            "crew_output": str(result)
        }
    except Exception as e:
        logger.error(f"CrewAI execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 7. Emotional Voice Synthesis (F5-TTS / CosyVoice 2)
class EmotionalTTSRequest(BaseModel):
    text: str
    emotion: str = Field(default="furious", example="whisper, shouting, sarcastic, furious, desperate, confident")
    gender: Optional[str] = "female"
    output_filename: Optional[str] = "emotional_voice.wav"

@app.post("/api/v1/tts/emotional")
async def synthesize_emotional_speech_endpoint(req: EmotionalTTSRequest):
    try:
        path = await emotional_tts.synthesize_emotional_speech(
            text=req.text,
            emotion=req.emotion,
            voice_gender=req.gender or "female",
            output_wav_path=f"temp_render/{req.output_filename}"
        )
        return {
            "status": "SUCCESS",
            "audio_path": path,
            "emotion_applied": req.emotion
        }
    except Exception as e:
        logger.error(f"Emotional TTS error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 8. WhisperX Word-Level Alignment
class WhisperXAlignRequest(BaseModel):
    audio_path: str
    reference_text: Optional[str] = ""

@app.post("/api/v1/subtitles/whisperx")
async def whisperx_alignment_endpoint(req: WhisperXAlignRequest):
    try:
        words = whisper.extract_word_timestamps_whisperx(audio_path=req.audio_path)
        return {
            "status": "SUCCESS",
            "words_count": len(words),
            "words": words
        }
    except Exception as e:
        logger.error(f"WhisperX error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 9. Visual Consistency (InstantID & LivePortrait)
class CharacterConsistencyRequest(BaseModel):
    character_name: str
    reference_face_path: str
    visual_prompt: str
    camera_angle: Optional[str] = "close-up"

@app.post("/api/v1/visual/instantid-frame")
async def generate_instantid_frame_endpoint(req: CharacterConsistencyRequest):
    try:
        frame_path = await instant_id.generate_consistent_character_frame(
            character_name=req.character_name,
            reference_face_path=req.reference_face_path,
            visual_prompt=req.visual_prompt,
            camera_angle=req.camera_angle or "close-up"
        )
        return {
            "status": "SUCCESS",
            "frame_path": frame_path,
            "character": req.character_name
        }
    except Exception as e:
        logger.error(f"InstantID error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8080)), reload=True)
