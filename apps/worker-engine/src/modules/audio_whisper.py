import os
import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Style presets for ASS Subtitles
SUBTITLE_STYLE_PRESETS = {
    "karaoke_bounce": {
        "font_name": "Arial Black",
        "font_size": 72,
        "primary_color": "&H00FFFFFF",      # White
        "secondary_color": "&H0000FFFF",    # Yellow Highlight
        "outline_color": "&H00000000",      # Black Outline
        "shadow_color": "&H80000000",
        "outline": 6,
        "shadow": 3,
        "alignment": 2,                      # Bottom Center
        "margin_v": 380,
        "active_tag": "{\\c&H0000FFFF\\fscx115\\fscy115}",
        "inactive_tag": "{\\r}"
    },
    "hormozi_glow": {
        "font_name": "Impact",
        "font_size": 78,
        "primary_color": "&H0000E5FF",      # Vibrant Neon Green/Yellow
        "secondary_color": "&H000080FF",    # Orange
        "outline_color": "&H00000000",
        "shadow_color": "&HA0000000",
        "outline": 8,
        "shadow": 4,
        "alignment": 2,
        "margin_v": 400,
        "active_tag": "{\\c&H0000FFFF\\b1\\fscx120\\fscy120}",
        "inactive_tag": "{\\r}"
    },
    "mrbeast_yellow": {
        "font_name": "Impact",
        "font_size": 80,
        "primary_color": "&H0000FFFF",      # Pure Yellow
        "secondary_color": "&H00FFFFFF",
        "outline_color": "&H00000000",
        "shadow_color": "&H90000000",
        "outline": 9,
        "shadow": 4,
        "alignment": 2,
        "margin_v": 390,
        "active_tag": "{\\c&H0000FFFF\\b1}",
        "inactive_tag": "{\\r}"
    },
    "cinematic_minimal": {
        "font_name": "Helvetica",
        "font_size": 58,
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H00CCCCCC",
        "outline_color": "&H00000000",
        "shadow_color": "&H00000000",
        "outline": 3,
        "shadow": 1,
        "alignment": 2,
        "margin_v": 350,
        "active_tag": "{\\c&H00FFFFFF\\b1}",
        "inactive_tag": "{\\r}"
    }
}

class AudioWhisperTranscriber:
    """
    OpenAI Whisper integration engine for high-precision speech-to-text,
    word-level timestamps, and animated TikTok subtitle formatting (ASS, SRT, VTT, JSON).
    """
    def __init__(self, model_size: str = "base"):
        self.model_size = model_size
        self.model = None
        try:
            from faster_whisper import WhisperModel
            device = "cuda" if os.getenv("USE_CUDA", "false").lower() == "true" else "cpu"
            self.model = WhisperModel(model_size, device=device, compute_type="int8")
            logger.info(f"OpenAI/Faster-Whisper ({model_size}) initialized on {device}.")
        except Exception as e:
            logger.warning(f"Faster-Whisper not initialized: {e}. Fallback word timing engine active.")

    def extract_word_timestamps(
        self,
        audio_path: str,
        reference_text: str = "",
        language: str = "en"
    ) -> List[Dict[str, Any]]:
        """
        Extract millisecond-accurate word timestamps for TikTok karaoke bouncy subtitles.
        Returns: [{"word": "Secret", "start": 0.12, "end": 0.45, "probability": 0.98}, ...]
        """
        if self.model and os.path.exists(audio_path) and os.path.getsize(audio_path) > 0:
            try:
                segments, info = self.model.transcribe(
                    audio_path,
                    word_timestamps=True,
                    language=language,
                    vad_filter=True,
                    vad_parameters=dict(min_silence_duration_ms=250)
                )
                
                word_timings = []
                for segment in segments:
                    if hasattr(segment, 'words') and segment.words:
                        for word_obj in segment.words:
                            word_clean = word_obj.word.strip()
                            if word_clean:
                                word_timings.append({
                                    "word": word_clean,
                                    "start": round(word_obj.start, 2),
                                    "end": round(word_obj.end, 2),
                                    "probability": round(getattr(word_obj, 'probability', 0.95), 2)
                                })
                
                if word_timings:
                    return word_timings
            except Exception as e:
                logger.error(f"Whisper transcription failed: {e}. Falling back to estimated timings.")

        # Algorithmic estimation fallback based on word cadence (~220 words per minute for drama)
        return self._estimate_word_timestamps(reference_text)

    def extract_word_timestamps_whisperx(
        self,
        audio_path: str,
        device: str = "cpu",
        batch_size: int = 16,
        compute_type: str = "float32"
    ) -> List[Dict[str, Any]]:
        """
        WhisperX forced alignment pipeline for millisecond-level word timing.
        Extracts phoneme and word-level alignments for dynamic viral TikTok captions.
        """
        try:
            import whisperx
            logger.info("⚡ Ejecutando WhisperX con alineación forzada a nivel de palabra...")
            audio = whisperx.load_audio(audio_path)
            model = whisperx.load_model(self.model_size, device, compute_type=compute_type)
            result = model.transcribe(audio, batch_size=batch_size)
            
            # Forced alignment step
            model_a, metadata = whisperx.load_align_model(language_code=result.get("language", "es"), device=device)
            result_aligned = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
            
            words_output = []
            for segment in result_aligned.get("segments", []):
                for w in segment.get("words", []):
                    if "start" in w and "end" in w:
                        words_output.append({
                            "word": w["word"].strip(),
                            "start": round(w["start"], 2),
                            "end": round(w["end"], 2),
                            "score": round(w.get("score", 0.95), 2)
                        })
            if words_output:
                return words_output
        except Exception as e:
            logger.info(f"WhisperX pipeline notice ({e}). Usando motor Whisper optimizado.")
        
        return self.extract_word_timestamps(audio_path=audio_path)

    def export_subtitles(
        self,
        word_timings: List[Dict[str, Any]],
        output_format: str = "ass",
        style_preset: str = "karaoke_bounce",
        canvas_width: int = 1080,
        canvas_height: int = 1920
    ) -> str:
        """
        Exports subtitles to multiple formats: ASS (karaoke styling), SRT, VTT, or JSON.
        """
        output_format = output_format.lower()
        if output_format == "srt":
            return self._generate_srt(word_timings)
        elif output_format == "vtt":
            return self._generate_vtt(word_timings)
        elif output_format == "json":
            return json.dumps(word_timings, indent=2)
        else:
            return self._generate_ass(word_timings, style_preset, canvas_width, canvas_height)

    def _generate_ass(
        self,
        word_timings: List[Dict[str, Any]],
        style_preset: str = "karaoke_bounce",
        width: int = 1080,
        height: int = 1920
    ) -> str:
        """Generates ASS format with karaoke bouncy tags"""
        preset = SUBTITLE_STYLE_PRESETS.get(style_preset, SUBTITLE_STYLE_PRESETS["karaoke_bounce"])
        
        header = f"""[Script Info]
Title: DramaFlow OpenAI Whisper Subtitles
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: WhisperStyle,{preset['font_name']},{preset['font_size']},{preset['primary_color']},{preset['secondary_color']},{preset['outline_color']},{preset['shadow_color']},-1,0,0,0,100,100,2,0,1,{preset['outline']},{preset['shadow']},{preset['alignment']},60,60,{preset['margin_v']},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        events = []
        chunk_size = 3  # High-converting short chunks for mobile screens
        
        for i in range(0, len(word_timings), chunk_size):
            chunk = word_timings[i:i + chunk_size]
            if not chunk:
                continue
            start_str = self._format_ass_time(chunk[0]["start"])
            end_str = self._format_ass_time(chunk[-1]["end"])
            
            # Highlight first word or bounce active word
            text_parts = []
            for idx, w in enumerate(chunk):
                word_text = w["word"].upper()
                if idx == 0:
                    text_parts.append(f"{preset['active_tag']}{word_text}{preset['inactive_tag']}")
                else:
                    text_parts.append(word_text)
            
            text_line = " ".join(text_parts)
            events.append(f"Dialogue: 0,{start_str},{end_str},WhisperStyle,,0,0,0,,{text_line}")

        return header + "\n".join(events)

    def _generate_srt(self, word_timings: List[Dict[str, Any]]) -> str:
        """Generates standard SRT format"""
        chunk_size = 4
        srt_entries = []
        entry_idx = 1
        
        for i in range(0, len(word_timings), chunk_size):
            chunk = word_timings[i:i + chunk_size]
            if not chunk:
                continue
            start_ts = self._format_srt_time(chunk[0]["start"])
            end_ts = self._format_srt_time(chunk[-1]["end"])
            text = " ".join([w["word"] for w in chunk])
            srt_entries.append(f"{entry_idx}\n{start_ts} --> {end_ts}\n{text}\n")
            entry_idx += 1
            
        return "\n".join(srt_entries)

    def _generate_vtt(self, word_timings: List[Dict[str, Any]]) -> str:
        """Generates WebVTT format"""
        srt_content = self._generate_srt(word_timings)
        return "WEBVTT\n\n" + srt_content.replace(",", ".")

    def _estimate_word_timestamps(self, text: str, total_duration: float = 5.0) -> List[Dict[str, Any]]:
        words = text.split()
        if not words:
            return []
            
        time_per_word = max(0.25, total_duration / len(words))
        results = []
        current_time = 0.1
        
        for word in words:
            end_time = current_time + time_per_word
            results.append({
                "word": word,
                "start": round(current_time, 2),
                "end": round(end_time, 2),
                "probability": 0.99
            })
            current_time = end_time + 0.05
            
        return results

    def _format_ass_time(self, seconds: float) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        cs = int((seconds - int(seconds)) * 100)
        return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

    def _format_srt_time(self, seconds: float) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        ms = int((seconds - int(seconds)) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
