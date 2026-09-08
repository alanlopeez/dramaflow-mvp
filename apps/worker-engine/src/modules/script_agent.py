import os
import json
import logging
from typing import Dict, Any, List
try:
    from google.cloud import aiplatform
    import vertexai
    from vertexai.generative_models import GenerativeModel, GenerationConfig
    HAS_VERTEX_AI = True
except ImportError:
    HAS_VERTEX_AI = False
    GenerativeModel = None
    GenerationConfig = None

logger = logging.getLogger(__name__)

DRAMA_SYSTEM_INSTRUCTION = """
Sos un guionista experto en minidramas virales de alta retención para TikTok, Reels y Shorts en español argentino / rioplatense.
Tu misión es generar un guion de 3 a 5 escenas en formato vertical 9:16 con tensión dramática y ganchos extremos:

Fórmula:
1. Escena 1 (Gancho 0-3s): Frase de quiebre o conflicto extremo que frena el scroll.
2. Escenas 2-3 (Escalada): Tensión en aumento, revelación de secretos o confrontación directa ligada al problema de negocio.
3. Escenas 4-5 (Clímax y Resolución): La propuesta de valor del producto/servicio resuelve el conflicto con una victoria aplastante y un llamado a la acción orgánico.

El formato de salida DEBE ser un JSON estricto con este esquema:
{
  "title": "Título corto y viral",
  "hook": "Frase extrema de apertura",
  "logline": "Premisa en una oración",
  "characters": [
    {"name": "Elena", "voice_type": "founder_female", "role": "Protagonista / Fundadora"},
    {"name": "Marcos", "voice_type": "executive_male", "role": "Antagonista / Escéptico"}
  ],
  "scenes": [
    {
      "scene_number": 1,
      "duration_seconds": 5,
      "character": "Marcos",
      "dialogue": "Diálogo hablado en español con intensidad y urgencia.",
      "visual_prompt": "Toma cinematográfica vertical 9:16, iluminación dramática, 8k hiperrealista.",
      "camera_motion": "zoom_in",
      "sound_effect": "dramatic_boom"
    }
  ]
}
"""

class ScriptAgent:
    def __init__(self, project_id: str = None, location: str = "us-central1"):
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID", "dramaflow-mvp-1787884887")
        self.location = location or os.getenv("GCP_REGION", "us-central1")
        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        try:
            vertexai.init(project=self.project_id, location=self.location)
            self.model = GenerativeModel("gemini-2.0-flash-exp")
            logger.info("Vertex AI Gemini 2.0 Flash initialized successfully.")
        except Exception as e:
            logger.warning(f"Vertex AI initialization warning: {e}. Fallback mode active.")
            self.model = None

    async def generate_script(
        self,
        niche: str,
        value_prop: str,
        archetype: str,
        target_audience: str = "Audiencia joven y emprendedores en TikTok / Reels",
        custom_instructions: str = ""
    ) -> Dict[str, Any]:
        prompt = f"""
{DRAMA_SYSTEM_INSTRUCTION}

Parámetros del proyecto:
- Nicho / Industria: {niche}
- Propuesta de Valor del Negocio: {value_prop}
- Arquetipo de Tensión: {archetype}
- Público Objetivo: {target_audience}
- Instrucciones Adicionales: {custom_instructions}

Devolvé ÚNICAMENTE el objeto JSON sin bloques de texto adicionales.
"""
        if self.model:
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config=GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=2048,
                        response_mime_type="application/json"
                    )
                )
                raw_text = response.text.strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                
                return json.loads(raw_text.strip())
            except Exception as e:
                logger.error(f"Vertex AI generation error: {e}. Using intelligent fallback template.")
        
        # Fallback de alta calidad en español argentino
        return self._generate_fallback_script(niche, value_prop, archetype)

    def _generate_fallback_script(self, niche: str, value_prop: str, archetype: str) -> Dict[str, Any]:
        return {
            "title": f"El Secreto de {niche}",
            "hook": "Me echaste hoy, pero mañana vas a rogar por este sistema.",
            "logline": f"Una confrontación intensa en {niche} revela el poder de {value_prop}.",
            "characters": [
                {"name": "Elena", "voice_type": "founder_female", "role": "Fundadora Emprendedora"},
                {"name": "Marcos", "voice_type": "executive_male", "role": "Directivo Escéptico"}
            ],
            "scenes": [
                {
                    "scene_number": 1,
                    "duration_seconds": 5,
                    "character": "Marcos",
                    "dialogue": "Armá las valijas, Elena. Tu sistema acaba de destruir nuestra facturación del trimestre.",
                    "visual_prompt": f"Confrontación tensa en sala de directorio moderna de vidrio, iluminación dramática, contexto de {niche}, formato vertical 9:16 en 8k.",
                    "camera_motion": "zoom_in",
                    "sound_effect": "dramatic_boom"
                },
                {
                    "scene_number": 2,
                    "duration_seconds": 6,
                    "character": "Elena",
                    "dialogue": "Mirá bien las métricas, Marcos. No perdimos clientes, automatizamos todo el flujo y se multiplicó por cuatro.",
                    "visual_prompt": "Fundadora segura sosteniendo tablet transparente holográfica que muestra un salto de 400% en los gráficos de ventas.",
                    "camera_motion": "pan_up",
                    "sound_effect": "glitch_riser"
                },
                {
                    "scene_number": 3,
                    "duration_seconds": 6,
                    "character": "Marcos",
                    "dialogue": "Pará un segundo... ¿la retención subió un 400% en doce horas?! ¿Cómo carajos hiciste eso?",
                    "visual_prompt": "Directivo en shock mirando el panel de analíticas con incredulidad absoluta, iluminación volumétrica, formato 9:16.",
                    "camera_motion": "shake",
                    "sound_effect": "heartbeat_fast"
                },
                {
                    "scene_number": 4,
                    "duration_seconds": 7,
                    "character": "Elena",
                    "dialogue": f"Porque mientras vos te quejabas, nosotros implementamos {value_prop}. Probalo antes de que lo use tu competencia.",
                    "visual_prompt": f"Toma heroica del panel de {value_prop} en un estudio minimalista y moderno con destellos neón violeta y magenta.",
                    "camera_motion": "zoom_out",
                    "sound_effect": "epic_whoosh"
                }
            ]
        }
