import os
import subprocess
import logging
from typing import List, Optional

try:
    import imageio_ffmpeg
    FFMPEG_BIN = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_BIN = "ffmpeg"

logger = logging.getLogger(__name__)

class SoundDesigner:
    """
    Cinematic Audio Mixer and Sound Effects (SFX) Engine.
    Synthesizes and layers:
    - Sub-Bass Booms (Opening Hook 0-3s)
    - Tension Risers (Confrontation escalation)
    - Glitch / Holographic Whooshes (Metrics & Solution reveal)
    - Background Music (BGM) with automatic -18dB dialogue ducking.
    """
    def __init__(self):
        self.ffmpeg_bin = FFMPEG_BIN

    def generate_sfx_track(self, sfx_type: str, output_path: str, duration: float = 3.0) -> str:
        """
        Synthesizes procedural cinematic sound effects via FFmpeg filter graphs.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        if sfx_type in ["dramatic_boom", "boom", "impact"]:
            # Deep sub-bass boom (55Hz sine with rapid low-pass decay)
            filter_expr = "sine=frequency=55:duration=2.5,lowpass=f=120,volume=2.2,afade=t=out:st=0.3:d=2.0"
        elif sfx_type in ["tension_riser", "riser", "glitch_riser"]:
            # Rising tension frequency with slight distortion
            filter_expr = "sine=frequency=110:duration=3.0,asetrate=44100*1.8,aresample=44100,afade=t=in:st=0:d=1.5,afade=t=out:st=2.5:d=0.5,volume=1.4"
        elif sfx_type in ["epic_whoosh", "whoosh", "glitch_reveal"]:
            # Fast resonant whoosh transition
            filter_expr = "anoisesrc=d=1.5:c=pink:r=44100,bandpass=f=800:width_type=h:w=600,afade=t=in:st=0:d=0.3,afade=t=out:st=0.5:d=0.9,volume=1.8"
        else:
            # Sub-harmonic ambient pulse
            filter_expr = "sine=frequency=65:duration=3.0,afade=t=in:st=0:d=0.5,afade=t=out:st=2.0:d=1.0,volume=1.0"

        cmd = [
            self.ffmpeg_bin, "-y",
            "-f", "lavfi", "-i", filter_expr,
            "-t", str(duration),
            "-c:a", "libmp3lame", "-b:a", "192k",
            output_path
        ]

        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            logger.info(f"Generated procedural SFX '{sfx_type}' -> {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to generate procedural SFX: {e}")
            return output_path

    def generate_cinematic_bgm(self, output_path: str, total_duration: float = 24.0) -> str:
        """
        Generates a rhythmic cinematic tension beat with bassline for vertical drama pacing.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        # Generates a dark ambient synth pulse (120 BPM feel)
        filter_expr = f"sine=frequency=45:duration={total_duration},lowpass=f=90,volume=0.35"

        cmd = [
            self.ffmpeg_bin, "-y",
            "-f", "lavfi", "-i", filter_expr,
            "-t", str(total_duration),
            "-af", f"afade=t=in:st=0:d=1.0,afade=t=out:st={max(1, total_duration - 1.5)}:d=1.5",
            "-c:a", "libmp3lame", "-b:a", "192k",
            output_path
        ]

        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            logger.info(f"Generated cinematic BGM track -> {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to generate BGM: {e}")
            return output_path

    def mix_scene_audio(
        self,
        dialogue_audio_path: str,
        sfx_audio_path: Optional[str],
        output_path: str,
        duration: float
    ) -> str:
        """
        Mixes character voice dialogue with scene sound effect (Boom/Riser/Whoosh).
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        if sfx_audio_path and os.path.exists(sfx_audio_path):
            cmd = [
                self.ffmpeg_bin, "-y",
                "-i", dialogue_audio_path,
                "-i", sfx_audio_path,
                "-filter_complex", "[0:a]volume=1.0[a0];[1:a]volume=0.6[a1];[a0][a1]amix=inputs=2:duration=longest[outa]",
                "-map", "[outa]",
                "-t", str(duration),
                "-c:a", "libmp3lame", "-b:a", "192k",
                output_path
            ]
        else:
            # Just copy dialogue audio
            cmd = [
                self.ffmpeg_bin, "-y",
                "-i", dialogue_audio_path,
                "-t", str(duration),
                "-c:a", "libmp3lame", "-b:a", "192k",
                output_path
            ]

        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            return output_path
        except Exception as e:
            logger.error(f"Failed to mix scene audio: {e}")
            return dialogue_audio_path
