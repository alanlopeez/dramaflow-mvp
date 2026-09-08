import { generateDramaScriptWithNexoRouter, AIModelOption, NEXO_ROUTER_MODELS } from './nexo-router';
import { VertexAI } from '@google-cloud/vertexai';
import { GCP_PROJECT_ID, GCP_REGION, getGcpServiceAccountKeyPath } from './gcp-config';

let vertexAiClient: VertexAI | null = null;
try {
  const keyPath = getGcpServiceAccountKeyPath();
  if (keyPath) {
    vertexAiClient = new VertexAI({
      project: GCP_PROJECT_ID,
      location: GCP_REGION,
      googleAuthOptions: { keyFilename: keyPath },
    });
  }
} catch (e) {
  console.warn('Vertex AI client init note:', e);
}

export interface DramaScene {
  scene_number: number;
  duration_seconds: number;
  character: string;
  dialogue: string;
  visual_prompt: string;
  imageUrl?: string;
  videoUrl?: string;
  voice_id?: string;
  camera_motion: 'zoom_in' | 'zoom_out' | 'pan_up' | 'shake' | 'static';
  sound_effect?: string;
}

export interface DramaScriptPayload {
  title: string;
  hook: string;
  logline: string;
  characters: Array<{
    name: string;
    voice_type: string;
    role: string;
    imageUrl?: string;
  }>;
  scenes: DramaScene[];
}

export interface CustomCharacterInput {
  id?: string;
  name: string;
  role: string;
  imageUrl: string;
  voiceProfile?: string;
}

export interface CustomPropInput {
  name: string;
  category: string;
  imageUrl: string;
  sceneTarget: number;
}

export interface CustomLocationInput {
  name: string;
  imageUrl: string;
  sceneNumber: number;
}

export async function generateDramaScriptWithGemini(
  niche: string = 'Bienes Raíces e Inmobiliarias',
  valueProp: string = 'vender tu casa en 30 días con la llave de prospectos exclusivos',
  archetype: string = 'Fundador Subestimado vs Cliente Escéptico',
  customInstructions: string = '',
  targetAudience: string = 'Propietarios que quieren vender su inmueble',
  customCharacters?: CustomCharacterInput[],
  customProps?: CustomPropInput[],
  customLocations?: CustomLocationInput[],
  model: string = 'google/gemini-2.0-flash-001'
): Promise<DramaScriptPayload> {
  const char1Name = customCharacters?.[0]?.name?.trim() || 'Marcos';
  const char1Role = customCharacters?.[0]?.role?.trim() || 'Antagonista / Escéptico';
  const char1Img = customCharacters?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1080&h=1920&fit=crop&q=80';
  const char1Voice = customCharacters?.[0]?.voiceProfile || 'executive_male';

  const char2Name = customCharacters?.[1]?.name?.trim() || 'Elena';
  const char2Role = customCharacters?.[1]?.role?.trim() || 'Protagonista / Estratega';
  const char2Img = customCharacters?.[1]?.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80';
  const char2Voice = customCharacters?.[1]?.voiceProfile || 'founder_female';

  // 1. Try Vertex AI Gemini natively if configured
  if (vertexAiClient && model.includes('gemini')) {
    try {
      const generativeModel = vertexAiClient.getGenerativeModel({
        model: 'gemini-1.5-flash-001',
      });
      const prompt = `Actúa como guionista profesional de minidramas virales de TikTok en español (9:16 vertical).
Nicho: ${niche}
Propuesta de Valor: ${valueProp}
Arquetipo: ${archetype}
Público objetivo: ${targetAudience}
Personaje 1: ${char1Name} (${char1Role})
Personaje 2: ${char2Name} (${char2Role})
Instrucciones: ${customInstructions}

Genera un guión estructurado en exactamente 4 escenas de alto impacto dramático en formato JSON con la siguiente estructura:
{
  "title": "Título llamativo",
  "hook": "Gancho inicial de 3 segundos",
  "logline": "Resumen de la trama",
  "characters": [
    {"name": "${char1Name}", "voice_type": "${char1Voice}", "role": "${char1Role}"},
    {"name": "${char2Name}", "voice_type": "${char2Voice}", "role": "${char2Role}"}
  ],
  "scenes": [
    {
      "scene_number": 1,
      "duration_seconds": 6,
      "character": "${char1Name}",
      "dialogue": "Diálogo potente",
      "visual_prompt": "Prompt visual cinemático",
      "camera_motion": "zoom_in",
      "sound_effect": "dramatic_boom"
    }
  ]
}`;
      const res = await generativeModel.generateContent(prompt);
      const text = res.response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.scenes && parsed.scenes.length > 0) {
          console.log('✅ Generated drama script with official Google Cloud Vertex AI Gemini!');
          return parsed;
        }
      }
    } catch (vertexErr) {
      console.warn('Vertex AI native call fallback to Nexo router:', vertexErr);
    }
  }

  // 2. High-performance Nexo Router (Gemini 2.0 / Claude 3.5)
  try {
    const script = await generateDramaScriptWithNexoRouter({
      niche,
      valueProp,
      archetype,
      customInstructions,
      targetAudience,
      model,
      customCharacters: [
        { name: char1Name, role: char1Role, imageUrl: char1Img, voiceProfile: char1Voice },
        { name: char2Name, role: char2Role, imageUrl: char2Img, voiceProfile: char2Voice },
      ],
    });

    if (script && script.scenes && script.scenes.length > 0) {
      script.scenes = script.scenes.map((s: any, idx: number) => {
        const customLoc = customLocations?.find(l => l.sceneNumber === (idx + 1));
        return {
          ...s,
          imageUrl: customLoc ? customLoc.imageUrl : ((s.character === char1Name || idx % 2 === 0) ? char1Img : char2Img),
        };
      });
      return script;
    }
  } catch (err: any) {
    console.error('Nexo router generation error:', err);
  }

  // 3. Graceful high-tension fallback
  return {
    title: `El Giro Decisivo en ${niche}`,
    hook: `¡Frená todo, ${char2Name}! ¿Cómo lograste estos resultados en ${niche}?`,
    logline: `Una confrontación decisiva entre ${char1Name} y ${char2Name} demuestra el poder de ${valueProp}.`,
    characters: [
      { name: char1Name, voice_type: char1Voice, role: char1Role, imageUrl: char1Img },
      { name: char2Name, voice_type: char2Voice, role: char2Role, imageUrl: char2Img }
    ],
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 6,
        character: char1Name,
        dialogue: `¡Frená todo, ${char2Name}! ¿Me estás diciendo que con ${char2Role} no podemos resolver esto en ${niche}?`,
        visual_prompt: `8k vertical portrait, tense corporate boardroom conflict with ${char1Name}, dramatic lighting, 85mm lens, photorealistic`,
        imageUrl: char1Img,
        camera_motion: "zoom_in",
        sound_effect: "dramatic_boom"
      },
      {
        scene_number: 2,
        duration_seconds: 6,
        character: char2Name,
        dialogue: `Tranquilo, ${char1Name}. Mirá los datos en tiempo real: activamos ${valueProp} y multiplicamos las ventas por cuatro.`,
        visual_prompt: `8k vertical portrait, confident executive ${char2Name} holding tablet with analytics dashboard, volumetric lighting, photorealistic`,
        imageUrl: char2Img,
        camera_motion: "pan_up",
        sound_effect: "glitch_riser"
      },
      {
        scene_number: 3,
        duration_seconds: 6,
        character: char1Name,
        dialogue: `Pará un segundo... ¿cómo conseguiste triplicar los clientes calificados en menos de 48 horas?!`,
        visual_prompt: `8k vertical close-up, ${char1Name} looking in utter disbelief and astonishment at the screen, cinematic bokeh`,
        imageUrl: char1Img,
        camera_motion: "shake",
        sound_effect: "heartbeat_fast"
      },
      {
        scene_number: 4,
        duration_seconds: 7,
        character: char2Name,
        dialogue: `Porque dejamos de perder tiempo y aplicamos ${valueProp}. Si querés el mismo resultado para tu negocio, escribinos ahora.`,
        visual_prompt: `8k vertical heroic shot of ${char2Name}, warm cinematic sunset lighting, triumphant executive posture`,
        imageUrl: char2Img,
        camera_motion: "zoom_out",
        sound_effect: "epic_whoosh"
      }
    ]
  };
}
