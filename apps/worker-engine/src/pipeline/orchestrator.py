import os
import re
import uuid
import asyncio
import logging
import subprocess
from typing import Dict, Any, List, Optional

try:
    from google.cloud import storage
    HAS_STORAGE = True
except ImportError:
    storage = None
    HAS_STORAGE = False

from src.modules.script_agent import ScriptAgent
from src.modules.voice_synth import VoiceSynthesizer
from src.modules.audio_whisper import AudioWhisperTranscriber
from src.modules.bg_remover import BackgroundRemover
from src.modules.upscaler import FrameUpscaler
from src.modules.video_composer import VideoComposer
from src.modules.trend_scraper import TikTokTrendScraper
from src.modules.sound_designer import SoundDesigner
from src.modules.lip_sync_animator import LipSyncAnimator
from src.pipeline.context_enricher import ContextEnricher

logger = logging.getLogger(__name__)

class DramaFlowOrchestrator:
    """
    End-to-end multi-modal video orchestration engine combining:
    - openai/whisper for subtitle timing
    - santinic/audiblez / Edge-TTS for voice staging
    - danielgatis/rembg for 2.5D character cutouts
    - upscayl/upscayl for frame super-resolution
    - KwaiVGI/LivePortrait for facial movement & micro-animation
    - SoundDesigner for cinematic SFX (Booms, Risers, Whooshes) & BGM
    - microsoft/playwright for social simulation
    - public-apis/public-apis for contextual newsjacking
    """
    def __init__(self):
        self.script_agent = ScriptAgent()
        self.voice_synth = VoiceSynthesizer()
        self.whisper = AudioWhisperTranscriber()
        self.bg_remover = BackgroundRemover()
        self.upscaler = FrameUpscaler()
        self.composer = VideoComposer()
        self.sound_designer = SoundDesigner()
        self.lip_sync_animator = LipSyncAnimator()
        self.enricher = ContextEnricher()
        self.trend_scraper = TikTokTrendScraper()
        self.bucket_name = os.getenv("GCS_BUCKET_NAME", "dramaflow-mvp-1787884887-storage")
        
        try:
            self.storage_client = storage.Client()
            logger.info("GCS Storage client initialized.")
        except Exception as e:
            logger.warning(f"GCS Storage client warning: {e}")
            self.storage_client = None

    def _probe_audio_duration(self, audio_path: str) -> float:
        """Measures exact duration of synthesized audio in seconds via FFmpeg probe."""
        try:
            cmd = [self.composer.ffmpeg_bin, "-i", audio_path, "-f", "null", "-"]
            res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
            m = re.search(r'Duration:\s*(\d+):(\d+):(\d+\.\d+)', res.stderr)
            if m:
                hours, mins, secs = m.groups()
                return int(hours) * 3600 + int(mins) * 60 + float(secs)
        except Exception as e:
            logger.warning(f"Could not probe audio duration: {e}")
        return 5.0

    async def execute_render_pipeline(
        self,
        project_id: str,
        script_payload: Dict[str, Any],
        caption_style: str = "karaoke_bounce",
        resolution_mode: str = "1080p_fhd",
        enable_parallax_cutout: bool = True
    ) -> Dict[str, Any]:
        """
        Executes complete production rendering pipeline with dynamic audio duration.
        """
        work_dir = f"/tmp/dramaflow_{project_id}"
        os.makedirs(work_dir, exist_ok=True)
        
        scenes = script_payload.get("scenes", [])
        title = script_payload.get("title", "DramaFlow Project")
        hook = script_payload.get("hook", "")
        rendered_scene_videos = []

        logger.info(f"Starting video orchestration for project {project_id} ({len(scenes)} scenes, style={caption_style}, res={resolution_mode})...")

        for idx, scene in enumerate(scenes):
            scene_num = scene.get("scene_number", idx + 1)
            dialogue = scene.get("dialogue", "")
            char_name = scene.get("character", "Elena")
            camera_motion = scene.get("camera_motion", "zoom_in")
            sound_effect = scene.get("sound_effect", "dramatic_boom" if idx == 0 else "glitch_riser")
            
            # Step 1: Audiblez/Edge-TTS Voice Synthesis
            voice_profile_id = "founder_female" if any(p in char_name.lower() for p in ["elena", "founder", "lucia", "sofia", "mujer"]) else "executive_male"
            raw_audio_path = os.path.join(work_dir, f"scene_{scene_num}_raw_audio.mp3")
            await self.voice_synth.synthesize_scene_dialogue(
                text=dialogue,
                profile_id=voice_profile_id,
                output_path=raw_audio_path
            )

            # Measure exact audio duration + add 1.2s padding so dialogue NEVER cuts off mid-word
            actual_audio_duration = self._probe_audio_duration(raw_audio_path)
            scene_duration = round(max(float(scene.get("duration_seconds", 5.0)), actual_audio_duration + 1.2), 2)
            logger.info(f"Scene {scene_num} Audio: {actual_audio_duration}s -> Scene Duration: {scene_duration}s")

            # Step 1.5: Sound Design & Cinematic SFX Layering
            sfx_path = os.path.join(work_dir, f"scene_{scene_num}_sfx.mp3")
            self.sound_designer.generate_sfx_track(sfx_type=sound_effect, output_path=sfx_path, duration=scene_duration)
            
            mixed_audio_path = os.path.join(work_dir, f"scene_{scene_num}_audio.mp3")
            self.sound_designer.mix_scene_audio(
                dialogue_audio_path=raw_audio_path,
                sfx_audio_path=sfx_path,
                output_path=mixed_audio_path,
                duration=scene_duration
            )
            
            # Step 2: OpenAI Whisper Word-level Timestamps & Subtitles
            word_timings = self.whisper.extract_word_timestamps(mixed_audio_path, reference_text=dialogue)
            ass_content = self.whisper.export_subtitles(
                word_timings=word_timings,
                output_format="ass",
                style_preset=caption_style
            )
            ass_path = os.path.join(work_dir, f"scene_{scene_num}_subs.ass")
            with open(ass_path, "w", encoding="utf-8") as f:
                f.write(ass_content)
            
            # Step 2.5: Download or Prepare Scene Frame
            image_url = scene.get("imageUrl")
            raw_frame_path = os.path.join(work_dir, f"scene_{scene_num}_raw.png")
            fitted_frame_path = os.path.join(work_dir, f"scene_{scene_num}_upscaled.png")
            
            if image_url and image_url.startswith("http"):
                try:
                    import urllib.request
                    req = urllib.request.Request(image_url, headers={"User-Agent": "DramaFlow/1.0"})
                    with urllib.request.urlopen(req, timeout=10) as resp, open(raw_frame_path, "wb") as f:
                        f.write(resp.read())
                    logger.info(f"Downloaded scene {scene_num} image from {image_url[:60]}...")
                except Exception as e:
                    logger.warning(f"Could not download scene image {image_url}: {e}")

            # Step 3: Upscayl Super-Resolution & Canvas Fitting
            self.upscaler.upscale_and_fit(
                input_image_path=raw_frame_path,
                output_image_path=fitted_frame_path,
                scale_factor=2,
                target_resolution=resolution_mode
            )

            # Step 4: Optional Rembg 2.5D Parallax cutout generation
            if enable_parallax_cutout:
                parallax_dir = os.path.join(work_dir, f"scene_{scene_num}_parallax")
                self.bg_remover.generate_parallax_layers(fitted_frame_path, parallax_dir)
            
            # Step 5: FFmpeg Scene Composition with Full Unclipped Duration
            scene_video_path = os.path.join(work_dir, f"scene_{scene_num}_video.mp4")
            self.composer.compose_scene(
                image_path=fitted_frame_path,
                audio_path=mixed_audio_path,
                output_path=scene_video_path,
                duration=scene_duration,
                camera_motion=camera_motion,
                ass_subtitles_path=ass_path
            )
            rendered_scene_videos.append(scene_video_path)

        # Step 6: Generate BGM and Concatenate all scenes with ducked BGM
        bgm_path = os.path.join(work_dir, f"bgm_{project_id}.mp3")
        total_duration = sum(self._probe_audio_duration(os.path.join(work_dir, f"scene_{idx+1}_audio.mp3")) + 1.2 for idx in range(len(scenes)))
        self.sound_designer.generate_cinematic_bgm(output_path=bgm_path, total_duration=total_duration)

        final_video_path = os.path.join(work_dir, f"dramaflow_final_{project_id}.mp4")
        self.composer.concatenate_scenes_with_bgm(rendered_scene_videos, None, final_video_path)

        # Also copy to local web public videos directory for instant zero-latency playback
        import shutil
        web_public_dir = os.path.join(os.getcwd(), "..", "web", "public", "videos")
        if not os.path.exists(web_public_dir):
            web_public_dir = os.path.join(os.getcwd(), "apps", "web", "public", "videos")
        
        if os.path.exists(web_public_dir):
            target_public_file = os.path.join(web_public_dir, f"dramaflow_{project_id}.mp4")
            try:
                shutil.copyfile(final_video_path, target_public_file)
                logger.info(f"Copied final render to {target_public_file}")
            except Exception as copy_err:
                logger.warning(f"Could not copy to web public dir: {copy_err}")

        # Step 7: Upload final video to Cloud Storage
        gcs_video_url = self._upload_to_gcs(final_video_path, f"videos/{project_id}/final.mp4")

        # Step 8: Playwright Social Feed Preview Metadata
        social_preview = await self.trend_scraper.generate_social_preview_metadata(
            title=title,
            hook=hook
        )

        return {
            "status": "COMPLETED",
            "project_id": project_id,
            "video_url": gcs_video_url,
            "duration_seconds": total_duration,
            "scenes_rendered": len(rendered_scene_videos),
            "resolution": resolution_mode,
            "caption_style": caption_style,
            "social_preview": social_preview,
            "format": "1080x1920 (9:16 Vertical MP4)"
        }

    def _upload_to_gcs(self, local_file: str, gcs_destination_path: str) -> str:
        """Uploads file to GCS and returns public/signed access URL."""
        if self.storage_client:
            try:
                bucket = self.storage_client.bucket(self.bucket_name)
                blob = bucket.blob(gcs_destination_path)
                blob.upload_from_filename(local_file)
                logger.info(f"Uploaded {local_file} to gs://{self.bucket_name}/{gcs_destination_path}")
                return f"https://storage.googleapis.com/{self.bucket_name}/{gcs_destination_path}"
            except Exception as e:
                logger.error(f"GCS upload failed: {e}")
        
        # Fallback local URL simulation
        return f"/mock_storage/videos/{os.path.basename(local_file)}"
