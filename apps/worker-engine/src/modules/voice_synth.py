import os
import re
import asyncio
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

try:
    import imageio_ffmpeg
    FFMPEG_BIN = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_BIN = "ffmpeg"

try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    edge_tts = None
    HAS_EDGE_TTS = False

try:
    from elevenlabs.client import ElevenLabs
    from elevenlabs import VoiceSettings
    HAS_ELEVENLABS = True
except ImportError:
    ElevenLabs = None
    HAS_ELEVENLABS = False

try:
    from google.cloud import texttospeech
    HAS_GOOGLE_TTS = True
except ImportError:
    texttospeech = None
    HAS_GOOGLE_TTS = False

logger = logging.getLogger(__name__)

@dataclass
class CharacterVoiceProfile:
    id: str
    name: str
    role: str
    gender: str
    voice_preset: str
    edge_voice: str
    speaking_rate: float
    pitch: float
    emotion: str
    language_code: str = "es-AR"

DEFAULT_VOICE_PROFILES: Dict[str, CharacterVoiceProfile] = {
    "founder_female": CharacterVoiceProfile(
        id="founder_female",
        name="Elena (Fundadora)",
        role="Protagonista",
        gender="FEMALE",
        voice_preset="es-AR-Neural2-A",
        edge_voice="es-AR-ElenaNeural",
        speaking_rate=1.08,
        pitch=0.0,
        emotion="determined",
        language_code="es-AR"
    ),
    "executive_male": CharacterVoiceProfile(
        id="executive_male",
        name="Marcos (Directivo)",
        role="Antagonista",
        gender="MALE",
        voice_preset="es-AR-Neural2-B",
        edge_voice="es-AR-TomasNeural",
        speaking_rate=1.04,
        pitch=-2.0,
        emotion="skeptical",
        language_code="es-AR"
    ),
    "innovator_female": CharacterVoiceProfile(
        id="innovator_female",
        name="Sofía (Ingeniera)",
        role="Innovadora",
        gender="FEMALE",
        voice_preset="es-MX-Neural2-A",
        edge_voice="es-MX-DaliaNeural",
        speaking_rate=1.10,
        pitch=1.0,
        emotion="excited",
        language_code="es-MX"
    ),
    "investor_male": CharacterVoiceProfile(
        id="investor_male",
        name="David (Inversor)",
        role="Inversor VC",
        gender="MALE",
        voice_preset="es-MX-Neural2-B",
        edge_voice="es-MX-JorgeNeural",
        speaking_rate=1.02,
        pitch=-3.0,
        emotion="authoritative",
        language_code="es-MX"
    ),
    "spanish_female": CharacterVoiceProfile(
        id="spanish_female",
        name="Lucía (Emprendedora)",
        role="Protagonista",
        gender="FEMALE",
        voice_preset="es-ES-Neural2-A",
        edge_voice="es-ES-ElviraNeural",
        speaking_rate=1.05,
        pitch=0.0,
        emotion="dramatic",
        language_code="es-ES"
    ),
    "spanish_male": CharacterVoiceProfile(
        id="spanish_male",
        name="Carlos (Gerente)",
        role="Antagonista",
        gender="MALE",
        voice_preset="es-ES-Neural2-B",
        edge_voice="es-ES-AlvaroNeural",
        speaking_rate=1.05,
        pitch=-2.5,
        emotion="authoritative",
        language_code="es-ES"
    )
}

EMOTION_MODIFIERS: Dict[str, Dict[str, str]] = {
    "determined": {"rate": "+8%", "pitch": "-4Hz"},
    "skeptical": {"rate": "-6%", "pitch": "-8Hz"},
    "excited": {"rate": "+22%", "pitch": "+18Hz"},
    "dramatic": {"rate": "-16%", "pitch": "-12Hz"},
    "authoritative": {"rate": "-2%", "pitch": "-22Hz"},
}

class VoiceSynthesizer:
    def __init__(self):
        self.profiles = DEFAULT_VOICE_PROFILES
        self.ffmpeg_bin = FFMPEG_BIN

    def list_voice_profiles(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": p.id,
                "name": p.name,
                "role": p.role,
                "gender": p.gender,
                "language_code": p.language_code,
                "edge_voice": p.edge_voice,
                "emotion": p.emotion
            }
            for p in self.profiles.values()
        ]

    async def synthesize_scene_dialogue(
        self,
        text: str,
        profile_id: str = "founder_female",
        output_path: str = "/tmp/dialogue.mp3",
        custom_speed: Optional[float] = None,
        custom_pitch: Optional[float] = None,
        emotion: Optional[str] = None
    ) -> str:
        """
        Synthesizes high-fidelity speech for a scene character.
        Uses Edge-TTS Neural voices with emotional rate/pitch modulation.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        profile = self.profiles.get(profile_id, self.profiles.get("founder_female"))
        if not profile:
            profile = DEFAULT_VOICE_PROFILES["founder_female"]
        
        # Determine emotion modifiers
        emo_key = emotion or profile.emotion or "determined"
        mod = EMOTION_MODIFIERS.get(emo_key, {"rate": "+0%", "pitch": "+0Hz"})
        
        rate_str = mod["rate"]
        pitch_str = mod["pitch"]

        if custom_speed:
            rate_pct = int((custom_speed - 1.0) * 100)
            rate_str = f"{'+' if rate_pct >= 0 else ''}{rate_pct}%"

        # 0. Google Cloud Text-to-Speech (Neural2 High-Fidelity)
        if HAS_GOOGLE_TTS:
            try:
                # Ensure credentials file is mapped
                key_candidates = [
                    os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
                    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../dramaflow-508012-a00a72dcff1e.json")),
                    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../dramaflow-508012-a00a72dcff1e.json")),
                    "/app/dramaflow-508012-a00a72dcff1e.json",
                ]
                for cand in key_candidates:
                    if cand and os.path.exists(cand):
                        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = cand
                        break

                tts_client = texttospeech.TextToSpeechClient()
                synthesis_input = texttospeech.SynthesisInput(text=text)
                
                voice_name = profile.voice_preset if "Neural2" in getattr(profile, "voice_preset", "") else "es-US-Neural2-A"
                lang_code = profile.language_code or "es-US"
                ssml_gender = texttospeech.SsmlVoiceGender.FEMALE if profile.gender == "FEMALE" else texttospeech.SsmlVoiceGender.MALE

                voice_params = texttospeech.VoiceSelectionParams(
                    language_code=lang_code,
                    name=voice_name,
                    ssml_gender=ssml_gender
                )

                audio_config = texttospeech.AudioConfig(
                    audio_encoding=texttospeech.AudioEncoding.MP3,
                    speaking_rate=profile.speaking_rate or 1.05,
                    pitch=profile.pitch or 0.0
                )

                response = tts_client.synthesize_speech(
                    input=synthesis_input,
                    voice=voice_params,
                    audio_config=audio_config
                )

                with open(output_path, "wb") as out:
                    out.write(response.audio_content)

                if os.path.exists(output_path) and os.path.getsize(output_path) > 300:
                    logger.info(f"Synthesized Google Cloud Neural2 voice for '{profile.name}' ({voice_name}) -> {output_path}")
                    return output_path
            except Exception as gcp_err:
                logger.warning(f"Google Cloud TTS fallback triggered: {gcp_err}")

        # 1. ElevenLabs High-Fidelity Voice Synthesis if API Key configured
        eleven_api_key = os.getenv("ELEVENLABS_API_KEY")
        if HAS_ELEVENLABS and eleven_api_key:
            try:
                voice_mapping = {
                    "founder_female": "EXAVITQu4vr4xnSDxMaL",   # Sarah
                    "executive_male": "CwhRBWXzGAHq8TQ4Fs17",   # Roger
                    "fundadora_pro": "EXAVITQu4vr4xnSDxMaL",     # Sarah
                    "ejecutivo_latino": "CwhRBWXzGAHq8TQ4Fs17",  # Roger
                    "narrador_epico": "JBFqnCBsd6RMkjVDRZzb",    # George
                    "tiktoker_rapido": "TX3LPaxmHKxFdv7VOQHJ",   # Liam
                }
                voice_id = voice_mapping.get(profile_id, "EXAVITQu4vr4xnSDxMaL")
                if ElevenLabs:
                    client = ElevenLabs(api_key=eleven_api_key)
                    audio_gen = client.text_to_speech.convert(
                        text=text,
                        voice_id=voice_id,
                        model_id="eleven_multilingual_v2",
                        output_format="mp3_44100_128"
                    )
                    with open(output_path, "wb") as f:
                        for chunk in audio_gen:
                            if chunk:
                                f.write(chunk)
                else:
                    import elevenlabs
                    elevenlabs.set_api_key(eleven_api_key)
                    audio = elevenlabs.generate(
                        text=text,
                        voice=voice_id,
                        model="eleven_multilingual_v2"
                    )
                    elevenlabs.save(audio, output_path)

                if os.path.exists(output_path) and os.path.getsize(output_path) > 500:
                    logger.info(f"Synthesized ElevenLabs voice for '{profile.name}' ({voice_id}) -> {output_path}")
                    return output_path
            except Exception as e:
                logger.warning(f"ElevenLabs synthesis error: {e}. Falling back to Edge-TTS.")

        # 1. Edge-TTS Neural Voice Synthesis with real pitch/rate modulation
        if HAS_EDGE_TTS:
            try:
                voice = profile.edge_voice or "es-AR-ElenaNeural"
                clean_text = re.sub(r'\[pause:?\s*([0-9.]+)s?\]', ' ... ', text)
                communicate = edge_tts.Communicate(
                    text=clean_text,
                    voice=voice,
                    rate=rate_str,
                    pitch=pitch_str
                )
                await communicate.save(output_path)
                if os.path.exists(output_path) and os.path.getsize(output_path) > 300:
                    logger.info(f"Synthesized Edge-TTS for '{profile.name}' ({voice}, emo={emo_key}, rate={rate_str}, pitch={pitch_str}) -> {output_path}")
                    return output_path
            except Exception as e:
                logger.warning(f"Edge-TTS synthesis error: {e}. Trying fallback audio.")

        # 2. FFmpeg fallback
        self._generate_fallback_audio(output_path, duration_seconds=max(3, len(text.split()) // 3))
        return output_path

    def _generate_fallback_audio(self, output_path: str, duration_seconds: int = 5):
        """Generates valid silent/tone mp3 so FFmpeg composition never fails"""
        import subprocess
        try:
            cmd = [
                self.ffmpeg_bin, "-y", "-f", "lavfi",
                "-i", "anullsrc=r=44100:cl=stereo",
                "-t", str(duration_seconds),
                "-c:a", "libmp3lame", "-b:a", "128k",
                output_path
            ]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            logger.info(f"Generated valid fallback audio stream -> {output_path}")
        except Exception as e:
            logger.error(f"Failed to generate fallback audio with FFmpeg: {e}")
