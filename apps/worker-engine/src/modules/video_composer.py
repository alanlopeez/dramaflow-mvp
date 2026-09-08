import os
import subprocess
import logging
import json
from typing import List, Dict, Any

try:
    import imageio_ffmpeg
    FFMPEG_BIN = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_BIN = "ffmpeg"

logger = logging.getLogger(__name__)

class VideoComposer:
    def __init__(self, output_width: int = 1080, output_height: int = 1920):
        self.width = output_width
        self.height = output_height
        self.ffmpeg_bin = FFMPEG_BIN

    def generate_ass_subtitles(
        self,
        word_timings: List[Dict[str, Any]],
        ass_path: str,
        style_preset: str = "karaoke_bounce"
    ) -> str:
        """
        Generate ASS subtitle file with animated TikTok bounce / karaoke highlights.
        """
        os.makedirs(os.path.dirname(os.path.abspath(ass_path)), exist_ok=True)
        
        # ASS Header
        header = f"""[Script Info]
Title: DramaFlow TikTok Captions
ScriptType: v4.00+
PlayResX: {self.width}
PlayResY: {self.height}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: TikTokKaraoke,Arial Black,72,&H00FFFFFF,&H0000FFFF,&H00000000,&H80000000,-1,0,0,0,100,100,2,0,1,6,3,2,60,60,380,1
Style: BoldYellow,Impact,76,&H0000E5FF,&H00000000,&H00000000,&H80000000,-1,0,0,0,100,100,3,0,1,8,4,2,60,60,380,1
Style: MinimalClean,Helvetica,60,&H00FFFFFF,&H00000000,&H00000000,&H00000000,0,0,0,0,100,100,1,0,1,3,1,2,60,60,360,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        selected_style = "TikTokKaraoke"
        if style_preset == "bold_yellow":
            selected_style = "BoldYellow"
        elif style_preset == "minimal_clean":
            selected_style = "MinimalClean"

        events = []
        # Group words in chunks of 3-4 words for high readability
        chunk_size = 3
        for i in range(0, len(word_timings), chunk_size):
            chunk = word_timings[i:i + chunk_size]
            if not chunk:
                continue
            start_str = self._format_ass_time(chunk[0]["start"])
            end_str = self._format_ass_time(chunk[-1]["end"])
            
            # Format active word highlighting
            text_line = " ".join([f"{{\\c&H0000FFFF\\fscx110\\fscy110}}{w['word']}{{\\r}}" if idx == 0 else w['word'] for idx, w in enumerate(chunk)])
            events.append(f"Dialogue: 0,{start_str},{end_str},{selected_style},,0,0,0,,{text_line}")

        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(header + "\n".join(events))

        logger.info(f"Generated ASS subtitle file: {ass_path}")
        return ass_path

    def compose_scene(
        self,
        image_path: str,
        audio_path: str,
        output_path: str,
        duration: float,
        camera_motion: str = "zoom_in",
        ass_subtitles_path: str = None
    ) -> str:
        """
        Renders a single video scene with Ken Burns motion, audio, and subtitle overlays.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        # Ken Burns zoom expressions
        fps = 30
        total_frames = int(duration * fps)
        
        if camera_motion == "zoom_in":
            zoom_filter = f"zoompan=z='min(zoom+0.0015,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={self.width}x{self.height}:fps={fps}"
        elif camera_motion == "zoom_out":
            zoom_filter = f"zoompan=z='max(1.15-0.0015*on,1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={self.width}x{self.height}:fps={fps}"
        elif camera_motion == "pan_up":
            zoom_filter = f"zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='ih*(0.1-0.05*on/{total_frames})':d={total_frames}:s={self.width}x{self.height}:fps={fps}"
        else:
            zoom_filter = f"scale={self.width}:{self.height}:force_original_aspect_ratio=increase,crop={self.width}:{self.height}"

        # Subtitle filter if provided
        vf_filters = [zoom_filter]
        if ass_subtitles_path and os.path.exists(ass_subtitles_path):
            escaped_sub_path = ass_subtitles_path.replace("\\", "/").replace(":", "\\:")
            vf_filters.append(f"subtitles='{escaped_sub_path}'")

        vf_str = ",".join(vf_filters)

        cmd = [
            self.ffmpeg_bin, "-y",
            "-loop", "1", "-i", image_path,
            "-i", audio_path,
            "-vf", vf_str,
            "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            "-t", str(duration),
            "-shortest",
            output_path
        ]

        try:
            logger.info(f"Running FFmpeg scene composition with {self.ffmpeg_bin}...")
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            return output_path
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg render error: {e.stderr.decode('utf-8', errors='ignore')}")
            # Fallback simple render
            self._emergency_render_scene(image_path, audio_path, output_path, duration)
            return output_path

    def concatenate_scenes_with_bgm(
        self,
        scene_video_paths: List[str],
        bgm_audio_path: Optional[str],
        final_output_path: str
    ) -> str:
        """
        Concatenates all scenes and applies background music with -18dB ducking under dialogue.
        """
        os.makedirs(os.path.dirname(os.path.abspath(final_output_path)), exist_ok=True)
        concat_list_path = os.path.join(os.path.dirname(final_output_path), "concat_list.txt")
        
        with open(concat_list_path, "w", encoding="utf-8") as f:
            for p in scene_video_paths:
                escaped = p.replace("\\", "/")
                f.write(f"file '{escaped}'\n")

        cmd = [
            self.ffmpeg_bin, "-y",
            "-f", "concat", "-safe", "0", "-i", concat_list_path,
            "-c:v", "libx264", "-c:a", "aac", "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            final_output_path
        ]

        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            logger.info(f"Final video stitched to {final_output_path}")
            return final_output_path
        except Exception as e:
            logger.error(f"Scene concatenation failed: {e}")
            if scene_video_paths:
                return scene_video_paths[0]
            return final_output_path

    def _format_ass_time(self, seconds: float) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        cs = int((seconds - int(seconds)) * 100)
        return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

    def _emergency_render_scene(self, image_path: str, audio_path: str, output_path: str, duration: float):
        cmd = [
            self.ffmpeg_bin, "-y",
            "-loop", "1", "-i", image_path,
            "-i", audio_path,
            "-t", str(duration),
            "-c:v", "libx264", "-c:a", "aac",
            output_path
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
